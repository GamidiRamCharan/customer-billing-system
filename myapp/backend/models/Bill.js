const mongoose = require("mongoose");

const BillSchema = new mongoose.Schema({
  customerName: String,
  phone: String,
  city: String,
  items: [
    {
      item: { type: mongoose.Schema.Types.ObjectId, ref: "Item" },
      quantity: Number,
      price: Number
    }
  ],
  total: Number,
  createdAt: { type: Date, default: Date.now }
});

const RealBillModel = mongoose.model("Bill", BillSchema);

const mockBills = [];

class MockBillModel {
  constructor(data) {
    Object.assign(this, data);
  }
  async save() {
    // calculate total if not provided
    if (this.total === undefined) {
      this.total = this.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    }
    mockBills.push(this);
    return this;
  }
  static async find() {
    return mockBills;
  }
}

const BillProxy = new Proxy(function() {}, {
  construct(target, args) {
    if (process.env.USE_MOCK_DB === "true") {
      return new MockBillModel(...args);
    } else {
      return new RealBillModel(...args);
    }
  },
  get(target, prop) {
    if (process.env.USE_MOCK_DB === "true") {
      return MockBillModel[prop];
    } else {
      return RealBillModel[prop];
    }
  }
});

module.exports = BillProxy;

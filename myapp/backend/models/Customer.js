const mongoose = require("mongoose");

const CustomerSchema = new mongoose.Schema({
  name: String,
  mobile: String,
  city: String
});

const RealCustomerModel = mongoose.model("Customer", CustomerSchema);

let mockIdCounter = 1;
const mockCustomers = [
  { _id: 'mock1', name: "Ram",    mobile: "9876543210" },
  { _id: 'mock2', name: "Charan", mobile: "8765432109" },
  { _id: 'mock3', name: "Suresh", mobile: "7654321098" },
  { _id: 'mock4', name: "Anil",   mobile: "6543210987" }
];

class MockCustomerModel {
  constructor(data) {
    this._id = `mock${++mockIdCounter}`;
    Object.assign(this, data);
  }

  async save() {
    mockCustomers.push(this);
    return this;
  }

  static async find() {
    return mockCustomers;
  }

  static async findByIdAndUpdate(id, data, opts) {
    const idx = mockCustomers.findIndex((c) => c._id === id);
    if (idx === -1) return null;
    Object.assign(mockCustomers[idx], data);
    return mockCustomers[idx];
  }

  static async findByIdAndDelete(id) {
    const idx = mockCustomers.findIndex((c) => c._id === id);
    if (idx === -1) return null;
    const [deleted] = mockCustomers.splice(idx, 1);
    return deleted;
  }
}

const CustomerProxy = new Proxy(function() {}, {
  construct(target, args) {
    if (process.env.USE_MOCK_DB === "true") {
      return new MockCustomerModel(...args);
    } else {
      return new RealCustomerModel(...args);
    }
  },
  get(target, prop) {
    if (process.env.USE_MOCK_DB === "true") {
      return MockCustomerModel[prop];
    } else {
      return RealCustomerModel[prop];
    }
  }
});

module.exports = CustomerProxy;

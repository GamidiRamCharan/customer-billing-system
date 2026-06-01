const mongoose = require("mongoose");

const UserSchema =
  new mongoose.Schema({

    firstName: String,

    lastName: String,

    mobile: String,

    email: String,

    password: String

});

const RealUserModel =
  mongoose.model("User", UserSchema);

const mockUsers = [];

class MockUserModel {
  constructor(data) {
    Object.assign(this, data);
  }

  async save() {
    if (mockUsers.some(u => u.email === this.email)) {
      throw new Error("User already exists");
    }
    mockUsers.push(this);
    return this;
  }

  static async findOne(query) {
    const found = mockUsers.find(user => user.email === query.email);
    if (found) {
      return new MockUserModel(found);
    }
    return null;
  }
}

const UserProxy = new Proxy(function() {}, {
  construct(target, args) {
    if (process.env.USE_MOCK_DB === "true") {
      return new MockUserModel(...args);
    } else {
      return new RealUserModel(...args);
    }
  },
  get(target, prop) {
    if (process.env.USE_MOCK_DB === "true") {
      return MockUserModel[prop];
    } else {
      return RealUserModel[prop];
    }
  }
});

module.exports = UserProxy;
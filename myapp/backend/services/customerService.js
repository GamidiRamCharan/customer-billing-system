const Customer = require('../models/Customer');

/** Get all customers */
async function getAll() {
  return Customer.find({});
}

/** Create a new customer */
async function create(data) {
  const customer = new Customer(data);
  return customer.save();
}

/** Update a customer by id */
async function update(id, data) {
  return Customer.findByIdAndUpdate(id, data, { new: true });
}

/** Delete a customer by id */
async function remove(id) {
  return Customer.findByIdAndDelete(id);
}

module.exports = {
  getAll,
  create,
  update,
  remove
};

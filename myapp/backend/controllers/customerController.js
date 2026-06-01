const asyncHandler = require('express-async-handler');
const customerService = require('../services/customerService');

// @desc    Get all customers
// @route   GET /api/customers
// @access  Private
exports.getCustomers = asyncHandler(async (req, res) => {
  const customers = await customerService.getAll();
  res.json(customers);
});

// @desc    Create a new customer
// @route   POST /api/customers
// @access  Private
exports.createCustomer = asyncHandler(async (req, res) => {
  const newCustomer = await customerService.create(req.body);
  res.status(201).json(newCustomer);
});

// @desc    Update a customer
// @route   PUT /api/customers/:id
// @access  Private
exports.updateCustomer = asyncHandler(async (req, res) => {
  const updated = await customerService.update(req.params.id, req.body);
  if (!updated) {
    res.status(404);
    throw new Error('Customer not found');
  }
  res.json(updated);
});

// @desc    Delete a customer
// @route   DELETE /api/customers/:id
// @access  Private
exports.deleteCustomer = asyncHandler(async (req, res) => {
  const deleted = await customerService.remove(req.params.id);
  if (!deleted) {
    res.status(404);
    throw new Error('Customer not found');
  }
  res.json({ message: 'Customer deleted successfully' });
});

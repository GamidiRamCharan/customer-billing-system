const asyncHandler = require('express-async-handler');
const billService = require('../services/billService');

// @desc    Get all bills
// @route   GET /api/bills
// @access  Private
exports.getBills = asyncHandler(async (req, res) => {
  const bills = await billService.list();
  res.json(bills);
});

// @desc    Create a new bill
// @route   POST /api/bills
// @access  Private
exports.createBill = asyncHandler(async (req, res) => {
  const bill = await billService.create(req.body);
  res.status(201).json(bill);
});

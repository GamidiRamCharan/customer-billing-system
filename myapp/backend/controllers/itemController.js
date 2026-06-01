const asyncHandler = require('express-async-handler');
const itemService = require('../services/itemService');

// @desc    Get all items (paginated)
// @route   GET /api/items
// @access  Private
exports.getItems = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const result = await itemService.getAll({ page, limit });
  res.json(result);
});

// @desc    Get single item by ID
// @route   GET /api/items/:id
// @access  Private
exports.getItem = asyncHandler(async (req, res) => {
  const item = await itemService.getById(req.params.id);
  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }
  res.json(item);
});

// @desc    Create new item
// @route   POST /api/items
// @access  Private
exports.createItem = asyncHandler(async (req, res) => {
  const newItem = await itemService.create(req.body);
  res.status(201).json(newItem);
});

// @desc    Update existing item
// @route   PUT /api/items/:id
// @access  Private
exports.updateItem = asyncHandler(async (req, res) => {
  const updated = await itemService.update(req.params.id, req.body);
  res.json(updated);
});

// @desc    Delete item
// @route   DELETE /api/items/:id
// @access  Private
exports.deleteItem = asyncHandler(async (req, res) => {
  await itemService.remove(req.params.id);
  res.status(204).send();
});

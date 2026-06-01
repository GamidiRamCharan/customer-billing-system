const Item = require('../models/Item');

/**
 * Get all items with pagination.
 * @param {{ page: number, limit: number }} options
 * @returns {Promise<{ items: any[], total: number, page: number, limit: number }>}
 */
async function getAll({ page, limit }) {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Item.find({}).skip(skip).limit(limit),
    Item.countDocuments({})
  ]);
  return { items, total, page, limit };
}

/** Get a single item by ID */
async function getById(id) {
  return Item.findById(id);
}

/** Create a new item */
async function create(data) {
  const item = new Item(data);
  return item.save();
}

/** Update an existing item */
async function update(id, data) {
  return Item.findByIdAndUpdate(id, data, { new: true });
}

/** Remove an item */
async function remove(id) {
  return Item.findByIdAndDelete(id);
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove
};

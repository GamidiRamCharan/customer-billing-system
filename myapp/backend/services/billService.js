const Bill = require('../models/Bill');
const Customer = require('../models/Customer');
const Item = require('../models/Item');

/**
 * Create a new bill.
 * @param {{ customerName: string, phone: string, city: string, items: Array<{ item: string, quantity: number }> }} data
 * @returns {Promise<any>} saved bill
 */
async function create(data) {
  const { customerName, phone, city, items } = data;
  // Populate item details and compute total
  const detailedItems = await Promise.all(
    items.map(async (i) => {
      const item = await Item.findById(i.item);
      if (!item) throw new Error('Item not found');
      return { item: item._id, name: item.name, price: item.price, quantity: i.quantity };
    })
  );
  const total = detailedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const bill = new Bill({ customerName, phone, city, items: detailedItems, total });
  return bill.save();
}

/** List all bills with populated item info */
async function list() {
  return Bill.find()
    .populate('items.item', 'name price')
    .exec();
}

module.exports = { create, list };

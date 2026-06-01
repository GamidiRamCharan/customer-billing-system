const router = require('express').Router();
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const Joi = require('joi');

// Validation schemas
const itemCreateSchema = Joi.object({
  name: Joi.string().required(),
  price: Joi.number().required(),
  quantity: Joi.number().integer().min(0).required(),
  description: Joi.string().allow('').optional()
});

const itemUpdateSchema = Joi.object({
  name: Joi.string().optional(),
  price: Joi.number().optional(),
  quantity: Joi.number().integer().min(0).optional(),
  description: Joi.string().allow('').optional()
});

const {
  getItems,
  getItem,
  createItem,
  updateItem,
  deleteItem
} = require('../controllers/itemController');

// Apply auth middleware to all routes
router.use(auth);

// GET ALL ITEMS (pagination support via query params)
router.get('/', getItems);

// GET SINGLE ITEM
router.get('/:id', getItem);

// CREATE ITEM (validate request body)
router.post('/', validate(itemCreateSchema), createItem);

// UPDATE ITEM (validate request body)
router.put('/:id', validate(itemUpdateSchema), updateItem);

// DELETE ITEM
router.delete('/:id', deleteItem);

module.exports = router;

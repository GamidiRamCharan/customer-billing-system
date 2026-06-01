const router = require('express').Router();
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const Joi = require('joi');

// Validation schema for creating a customer
const customerCreateSchema = Joi.object({
  name: Joi.string().required(),
  mobile: Joi.string().required(),
  city: Joi.string().optional().allow('')
});

// Validation schema for updating a customer (all fields optional)
const customerUpdateSchema = Joi.object({
  name: Joi.string().optional(),
  mobile: Joi.string().optional(),
  city: Joi.string().optional().allow('')
});

const { getCustomers, createCustomer, updateCustomer, deleteCustomer } = require('../controllers/customerController');

// Apply auth middleware to all customer routes
router.use(auth);

// GET all customers
router.get('/', getCustomers);

// CREATE a new customer with validation
router.post('/', validate(customerCreateSchema), createCustomer);

// UPDATE a customer
router.put('/:id', validate(customerUpdateSchema), updateCustomer);

// DELETE a customer
router.delete('/:id', deleteCustomer);

module.exports = router;

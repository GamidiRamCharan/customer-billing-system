const router = require('express').Router();
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const Joi = require('joi');

// Validation schema for creating a bill
const billCreateSchema = Joi.object({
  customerName: Joi.string().required(),
  phone: Joi.string().required(),
  city: Joi.string().required(),
  items: Joi.array()
    .items(
      Joi.object({
        item: Joi.string().required(),
        quantity: Joi.number().integer().min(1).required()
      })
    )
    .min(1)
    .required()
});

const { createBill, getBills } = require('../controllers/billController');

// Apply auth middleware to all bill routes
router.use(auth);

// CREATE BILL
router.post('/', validate(billCreateSchema), createBill);

// LIST BILLS
router.get('/', getBills);

module.exports = router;

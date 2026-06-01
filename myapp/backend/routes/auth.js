const router =
  require("express").Router();

const User =
  require("../models/User");

// REGISTER
router.post("/register",
async (req, res) => {

  try {

    const newUser =
      new User(req.body);

    await newUser.save();

    res.json("User Registered");

  }
  catch(err) {

    res.status(500).json(err);

  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ error: 'User Not Found' });
    }
    if (user.password !== req.body.password) {
      return res.status(401).json({ error: 'Wrong Password' });
    }
    // generate JWT token
    const { signToken } = require('../utils/jwt');
    const token = signToken({ id: user._id, email: user.email });
    res.json({ token, userId: user._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
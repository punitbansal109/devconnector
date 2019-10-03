const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
// User Model
const User = require('../../models/User');

// @route   POST api/users
// @desc    Test route
// @access  Public
router.post(
  '/',
  [
    // username must be an email
    check('name', 'Name is required')
      .not()
      .isEmpty(),
    // password must be at least 5 chars long
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'please enter password with min 6 chars').isLength({
      min: 6
    })
  ],
  async (req, res) => {
    console.log(req.body);
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, email, password } = req.body;

    try {
      // see is user registered
      let user = await User.findOne({ email });

      if (user) {
        res.status(400).json({
          errors: [{ msg: 'user already exists' }]
        });
      }

      //get users gravatar
      const avatar = gravatar.url(email, {
        s: 200,
        r: 'pg',
        d: 'mm'
      });

      user = new User({
        name,
        email,
        avatar,
        password
      });
      //encrypt password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();
      //return jsonwebtoken for user to login
      res.send('user registered');
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;

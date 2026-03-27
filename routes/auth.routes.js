const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User');

const {jwtSecret} = require('../config');



router.post('/register', async (req,res) => {
    const {email, password} = req.body;

    if (!email || !email.includes('@') || !password) {
        return res.status(400).json({message: 'Invalid Credentials'});
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({message: 'User already exists'});
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
        email,
        password: hashedPassword,
        role: 'user'
    });

    res.status(201).json({
        id: newUser._id,
        email: newUser.email
    });
});

router.post('/login', async (req,res) => {
    const {email, password} = req.body;

    if (!email || !email.includes('@') || !password) {
        return res.status(400).json({message: 'Invalid Input'});
    }

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({message: 'User does not exist'});
    }

    const isPassword = await bcrypt.compare(password, user.password);
    if (!isPassword) {
        return res.status(400).json({message: 'Invalid Password'});
    }

    const payload = {
        _id: user._id,
        role: user.role,
    };

    const token = jwt.sign(payload, jwtSecret, {expiresIn: '1h'});

    res.json({token});
});
router.get('/me', authMiddleware, async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    return res.json(user);
});
module.exports = router;

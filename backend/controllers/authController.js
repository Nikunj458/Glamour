import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (await User.findOne({ email }))
      return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ name, email, password });
    res.status(201).json({ user, token: generateToken(user._id) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: 'Invalid credentials' });

    res.json({ user, token: generateToken(user._id) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMe = async (req, res) => {
  res.json(req.user);
};

export const seedAdmin = async (req, res) => {
  try {
    const exists = await User.findOne({ email: process.env.ADMIN_EMAIL });
    if (exists) return res.json({ message: 'Admin already exists' });

    await User.create({
      name: 'Admin',
      email: process.env.ADMIN_EMAIL || 'admin@boutique.com',
      password: process.env.ADMIN_PASSWORD || 'Admin@123',
      role: 'admin'
    });
    res.json({ message: 'Admin seeded successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
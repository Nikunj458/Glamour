import User from '../models/User.js';

export const getFavourites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('favourites');
    res.json(user.favourites);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const toggleFavourite = async (req, res) => {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.user._id);
    const idx = user.favourites.indexOf(productId);

    if (idx === -1) {
      user.favourites.push(productId);
    } else {
      user.favourites.splice(idx, 1);
    }

    await user.save();
    res.json({ favourites: user.favourites, added: idx === -1 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
const User = require('../models/user');
const Product = require('../models/product');

exports.createUser = async (req, res) => {
  try {
    const { name, email } = req.body;

    const user = new User({
      name,
      email
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      userId: user._id,
      user
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.fetchUserById = async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findUserById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    const userData = await User.findUserById(userId);
    const product = await Product.findById(productId);

    if (!userData) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    await userData.addToCart(product);

    res.status(200).json({
      success: true,
      message: 'Product added to cart successfully'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
// controllers/userController.js
exports.deleteCartItem = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({
        success: false,
        message: 'User id and product id are required'
      });
    }

    const user = await User.findUserById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await user.deleteCartItem(productId);

    res.json({
      success: true,
      message: 'Product removed from cart',
      user
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
exports.createOrder = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findUserById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const order = await user.addOrder();

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order,
      user
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

exports.fetchOrders = async (req, res) => {
  try {

    const userId = req.params.userId;

    const orders = await User.fetchOrders(userId);

    res.status(200).json({
      success: true,
      orders
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

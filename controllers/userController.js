const User = require('../models/user');
const Product = require('../models/product');

exports.createUser = async (req, res) => {
  try {
    const { name, email } = req.body;

    const user = new User(name, email);
    const result = await user.save();

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      userId: result.insertedId
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.fetchUserById = async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findUserById(userId);

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

    const user = new User(
      userData.name,
      userData.email,
      userData._id,
      userData.cart
    );

    await user.addToCart(product);

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
  const { userId, productId } = req.body;

  const userData = await User.findUserById(userId);

  const user = new User(
    userData.name,
    userData.email,
    userData._id,
    userData.cart
  );

  await user.deleteCartItem(productId);

  res.json({
    success: true,
    message: 'Product removed from cart'
  });
};
exports.createOrder = async (req, res) => {
  try {
    const { userId } = req.body;

    const userData = await User.findUserById(userId);

    const user = new User(
      userData.name,
      userData.email,
      userData._id,
      userData.cart
    );

    await user.addOrder();

    res.status(201).json({
      success: true,
      message: 'Order placed successfully'
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

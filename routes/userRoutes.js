const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

router.post('/users', userController.createUser);

router.get('/users/:userId', userController.fetchUserById);

router.post('/cart', userController.addToCart);

router.delete('/cart', userController.deleteCartItem);

router.post('/orders', userController.createOrder);

router.get('/orders/:userId', userController.fetchOrders);

module.exports = router;
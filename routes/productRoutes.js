const express = require('express');

const productController = require('../controllers/productController');

const router = express.Router();

// CREATE PRODUCT
router.post('/products', productController.createProduct);

// SHOP FETCH ALL PRODUCTS
router.get('/products', productController.fetchProducts);

// ADMIN FETCH PRODUCTS
router.get('/admin/products', productController.adminFetchProducts);

// FETCH SINGLE PRODUCT
router.get('/products/:productId', productController.fetchSingleProduct);

// UPDATE PRODUCT
router.put('/products/:productId', productController.updateProduct);

// DELETE PRODUCT
router.delete('/products/:productId', productController.deleteProduct);

module.exports = router;
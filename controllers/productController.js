const Product = require('../models/product');

exports.createProduct = async (req, res) => {
  try {
    const { title, price, description } = req.body;

    const product = new Product({
      title,
      price,
      description
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product
    });

  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: 'Something went wrong'
    });
  }
};

// SHOP FETCH PRODUCTS
exports.fetchProducts = async (req, res) => {
  try {
    const products = await Product.fetchAll();

    res.status(200).json({
      success: true,
      products
    });

  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: 'Error fetching products'
    });
  }
};

// ADMIN FETCH PRODUCTS
exports.adminFetchProducts = async (req, res) => {
  try {
    const products = await Product.fetchAll();

    res.status(200).json({
      success: true,
      products
    });

  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: 'Admin fetch failed'
    });
  }
};

// FETCH SINGLE PRODUCT
exports.fetchSingleProduct = async (req, res) => {
  try {
    const prodId = req.params.productId;

    const product = await Product.findById(prodId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      product
    });

  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: 'Error fetching product'
    });
  }
};

// UPDATE PRODUCT
exports.updateProduct = async (req, res) => {
  try {
    const prodId = req.params.productId;

    const { title, price, description } = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(
      prodId,
      {
        title,
        price,
        description
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct
    });

  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: 'Update failed'
    });
  }
};

// DELETE PRODUCT
exports.deleteProduct = async (req, res) => {
  try {
    const prodId = req.params.productId;

    const deletedProduct = await Product.deleteById(prodId);

    if (!deletedProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: 'Delete failed'
    });
  }
};

const mongoose = require('mongoose');
const Order = require('./order');

const cartItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    }
  },
  {
    _id: false
  }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    cart: {
      items: {
        type: [cartItemSchema],
        default: []
      }
    }
  },
  {
    collection: 'users',
    timestamps: true
  }
);

userSchema.statics.findUserById = function (userId) {
  return this.findById(userId);
};

userSchema.methods.addToCart = function (product) {
  const cartProductIndex = this.cart.items.findIndex((item) => {
    return item.productId.toString() === product._id.toString();
  });

  if (cartProductIndex >= 0) {
    this.cart.items[cartProductIndex].quantity += 1;
  } else {
    this.cart.items.push({
      productId: product._id,
      quantity: 1
    });
  }

  return this.save();
};

userSchema.methods.deleteCartItem = function (productId) {
  this.cart.items = this.cart.items.filter((item) => {
    return item.productId.toString() !== productId.toString();
  });

  return this.save();
};

userSchema.methods.addOrder = async function () {
  if (!this.cart.items.length) {
    throw new Error('Cart is empty');
  }

  const order = await Order.create({
    items: this.cart.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity
    })),
    user: {
      _id: this._id,
      name: this.name,
      email: this.email
    }
  });

  this.cart.items = [];

  await this.save();

  return order;
};

userSchema.statics.fetchOrders = function (userId) {
  return Order.find({ 'user._id': userId })
    .populate('items.productId')
    .sort({ createdAt: -1 });
};

module.exports = mongoose.model('User', userSchema);

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    description: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    collection: 'products',
    timestamps: true
  }
);

productSchema.statics.fetchAll = function () {
  return this.find().sort({ createdAt: -1 });
};

productSchema.statics.deleteById = function (productId) {
  return this.findByIdAndDelete(productId);
};

module.exports = mongoose.model('Product', productSchema);

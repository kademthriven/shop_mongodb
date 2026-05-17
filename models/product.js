const { ObjectId } = require('mongodb');
const getDb = require('../utli/database').getDb;

class Product {
  constructor(title, price, description, id) {
    this.title = title;
    this.price = price;
    this.description = description;

    if (id) {
      this._id = new ObjectId(id);
    }
  }

  async save() {
    const db = getDb();

    // UPDATE
    if (this._id) {
      return db.collection('products').updateOne(
        { _id: this._id },
        {
          $set: {
            title: this.title,
            price: this.price,
            description: this.description
          }
        }
      );
    }

    // CREATE
    return db.collection('products').insertOne(this);
  }

  // SHOP SIDE FETCH PRODUCTS
  static fetchAll() {
    const db = getDb();

    return db.collection('products').find().toArray();
  }

  // FETCH SINGLE PRODUCT
  static findById(prodId) {
    const db = getDb();

    return db.collection('products').findOne({
      _id: new ObjectId(prodId)
    });
  }

  // DELETE PRODUCT
  static deleteById(prodId) {
    const db = getDb();

    return db.collection('products').deleteOne({
      _id: new ObjectId(prodId)
    });
  }
}

module.exports = Product;
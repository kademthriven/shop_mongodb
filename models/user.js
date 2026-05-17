const { ObjectId } = require('mongodb');
const getDb = require('../utli/database').getDb;

class User {
  constructor(name, email, id, cart) {
    this.name = name;
    this.email = email;

    // DEFAULT CART
    this.cart = cart || {
      items: []
    };

    // USER ID
    if (id) {
      this._id = new ObjectId(id);
    }
  }

  // CREATE USER
  save() {
    const db = getDb();

    return db.collection('users').insertOne({
      name: this.name,
      email: this.email,
      cart: this.cart
    });
  }

  // FIND USER BY ID
  static findUserById(userId) {
    const db = getDb();

    return db.collection('users').findOne({
      _id: new ObjectId(userId)
    });
  }

  // ADD PRODUCT TO CART
  async addToCart(product) {

    // CHECK PRODUCT EXISTS OR NOT
    const cartProductIndex = this.cart.items.findIndex(item => {
      return item.productId.toString() === product._id.toString();
    });

    // COPY OLD ITEMS
    const updatedCartItems = [...this.cart.items];

    // PRODUCT ALREADY EXISTS
    if (cartProductIndex >= 0) {

      updatedCartItems[cartProductIndex].quantity =
        updatedCartItems[cartProductIndex].quantity + 1;

    } else {

      // NEW PRODUCT
      updatedCartItems.push({
        productId: product._id,
        quantity: 1
      });
    }

    // UPDATED CART
    const updatedCart = {
      items: updatedCartItems
    };

    const db = getDb();

    // UPDATE DATABASE
    return db.collection('users').updateOne(
      { _id: this._id },
      {
        $set: {
          cart: updatedCart
        }
      }
    );
  }

  // DELETE PRODUCT FROM CART
  async deleteCartItem(productId) {

    // REMOVE PRODUCT
    const updatedCartItems = this.cart.items.filter(item => {
      return item.productId.toString() !== productId.toString();
    });

    // UPDATED CART
    const updatedCart = {
      items: updatedCartItems
    };

    const db = getDb();

    // UPDATE DATABASE
    return db.collection('users').updateOne(
      { _id: this._id },
      {
        $set: {
          cart: updatedCart
        }
      }
    );
  }
}

module.exports = User;
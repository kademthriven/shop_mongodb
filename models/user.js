const { ObjectId } = require('mongodb');
const getDb = require('../utli/database').getDb;

class User {
  constructor(name, email, id, cart) {
    this.name = name;
    this.email = email;

    this.cart = cart || {
      items: []
    };

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
    const cartProductIndex = this.cart.items.findIndex(item => {
      return item.productId.toString() === product._id.toString();
    });

    const updatedCartItems = [...this.cart.items];

    if (cartProductIndex >= 0) {
      updatedCartItems[cartProductIndex].quantity =
        updatedCartItems[cartProductIndex].quantity + 1;
    } else {
      updatedCartItems.push({
        productId: product._id,
        quantity: 1
      });
    }

    const db = getDb();

    return db.collection('users').updateOne(
      { _id: this._id },
      {
        $set: {
          cart: {
            items: updatedCartItems
          }
        }
      }
    );
  }

  // DELETE PRODUCT FROM CART
  async deleteCartItem(productId) {
    const updatedCartItems = this.cart.items.filter(item => {
      return item.productId.toString() !== productId.toString();
    });

    const db = getDb();

    return db.collection('users').updateOne(
      { _id: this._id },
      {
        $set: {
          cart: {
            items: updatedCartItems
          }
        }
      }
    );
  }

  // CREATE ORDER FROM CART
  async addOrder() {
    const db = getDb();

    const order = {
      items: this.cart.items,
      user: {
        _id: this._id,
        name: this.name,
        email: this.email
      },
      createdAt: new Date()
    };

    await db.collection('orders').insertOne(order);

    return db.collection('users').updateOne(
      { _id: this._id },
      {
        $set: {
          cart: {
            items: []
          }
        }
      }
    );
  }

  // FETCH ORDERS OF ONE USER
  static fetchOrders(userId) {
    const db = getDb();

    return db.collection('orders').find({
      'user._id': new ObjectId(userId)
    }).toArray();
  }
}

module.exports = User;
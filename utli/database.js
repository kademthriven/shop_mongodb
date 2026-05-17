require('dotenv').config();

const dns = require('dns');
const mongoose = require('mongoose');

dns.setServers(['8.8.8.8', '1.1.1.1']);

const uri = process.env.MONGO_URI;
const dbName = process.env.MONGO_DB_NAME || 'shop';

const mongoConnect = async (callback) => {
  try {
    if (mongoose.connection.readyState === 1) {
      if (callback) {
        callback(mongoose.connection);
      }
      return mongoose.connection;
    }

    if (!uri) {
      throw new Error('MONGO_URI is not defined. Add it to your .env file.');
    }

    await mongoose.connect(uri, {
      dbName
    });

    console.log('Connected to MongoDB with Mongoose!');

    if (callback) {
      callback(mongoose.connection);
    }

    return mongoose.connection;
  } catch (err) {
    console.dir(err);
    throw err;
  }
};

const getDb = () => {
  if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
    return mongoose.connection.db;
  }
  throw new Error('No database found');
};

module.exports = {
  mongoConnect,
  getDb
};

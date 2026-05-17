require('dotenv').config();

const dns = require('dns');
const { MongoClient, ServerApiVersion } = require('mongodb');

dns.setServers(['8.8.8.8', '1.1.1.1']);

const uri = process.env.MONGO_URI;
const dbName = process.env.MONGO_DB_NAME || 'shop';

let _db;
let _client;

const mongoConnect = async (callback) => {
  try {
    if (_db) {
      if (callback) {
        callback(_client);
      }
      return _client;
    }

    if (!uri) {
      throw new Error('MONGO_URI is not defined. Add it to your .env file.');
    }

    _client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      }
    });

    await _client.connect();
    await _client.db('admin').command({ ping: 1 });
    _db = _client.db(dbName);

    console.log('Connected to MongoDB!');

    if (callback) {
      callback(_client);
    }

    return _client;
  } catch (err) {
    console.dir(err);
    throw err;
  }
};

const getDb = () => {
  if (_db) {
    return _db;
  }
  throw new Error("No database found");
};

module.exports = {
  mongoConnect,
  getDb
};

const dns = require('dns');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

dns.setServers(['8.8.8.8', '1.1.1.1']);

async function diagnoseConnection() {
  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI) {
    console.error('MONGO_URI is not defined in .env');
    return;
  }

  console.log('MongoDB Connection Diagnostic Tool\n');
  console.log('1. Testing DNS resolution...');

  try {
    const hostMatch = mongoURI.match(/@([^/?]+)/);
    const hostname = hostMatch ? hostMatch[1] : null;

    if (!hostname) {
      console.error('Could not extract hostname from MONGO_URI');
      return;
    }

    console.log(`   Hostname: ${hostname}`);

    console.log('\n   Testing A record resolution...');
    try {
      const addresses = await dns.promises.resolve4(hostname);
      console.log(`   A records found: ${addresses.join(', ')}`);
    } catch (err) {
      console.error(`   A record resolution failed: ${err.message}`);
    }

    console.log('\n   Testing SRV record resolution...');
    try {
      const srvRecords = await dns.promises.resolveSrv(`_mongodb._tcp.${hostname}`);
      console.log(`   SRV records found: ${srvRecords.length} record(s)`);
      srvRecords.forEach((srv) => {
        console.log(`      - ${srv.name}:${srv.port}`);
      });
    } catch (err) {
      console.error(`   SRV record resolution failed: ${err.message}`);
    }
  } catch (err) {
    console.error('Diagnostic error:', err.message);
  }

  console.log('\n2. Testing MongoDB connection...');
  const client = new MongoClient(mongoURI, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

  try {
    await client.connect();
    await client.db('admin').command({ ping: 1 });
    console.log('Pinged your deployment. You successfully connected to MongoDB!');
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    console.error('\nTroubleshooting steps:');
    console.error('   1. Check your internet connection');
    console.error('   2. Verify database user credentials in MongoDB Atlas');
    console.error('   3. Verify your IP address is allowed in Network Access');
    console.error('   4. Check that the cluster is running');
  } finally {
    await client.close();
  }
}

diagnoseConnection().catch(console.error);

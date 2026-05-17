const express = require('express');
const path = require('path');

const mongoConnect = require('./utli/database').mongoConnect;
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', productRoutes);
app.use('/api', userRoutes);

(async () => {
  await mongoConnect();
  app.listen(4000, () => {
    console.log('Server running on port 4000');
  });
})();

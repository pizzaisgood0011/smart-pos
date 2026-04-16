const express = require('express');
const cors = require('cors');
require('dotenv').config();
require('./db');

const app = express();
const PORT = process.env.PORT || 5000;
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const orderRoutes = require('./routes/orders');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');

app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res)=>{
  res.json({ message: 'Smart POS API is running!' });
});

app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

app.listen(PORT, ()=>{
  console.log(`Server running on http://localhost:${PORT}`);
});

const pool = require('../db');

// GET all products
const getProducts = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET single product
const getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET product by barcode
const getProductByBarcode = async (req, res) => {
  try {
    const { barcode } = req.params;
    const result = await pool.query('SELECT * FROM products WHERE barcode = $1', [barcode]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST create product
const createProduct = async (req, res) => {
  try {
    const { name, price, stock, barcode, category_id } = req.body;
    const result = await pool.query(
      'INSERT INTO products (name, price, stock, barcode, category_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, price, stock, barcode || null, category_id || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT update product
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, stock, barcode, category_id } = req.body;
    const result = await pool.query(
      'UPDATE products SET name=$1, price=$2, stock=$3, barcode=$4, category_id=$5 WHERE id=$6 RETURNING *',
      [name, price, stock, barcode || null, category_id || null, id]  // ← category_id || null
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM products WHERE id = $1', [id]);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PATCH restock product
const restockProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;
    const result = await pool.query(
      'UPDATE products SET stock = stock + $1 WHERE id = $2 RETURNING *',
      [amount, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getProducts, getProduct, getProductByBarcode, createProduct, updateProduct, deleteProduct, restockProduct };
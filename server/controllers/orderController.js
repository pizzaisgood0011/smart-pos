const pool = require('../db');

// GET all orders
const getOrders = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT o.*, u.name AS cashier_name
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET single order with items
const getOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
    if (order.rows.length === 0) return res.status(404).json({ error: 'Order not found' });

    const items = await pool.query(`
      SELECT oi.*, p.name AS product_name
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = $1
    `, [id]);

    res.json({ ...order.rows[0], items: items.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST create order (checkout)
const createOrder = async (req, res) => {
  const client = await pool.connect();
  try {
    const { user_id, payment_method, items } = req.body;
    // items = [{ product_id, quantity, price }, ...]

    await client.query('BEGIN');

    // Calculate total
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Insert order
    const orderResult = await client.query(
      'INSERT INTO orders (user_id, total, payment_method) VALUES ($1, $2, $3) RETURNING *',
      [user_id || null, total, payment_method || 'cash']
    );
    const order = orderResult.rows[0];

    // Insert order items + deduct stock
    for (const item of items) {
      await client.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
        [order.id, item.product_id, item.quantity, item.price]
      );

      // Deduct stock
      await client.query(
        'UPDATE products SET stock = stock - $1 WHERE id = $2',
        [item.quantity, item.product_id]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ ...order, items });

  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

// GET daily sales summary
const getSalesSummary = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        DATE(created_at) AS date,
        COUNT(*) AS total_orders,
        SUM(total) AS total_revenue
      FROM orders
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET top selling products
const getTopProducts = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        p.name,
        SUM(oi.quantity) AS total_sold,
        SUM(oi.quantity * oi.price) AS total_revenue
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      GROUP BY p.id, p.name
      ORDER BY total_sold DESC
      LIMIT 5
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getOrders, getOrder, createOrder, getSalesSummary, getTopProducts };

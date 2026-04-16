const pool = require('../db');
const bcrypt = require('bcryptjs');

// GET all users
const getUsers = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC'
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// POST create user
const createUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const exists = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (exists.rows.length > 0) return res.status(400).json({ error: 'Email already registered' });

        const hashed = await bcrypt.hash(password, 10);
        const result = await pool.query(
            'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
            [name, email, hashed, role || 'cashier']
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// PUT update user
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, role, password } = req.body;

        if (password) {
            const hashed = await bcrypt.hash(password, 10);
            await pool.query(
                'UPDATE users SET name=$1, email=$2, role=$3, password=$4 WHERE id=$5',
                [name, email, role, hashed, id]
            );
        } else {
            await pool.query(
                'UPDATE users SET name=$1, email=$2, role=$3 WHERE id=$4',
                [name, email, role, id]
            );
        }

        const result = await pool.query(
            'SELECT id, name, email, role FROM users WHERE id = $1', [id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// DELETE user
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Prevent deleting yourself
        if (parseInt(id) === req.user.id) {
            return res.status(400).json({ error: "You can't delete yourself!" });
        }

        await pool.query('DELETE FROM users WHERE id = $1', [id]);
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getUsers, createUser, updateUser, deleteUser };
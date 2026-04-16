const pool = require('./db');
const bcrypt = require('bcryptjs');

const seed = async () => {
    try {
        const email = 'admin@smartpos.com';
        const password = 'admin123';
        const name = 'Admin';
        const role = 'admin';

        // Check if already exists
        const exists = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (exists.rows.length > 0) {
            console.log('Admin already exists!');
            process.exit(0);
        }

        const hashed = await bcrypt.hash(password, 10);
        await pool.query(
            'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)',
            [name, email, hashed, role]
        );

        console.log('Admin account created!');
        console.log('Email:', email);
        console.log('Password:', password);
        console.log('Change your password after first login!');
        process.exit(0);
    } catch (err) {
        console.error('Seed failed:', err.message);
        process.exit(1);
    }
};

seed();
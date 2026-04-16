const { Pool } = require('pg');
require('dotenv').config();

// postgresql on local machine
// const pool = new Pool({
//   host: process.env.DB_HOST,
//   port: process.env.DB_PORT,
//   database: process.env.DB_NAME,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
// });

// pool.connect()
//   .then(()=> console.log('Connected to PostgreSQL'))
//   .catch(err=>console.error('DB connection error:',err));


// superbase
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false }
});

pool.connect()
  .then(() => console.log('Connected to Supabase PostgreSQL'))
  .catch(err => console.error('DB connection error:', err));

module.exports = pool;

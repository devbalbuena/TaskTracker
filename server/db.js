require('dotenv').config();
const mysql = require('mysql2');

const pool = mysql.createPool({
  host:             process.env.DB_HOST     || 'localhost',
  user:             process.env.DB_USER     || 'root',
  password:         process.env.DB_PASSWORD || '',
  database:         process.env.DB_NAME     || 'todolistsys',
  waitForConnections: true,
  connectionLimit:  10,
  queueLimit:       0
});

// Test connection on startup
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    console.error('   Make sure XAMPP MySQL is running and the database "todolistsys" exists.');
    console.error('   Run the schema.sql file in phpMyAdmin first.\n');
  } else {
    console.log('✅ Database connected successfully.');
    connection.release();
  }
});

module.exports = pool.promise();

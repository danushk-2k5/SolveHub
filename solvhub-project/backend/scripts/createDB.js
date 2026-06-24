const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env' });

(async () => {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || ''
    });

    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'solvhub'}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    console.log(`Database '${process.env.DB_NAME || 'solvhub'}' created (or already exists)`);

    await conn.end();

    // Now sync all models to create tables
    const { sequelize, connectDB } = require('../config/db');
    await connectDB();
    console.log('All tables created successfully!');
    process.exit(0);
})().catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
});

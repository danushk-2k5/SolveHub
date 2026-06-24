const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        host: process.env.DB_HOST || 'localhost',
        dialect: 'mysql',
        logging: false,
        pool: { max: 5, min: 0, acquire: 30000, idle: 10000 }
    }
);

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('MySQL Connected via XAMPP');
        await sequelize.sync({ alter: true }); // auto-create/update tables
        console.log('Database tables synced');
    } catch (error) {
        console.error('DB Connection Error:', error.message);
        process.exit(1);
    }
};

module.exports = { sequelize, connectDB };

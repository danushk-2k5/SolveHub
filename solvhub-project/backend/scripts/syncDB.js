const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { sequelize } = require('../config/db');

// Import all models so Sequelize registers them
require('../models/User');
require('../models/Technician');
require('../models/Booking');
require('../models/Review');

(async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected to MySQL');
        await sequelize.sync({ alter: true }); // alter: safe update, never drops tables
        console.log('All tables created successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
})();

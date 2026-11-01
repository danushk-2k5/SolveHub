const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');
const { connectDB } = require('../config/db');

require('../models/User');
require('../models/Technician');
require('../models/Booking');
require('../models/Review');

(async () => {
    try {
        await connectDB();
        await Promise.all(Object.values(mongoose.models).map((model) => model.init()));
        console.log('MongoDB collections and indexes are ready');
    } catch (error) {
        console.error('Error:', error.message);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
})();

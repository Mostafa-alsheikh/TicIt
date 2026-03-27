const mongoose = require('mongoose');
const { mongoUri} = require('./index')

const connectDB = async () => {
    if (mongoose.connection.readyState !== 0) return;
    try {
        await mongoose.connect(mongoUri);
        console.log('MongoDB connected');
    }
    catch (error) {
        console.error(error.message);
        process.exit(1);
    }
};
    module.exports = connectDB;
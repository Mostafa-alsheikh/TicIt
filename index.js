const express = require('express');
const fs = require('fs');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require ('dotenv').config();
const PORT = process.env.PORT || 3000;

const connectDB = require('./config/db');
connectDB();

const app = express();

const authRoutes = require('./routes/auth.routes');
const taskRoutes = require('./routes/tasks.routes');
const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorhandler');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests, be patient'

});

app.use(express.json());
app.use(helmet());
app.use(limiter);
app.use(logger);
app.use('/tasks', taskRoutes);
app.use('/auth', authRoutes);



app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

app.use(errorHandler);
module.exports = app;

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
  }

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'user'
    },
    streak: {
        type: Number,
        default: 0
    },
    lastCompletedDate: {
        type: Date
    },
    momentumScore: {
        type: Number,
        default: 0
    },
    dailyGoal: {
        type: Number,
        default: 3
    },
    dailyCompleted: {
        type: Number,
        default: 0
    },
    lastActivityDate: {
        type: Date
    },
    xp: {
        type: Number,
        default: 0
    },
    level: {
        type: Number,
        default: 1
    },
    streakFreeze: {
        type: Number,
        default: 1
    }

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
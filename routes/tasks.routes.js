const express = require('express');
const router = express.Router();

const User = require('../models/User');
const validate = require('../middleware/validate');
const {createTaskSchema, updateTaskSchema} = require('../schemas/taskSchemas');
const authMiddleware = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');
const calculatePriorityScore = require('../utils/priority');
const Task = require('../models/Task');
const { createTask, updateTask } = require('../services/taskService');
const AppError = require('../utils/AppError');
const mongoose = require('mongoose');

router.get('/stats', authMiddleware, async (req, res) => {
    const userId = req.user._id;

    const basicStats = await Task.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        {
            $group: {
                _id: null,
                total: { $sum: 1 },
                completed: { $sum: { $cond: ['$completed', 1, 0] } },
                highPriority: { $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] } },
                mediumPriority: { $sum: { $cond: [{ $eq: ['$priority', 'medium'] }, 1, 0] } },
                lowPriority: { $sum: { $cond: [{ $eq: ['$priority', 'low'] }, 1, 0] } },
            }
        }
    ]);

    const weeklyStats = await Task.aggregate([
        {
            $match: {
                userId: new mongoose.Types.ObjectId(userId),
                completed: true,
                updatedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
            }
        },
        {
            $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$updatedAt' } },
                count: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    const user = await User.findById(userId).select('streak xp level momentumScore dailyGoal dailyCompleted');

    const stats = basicStats[0] || { total: 0, completed: 0, highPriority: 0, mediumPriority: 0, lowPriority: 0 };
    const pending = stats.total - stats.completed;
    const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

    return res.json({
        total: stats.total,
        completed: stats.completed,
        pending,
        completionRate,
        priorityBreakdown: {
            high: stats.highPriority,
            medium: stats.mediumPriority,
            low: stats.lowPriority
        },
        weeklyCompletions: weeklyStats,
        user: {
            streak: user.streak,
            xp: user.xp,
            level: user.level,
            momentumScore: user.momentumScore,
            dailyGoal: user.dailyGoal,
            dailyCompleted: user.dailyCompleted
        }
    });
});



router.get('/', authMiddleware, async (req, res) => {
    const search = req.query.search;
    const page = req.query.page !== undefined ? Number(req.query.page) : 1;
    const limit = req.query.limit !== undefined ? Number(req.query.limit) : 5;
    const sort = req.query.sort;
    const completed = req.query.completed;
   

    
    if (page < 1) throw new AppError('Page must be atleast 1', 400);
    if (limit < 1) throw new AppError('Limit must be atleast 1', 400);


const query = {
    userId: req.user._id
};

if (search) {
    query.title = { $regex: search, $options: 'i' };
}

if (completed !== undefined) {
    query.completed = completed === 'true';
}

let sortOption = {};

if (sort === 'createdAt_asc') sortOption.createdAt = 1;
if (sort === 'createdAt_desc') sortOption.createdAt = -1;
if (sort === 'title_asc') sortOption.title = 1;
if (sort === 'title_desc') sortOption.title = -1;
if (sort === 'priorityScore_asc') sortOption.priorityScore = 1;
if (sort === 'priorityScore_desc') sortOption.priorityScore = -1;

const validSorts = ['createdAt_asc', 'createdAt_desc', 'title_asc', 'title_desc', 'priorityScore_asc', 'priorityScore_desc'];
if (sort && !validSorts.includes(sort)) {
    throw new AppError('Sort must be one of: ' + validSorts.join(', '), 400);
}

const skip = (page - 1) * limit;

const results = await Task.find(query)
    .sort(sortOption)
    .skip(skip)
    .limit(limit);

const total = await Task.countDocuments(query);

return res.json({
    total,
    page,
    limit,
    results
});
});

router.get('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;

    const task = await Task.findById(id);

    if (!task) {
       throw new AppError('Task not found', 404);
    }
    if (task.userId.toString() !== req.user._id.toString()) {
        throw new AppError('Not your task', 403);
    }

    return res.json(task);
});


router.post('/', authMiddleware, validate(createTaskSchema), async (req, res) => {
    const task = await createTask(req.user._id, req.body.title, req.body.priority);
    return res.status(201).json(task);
});

router.patch('/:id', authMiddleware, async (req, res) => {
    const result = await updateTask(req.params.id, req.user._id, req.body);
    if (result.error) {
        throw new AppError(result.error, result.status);
    }
    return res.json({ message: 'Task updated successfully' });
});

router.put('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;

    const task = await Task.findById(id);

    if (!task) {
        throw new AppError('Task not found', 404);
    }
    if (task.userId.toString() !== req.user._id.toString()) {
        throw new AppError('Not your task', 403);
    }

    task.title = req.body.title;
    task.completed = req.body.completed ?? false;

    await task.save();

    return res.json({ message: "Task updated successfully" });
});


router.delete('/:id', authMiddleware, authorize('admin'), async (req, res) => {
    const { id } = req.params;

    const task = await Task.findById(id);

    if (!task) {
        throw new AppError('Task not found', 404);
    
}
    await Task.findByIdAndDelete(id);

    return res.json({
        message: 'Task deleted successfully'
    });
});
module.exports = router;
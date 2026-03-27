const Task = require('../models/Task');
const User = require('../models/User');
const calculatePriorityScore = require('../utils/priority');


async function createTask(userId, title, priority, dueDate) {
    const task = await Task.create({
        userId,
        title,
        priority: priority || 'medium',
        dueDate,
    });
    task.priorityScore = calculatePriorityScore(task);
    await task.save();
    return task;
}

async function updateTask(taskId, userId, updateData) {
    const task = await Task.findById(taskId);

    if (!task) return { error: 'Task not found', status: 404 };
    if (task.userId.toString() !== userId.toString()) return { error: 'Not your task', status: 403 };

    const wasCompleted = task.completed;

    const allowedFields = ['title', 'completed', 'priority', 'dueDate'];
    allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
            task[field] = field === 'dueDate' ? new Date(updateData[field]) : updateData[field];
        } 
    });

    if (updateData.priority !== undefined) {
        task.priorityScore = calculatePriorityScore(task);
    }

    await task.save();

    const justCompleted = task.completed === true && !wasCompleted;
    if (justCompleted && task.dueDate) {
        if (new Date() <= task.dueDate) {
            task.completedBeforeDue = true;
        } else {
            task.completedBeforeDue = false;
        }
    }

    if (justCompleted) {
        const user = await User.findById(userId);
        const today = new Date();
        const todayStr = today.toDateString();
        const lastDateStr = user.lastCompletedDate
            ? new Date(user.lastCompletedDate).toDateString()
            : null;

        if (todayStr !== lastDateStr) {
            if (user.lastCompletedDate) {
                const diffDays = Math.floor(
                    (today - new Date(user.lastCompletedDate)) / (1000 * 60 * 60 * 24)
                );
                if (diffDays === 1) {
                    user.streak += 1;
                } else if (diffDays > 1) {
                    if (user.streakFreeze > 0) {
                        user.streakFreeze -= 1;
                    } else {
                        user.streak = 1;
                    }
                }
            } else {
                user.streak = 1;
            }
            user.lastCompletedDate = today;
        }

        const completedTasks = await Task.countDocuments({ userId, completed: true });
        user.momentumScore = (user.streak * 10) + (completedTasks * 2);

        if (!user.lastActiveDate || new Date(user.lastActiveDate).toDateString() !== todayStr) {
            user.dailyCompleted = 0;
            user.lastActiveDate = today;
        }

        user.dailyCompleted += 1;

        if (task.completedBeforeDue) {
            user.momentumScore += 10;
            user.xp += 5;
        }

        if (user.dailyCompleted >= user.dailyGoal) {
            user.momentumScore += 20;
        }

        user.xp += 10;
        if (user.xp >= user.level * 100) {
            user.xp -= user.level * 100;
            user.level += 1;
        }

        await user.save();
    }

    return { task };
}

module.exports = { createTask, updateTask };
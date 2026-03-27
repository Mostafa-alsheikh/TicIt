const { z } = require('zod');


const createTaskSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    dueDate: z.string().optional()
}).strict();

const updateTaskSchema = z.object({
    title: z.string().min(1).optional(),
    completed: z.boolean().optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    dueDate: z.string().optional()
});

module.exports = { createTaskSchema, updateTaskSchema };
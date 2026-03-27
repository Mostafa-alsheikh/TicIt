const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
completed: {
    type: Boolean,
    default: false
},
userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
}, 

priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
},
priorityScore: {
    type: Number,
    default: 1
},

dueDate: {
    type: Date,

},
completedBeforeDue: {
    type: Boolean,
    default: false
},
},

   { timestamps: true }); 

module.exports = mongoose.model('Task', taskSchema);
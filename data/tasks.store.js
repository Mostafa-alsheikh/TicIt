const fs = require('fs');

let tasks = [];

try {
    const data = fs.readFileSync('tasks.json', 'utf-8');
    tasks = JSON.parse(data);
} catch {
    tasks = [];
}

function saveTasks() {
    fs.writeFileSync('tasks.json', JSON.stringify(tasks, null, 2));
}

module.exports = {
    tasks,
    saveTasks
};
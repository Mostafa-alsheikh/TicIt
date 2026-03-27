const fs = require('fs');

let users = [];

try {
    const data = fs.readFileSync('users.json', 'utf-8');
    users = JSON.parse(data);
} catch {
    users = [];
}

function saveUsers() {
    fs.writeFileSync('users.json', JSON.stringify(users, null, 2));
}

module.exports = {
    users,
    saveUsers
};
function calculatePriorityScore(task) {
    const base = { 
        low: 1,
        medium: 2,
        high: 3
    };

    const baseScore = base[task.priority] || 2;
    const createdAt = new Date(task.createdAt);
    const now = new Date();
    const days = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));

    return baseScore - days;

}

module.exports = calculatePriorityScore;
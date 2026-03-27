const jwt = require('jsonwebtoken');
const {jwtSecret} = require('../config');

const authMiddleware = (req,res, next) => {
const authHeader = req.headers.authorization;

let token;

if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];

} 
if (!token) {
    return res.status(401).json({message:'Access Denied' });
}
try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    next();
} catch (error) {
    res.status(401).json({message: 'Invalid Token'});
}
};

module.exports = authMiddleware;
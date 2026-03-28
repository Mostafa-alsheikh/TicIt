function logger(req, res, next) {
    const method = req.method;
    const url = req.url;
    const timestamp = new Date().toISOString();
    
    const body = { ...req.body };
    if (body.password) body.password = '***';
    
    console.log(method, url, body, timestamp);
    next();
}
module.exports = logger;
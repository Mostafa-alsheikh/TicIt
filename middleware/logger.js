function logger(req,res,next) {
    const method = req.method;
    const url = req.url;
    const timestamp = new Date().toISOString();
    

    console.log(method, url, req.body, timestamp);
    next();

}
module.exports = logger;
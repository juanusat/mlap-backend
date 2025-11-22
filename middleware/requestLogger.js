const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  const originalSend = res.send;
  
  res.send = function (data) {
    res.send = originalSend;
    
    const duration = Date.now() - startTime;
    const timestamp = new Date().toISOString();
    const method = req.method;
    const route = req.originalUrl || req.url;
    const status = res.statusCode;
    
    console.log(`[${timestamp}] "${method} ${route}" ${status} - ${duration}ms`);
    
    return res.send(data);
  };
  
  next();
};

module.exports = requestLogger;
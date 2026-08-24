export const serverLogs = [];

export const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logItem = {
      id: Math.random().toString(36).substring(2, 9),
      method: req.method,
      url: req.originalUrl || req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.socket.remoteAddress || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'Unknown',
      timestamp: new Date().toISOString()
    };

    serverLogs.unshift(logItem);
    if (serverLogs.length > 200) {
      serverLogs.pop();
    }
  });

  next();
};

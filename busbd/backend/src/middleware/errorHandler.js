function errorHandler(err, req, res, next) {
  console.error('Error:', err.message);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ success: false, message: err.message, errors: err.details || [] });
  }
  
  const status = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  
  res.status(status).json({
    success: false,
    message,
    errors: err.errors || []
  });
}

module.exports = errorHandler;

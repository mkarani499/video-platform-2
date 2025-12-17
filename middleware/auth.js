// Simple authentication middleware (you'll enhance this later)
module.exports = (req, res, next) => {
  // For now, we'll use a simple user ID from headers
  // Later replace with JWT token authentication
  req.userId = req.headers['user-id'] || 'test-user-id';
  next();
};
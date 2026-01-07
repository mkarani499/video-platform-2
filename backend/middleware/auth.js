# Create auth middleware
@"
// Simple authentication middleware
module.exports = (req, res, next) => {
  // For now, use a simple user ID from headers
  // Later replace with JWT token authentication
  req.userId = req.headers['user-id'] || 'test-user-id';
  next();
};
"@ | Out-File -FilePath "middleware\auth.js" -Encoding utf8
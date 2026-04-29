/**
 * @description Middleware to restrict routes to specific roles
 * @param  {...string} roles - allowed roles e.g. "recruiter", "jobseeker"
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized — please log in" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. This route is for ${roles.join(" or ")} only.`,
      });
    }

    next();
  };
}

module.exports = { requireRole };

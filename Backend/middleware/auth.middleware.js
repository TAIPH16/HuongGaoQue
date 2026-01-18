const jwt = require('jsonwebtoken');
const User = require('../model/user');
const TokenBlacklist = require('../model/tokenblacklist');

const protectRoute = (requiredRoles) => async (req, res, next) => {

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided, authorization denied" });
    }

    const token = authHeader.replace("Bearer ", "");

    // Check blacklist first (fast query due to unique index)
    const blacklisted = await TokenBlacklist.findOne({ token });
    if (blacklisted) {
      return res.status(401).json({ message: "Token has been invalidated" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Support both { userId } (used by main auth.service)
    // and { id } (used by legacy sellerAuth.controller)
    const userId = decoded.userId || decoded.id;

    if (!userId) {
      return res.status(401).json({ message: "Token is not valid" });
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Token is not valid" });
    }

    // Check if user is banned
    if (user.is_banned) {
      return res.status(403).json({ message: "Account is banned" });
    }

    // Check if user has one of the required roles (if specified)
    // Now, requiredRoles can be a string or an array of strings
    console.log(requiredRoles)
    if (requiredRoles) {
      const rolesArray = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
      if (!rolesArray.includes(user.role)) {
        return res.status(403).json({ message: `Access denied: One of the following roles is required: ${rolesArray.join(', ')}` });
      }
    }

    // Attach user info to request for downstream handlers
    req.user = user;
    req.userId = user._id;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ message: "Token is not valid" });
  }
};

module.exports = protectRoute;

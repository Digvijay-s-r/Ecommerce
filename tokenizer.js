const User = require("./schema/user");
const Session = require("./schema/session");
const UserPermission = require("./schema/userPermission");
const Role = require("./schema/role");
const routePermissions = require("./routePermissions");

// Generate a random 12-digit session token
function generateToken() {
  let token = "";
  for (let i = 0; i < 12; i++) {
    token += Math.floor(Math.random() * 10);
  }
  return token;
}

// Authenticate user via Session collection (with fallback to user.token)
async function authenticate(req, res, next) {
  const token = req.header("token");
  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    // 1. Check active session in Session collection
    const session = await Session.findOne({ token }).populate("userId");
    if (session && session.userId) {
      req.user = session.userId;
      req.session = session;
      return next();
    }

    // 2. Fallback: check token directly on User document
    const user = await User.findOne({ token });
    if (user) {
      req.user = user;
      return next();
    }

    return res.status(401).json({ message: "Unauthorized: Invalid or expired session" });
  } catch (error) {
    return res.status(500).json({ message: "Authentication error", error: error.message });
  }
}

// Helper to match paths with wildcards (e.g. /products/* or /products/:id)
function matchRoutePattern(pattern, requestPath) {
  if (pattern === requestPath) return true;
  const regexStr =
    "^" +
    pattern
      .replace(/\/\*$/, "(/.*)?$")
      .replace(/\*/g, ".*")
      .replace(/:[a-zA-Z0-9_]+/g, "[^/]+") +
    "$";
  const regex = new RegExp(regexStr);
  return regex.test(requestPath);
}

// Helper to look up permitted roles from routePermissions.js (exact and wildcard)
function getAllowedRoles(req) {
  const method = req.method.toUpperCase();
  const path = req.path;

  // 1. Exact match priority (e.g. "/products")
  if (routePermissions[path] && routePermissions[path][method]) {
    return routePermissions[path][method];
  }

  // 2. Wildcard pattern match (e.g. "/products/*" matches "/products/123")
  for (const pattern of Object.keys(routePermissions)) {
    if (pattern.includes("*") || pattern.includes(":")) {
      if (matchRoutePattern(pattern, path) && routePermissions[pattern][method]) {
        return routePermissions[pattern][method];
      }
    }
  }

  return null;
}

// Dynamic authorization middleware using routePermissions.js and UserPermission
async function authorize(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized: User not authenticated" });
    }

    const allowedRoles = getAllowedRoles(req);

    // If route has no specific restrictions defined, proceed
    if (!allowedRoles || allowedRoles.length === 0) {
      return next();
    }

    // 1. Find user's role from UserPermission collection
    let userRole = null;
    const userPerm = await UserPermission.findOne({ userId: req.user._id }).populate("roleId");

    if (userPerm && userPerm.roleId && userPerm.roleId.name) {
      userRole = userPerm.roleId.name.toLowerCase();
    } else if (req.user.role) {
      // Fallback: check role field on user document
      userRole = req.user.role.toLowerCase();
    }

    if (!userRole) {
      return res.status(403).json({ message: "Forbidden: No role assigned to user" });
    }

    const normalizedAllowed = allowedRoles.map((r) => r.toLowerCase());

    if (normalizedAllowed.includes(userRole)) {
      return next();
    }

    return res.status(403).json({
      message: `Forbidden: '${userRole}' role does not have permission for ${req.method} ${req.path}`,
    });
  } catch (error) {
    return res.status(500).json({ message: "Authorization error", error: error.message });
  }
}

module.exports = { authenticate, authorize, generateToken };
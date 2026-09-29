// Centralized Route Permissions Configuration
// Supports exact paths (e.g. "/products") and wildcard patterns (e.g. "/products/*")
const routePermissions = {
  // Products collection routes
  "/products": {
    GET: ["admin", "user"],
    POST: ["admin"],

  },

  // Single product routes (supports /products/123, /products/abc, etc.)
  "/products/*": {
    GET: ["admin", "user"],
    PUT: ["admin"],
    DELETE: ["admin"],
  },

  // User management routes (supports /users/123, /users/abc, etc.)
  "/users/*": {
    GET: ["admin", "user"],
    PUT: ["admin", "user"],
    DELETE: ["admin"],
  },
};

module.exports = routePermissions;

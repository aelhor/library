const rateLimit = require("express-rate-limit");

// Create a rate-limiter middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 10, // Limit each IP to 10 requests per windowMs (15 minutes)
  message: {
    status: "Error",
    message: "Too many requests, please try again later.",
  },
});

module.exports = limiter;

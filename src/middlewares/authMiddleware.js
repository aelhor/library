const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1]; // Extract the token
  if (!token) {
    return res.status(401).json({ error: "Access denied, no token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Store decoded token information in req.user
    next(); // Continue to the next middleware or route handler
  } catch (error) {
    res.status(400).json({ error: "Invalid token" });
  }
};

module.exports = verifyToken;

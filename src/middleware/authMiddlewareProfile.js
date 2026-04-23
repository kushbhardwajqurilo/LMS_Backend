const jwt = require("jsonwebtoken");

exports.authMiddleware = async (req, res, next) => {
  try {
    let token;

    // Get token from cookie
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
      console.log("Token from cookies:", token);
    }

    // Or from Authorization header
    else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
      console.log("Token from header:", token);
    }

    // No token found
    if (!token) {
      return res.status(401).json({
        status: "failed",
        message: "No token provided",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({
        status: "failed",
        message: "Unauthorized user",
      });
    }

    req.user = decoded; // Attach user info to request
    console.log("Decoded token:", decoded);
    next();
  } catch (error) {
    console.error("Auth error:", error.message);
    return res.status(401).json({
      status: "error",
      message: "Unauthorized user",
      error: error.message,
    });
  }
};

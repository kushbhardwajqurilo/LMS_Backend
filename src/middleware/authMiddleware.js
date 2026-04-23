const jwt = require("jsonwebtoken");

exports.authMiddleware = async (req, res, next) => {
  try {
    // 1. Try cookie token
    let token = req.cookies["token"];

    // 2. If no cookie, try Authorization header
    if (
      !token &&
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        status: "failed",
        message: "No token provided",
      });
    }
    // console.log("token", token);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({
        status: "failed",
        message: "Unauthorized user",
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(401).json({
      status: "error",
      message: "Unauthorized user",
    });
  }
};

// const jwt = require("jsonwebtoken");
// exports.authMiddleware = async (req, res, next) => {
//     try {
//         // console.log(req.cookies, 'token');
//         console.log(req.headers["authorization"].split(" ")[1], 'token');

//         const token =  req.headers["authorization"].split(" ")[1];
//         const decord = jwt.verify(token, process.env.JWT_SECRET);
//         if(!decord){
//             return res.json({
//                 status: "failed",
//                 message: "unauthorized user",
//             });
//         }else{
//             req.user = decord;
//             console.log(req.user.id)
//             next();
//         }
//     } catch (error) {
//         res.json({
//             status: "error",
//             message: "unauthorized user",
//         })
//     }
// }

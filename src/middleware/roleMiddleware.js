const authorizeRoles = (roles) => {
  roles = roles.split(",");
  return (req, res, next) => {
    console.log("role array", roles);
    console.log("uesr role", req.user.role);
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Forbidden: You do not have access to this resource",
      });
    }
    next();
  };
};

module.exports = authorizeRoles;

exports.protect = (req, res, next) => {
    // Add your authentication logic here (e.g., JWT validation)
    console.log("Auth middleware executed");
    next();
  };
  
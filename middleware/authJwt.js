const jwt = require("jsonwebtoken");

const authenticateJWT = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) {
    console.log("Unauthorized Access by", req.body.email);
    return res.status(401).send({
      message: "Access Denied",
    });
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(401).send("Invalid Token");
    req.user = user;
    next();
  });
};

const JWTAuth = { authenticateJWT };

module.exports = JWTAuth;

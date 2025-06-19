const db = require("../models");
const VerifyEmail = db.verifyEmail;

// OTP Verification Middleware
checkExpiredOtp = (req, res, next) => {
  try {
    VerifyEmail.findOne({
      email: req.body.email,
    });
    next();
  } catch (error) {
    res.status(401).send({
      message: "OTP expired, Re send Again",
      error,
    });
  }
};

const verifyOTP = {checkExpiredOtp};

module.exports = verifyOTP;

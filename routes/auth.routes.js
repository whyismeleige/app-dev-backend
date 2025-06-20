const { verifySignUp, verifyOTP } = require("../middleware");
const controller = require("../controllers/auth.controller");

module.exports = (app) => {
  // CORS and JWT Verifications
  app.use((req, res, next) => {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token,Origin,Content-Type,Accept"
    );
    next();
  });

  // SignUp MiddleWare and Endpoint
  app.post(
    "/api/auth/signup",
    [verifySignUp.checkDuplicateEmail],
    controller.signup
  );

  // SignIn Endpoint
  app.post("/api/auth/signin", controller.signin);

  // OTP Verification MiddleWare and Endpoint
  app.post(
    "/api/auth/verify-otp",
    controller.otpVerification
  );
};

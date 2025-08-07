const { verifySignUp, JWTAuth } = require("../middleware");
const controller = require("../controllers/auth.controller");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const db = require("../models");
const User = db.user;
const jwt = require('jsonwebtoken');

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
  app.post("/api/auth/verify-otp", controller.otpVerification);

  app.post("/api/auth/send-otp", controller.sendOTP);

  app.put(
    "/api/auth/change-password",
    [JWTAuth.authenticateJWT],
    controller.changePassword
  );

  passport.use(
    new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT,
      clientSecret: process.env.GOOGLE_SECRET,
      callbackURL: "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log(profile);
      try {
        const existingUser = await User.findOne({
          email: profile.emails[0].value,
        });
        if (existingUser) {
          return done(null, existingUser);
        } else {
          return done(null, false, { message: "Unauthorized User" });
        }
      } catch (error) {
        return done(error, null);
      }
    })
  );

  app.get(
    "/api/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
  );

  app.get(
    "/api/auth/google/callback",
    passport.authenticate("google", {
      session: false,
      failureRedirect: "/unauthorized",
      failureMessage: true,
    }),
    (req, res) => {
      const token = jwt.sign(req.user, process.env.JWT_SECRET, {
        expiresIn: "24h",
      });
      console.log(token);
      res.json({
        token,
        user: req.user
      })
    }
  );

  app.get("/unauthorized", (req, res) => {
    res.status(400).send({
      message: "Access Denied: You are not authorized to log in",
    });
  });

  app.post ('/api/get-user-data',controller.getUserData)
};

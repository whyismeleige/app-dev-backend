// Entire Middleware 
const verifySignUp = require("./verifysignup");
const verifyOTP = require("./verifyotp");
const JWTAuth = require('./authJwt');

module.exports = {verifySignUp,verifyOTP,JWTAuth};
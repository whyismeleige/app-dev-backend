const { google } = require("googleapis");
const nodemailer = require("nodemailer");
const db = require("../../models");
const VerifyEmail = db.verifyEmail;
require("dotenv").config();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
const EMAIL_ID = process.env.EMAIL_ID;
const REDIRECT_URI = "https://developers.google.com/oauthplayground";

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const sendOTP = async (to) => {
  // Fresh Access Token
  const ACCESS_TOKEN = await oAuth2Client.getAccessToken();

  // Email Transport Object
  const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: EMAIL_ID,
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      refreshToken: REFRESH_TOKEN,
      accessToken: ACCESS_TOKEN,
    },
    tls: {
      rejectUnauthorized: true,
    },
  });

  // Email Structure
  const from = EMAIL_ID;
  const subject = "Email Verification to Enter";
  const OTP = getOTP();
  const html = `
    <p>Hey ${to},</p>
    <p>Kindly verify the following OTP below in the app, OTP will expire in 2 minutes: </p>
    <p>${OTP}</p>
    <p>Thank you</p>
  `;

  const verifyemail = new VerifyEmail({
    email: to,
    otp: OTP,
  });

  // Deleting Previous OTPs
  await VerifyEmail.deleteOne({
    email: to,
  });

  // Saving OTP in DB
  verifyemail
    .save()
    .then((result) => {
      console.log(`One Time Password generated for User ${to}`);
    })
    .catch((error) => {
      console.error("Error Generating Password");
    });

  // Sending Email
  return new Promise((resolve, reject) => {
    transport.sendMail({ from, subject, to, html }, (err, info) => {
      if (err) reject(err);
      resolve(info);
    });
  });
};

// Random OTP 
const getOTP = () => {
  const min = 100000,
    max = 999999;
  const floatRandom = Math.random();
  const diff = max - min;
  return Math.round(diff * floatRandom) + min;
};

module.exports = sendOTP;

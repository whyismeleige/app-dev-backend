const db = require("../models");
const User = db.user;
const VerifyEmail = db.verifyEmail;
const sendOTP = require("../Utils/Email-Sender/test");
let jwt = require("jsonwebtoken");
let bcrypt = require("bcrypt");
require("dotenv").config();

// signup routing
exports.signup = async (req, res) => {
  const { email, password } = req.body;
  try {
    const hashedPassword = bcrypt.hashSync(password, 8);

    const newUser = new User({ email, password: hashedPassword });

    await newUser.save();

    console.log(`New User with ${email} has been successfully registered`);

    res.status(201).send({
      message: "User registered Successfully",
    });
  } catch (error) {
    console.log("Error while Registering New User", error);

    res.status(500).send({
      message: "Error registering User",
      error,
    });
  }
};

// signin routing
exports.signin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).send({
        message: "Invalid Credentials",
      });
    }

    console.log(`User with ${email} has logged in successfully`);

    await sendOTP(email);

    res.status(200).send({
      message: "Logged In Successfully",
    });
  } catch (error) {
    res.status(500).send({
      message: "Server Error: Login Failed",
      error,
    });
  }
};

// OTP Verification routing
exports.otpVerification = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await VerifyEmail.findOne({ email, otp });

    if (!user) {
      return res.status(400).send({
        message: "Invalid OTP or Email",
        error: "Error from Client Side",
      });
    }

    const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.status(200).send({
      message: "OTP verified successfully",
      token,
    });
  } catch (error) {
    res.status(500).send({
      message: "Server Error, While verifying OTP",
      error,
    });
  }
};

// Send OTP to Email
exports.sendOTP = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send({
        message: "Email Does not exist",
        error: "Error from Client Side",
      });
    }
    await sendOTP(email);
    res.status(200).send({
      message: "OTP sent successfully to Registered Email",
    });
  } catch (error) {
    res.status(500).send({
      message: "Server Error: While Sending OTP",
      error,
    });
  }
};

// Changing Password
exports.changePassword = async (req, res) => {
  const { email, password } = req.body;
  const filter = { email };
  const update = { password: bcrypt.hashSync(password, 10) };

  try {
    const user = await User.findOneAndUpdate(filter, update, { new: true });
    if (!user) {
      return res.status(400).send({
        message: "User Does not exist",
      });
    }
    res.status(201).send({
      message: "Password Successfully Changed",
    });
  } catch (error) {
    res.status(500).send({
      message: "Server Error: While Changing Password",
    });
  }
};

exports.getUserData = async (req, res) => {
  const { hallTicketNo } = req.body;
  const students = db.mongoose.connection.collection("student");
  try {
    const studentData = await students.findOne({ id: Number(hallTicketNo) });
    if(!studentData){
      return res.status(400).send({
        message: "User Does not exist"
      })
    }
    res.status(201).send(studentData);
  } catch (error) {
    res.status(500).send({
      message: 'Server Error'
    })
  }
};

const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");

const connectDB = require('../Utils/Database/dbConnect');
const User = require('../Utils/Database/userModel');
connectDB();

router.post("register", (req, res, next) => {
  bcrypt
    .hash(req.body.password, 10)
    .then((hashedPassword) => {
      const user = new User({
        email: req.body.email,
        password: hashedPassword,
      });
      user
        .save()
        .then((result) => {
          console.log(
            `New User with The Email ${user.email} has been successfully created`
          );
          res.status(201).send({
            message: "User Created Successfully",
            result,
          });
        })
        .catch((error) => {
          res.status(500).send({
            message: "Error Creating User",
            error,
          });
        });
    })
    .catch((error) => {
      res.status(500).send({
        message: "Password was not hashed successfully",
        error,
      });
    });
});

// router.post("login", (req,res,next) => {
//     User.findOne({email: req.body.email})
//         .then((user) => {
//             bcrypt
//                 .compare(req.body.pass)
//         })
// })
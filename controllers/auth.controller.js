const db = require("../models");
const User = db.user;

let jwt = require("jsonwebtoken");
let bcrypt = require("bcrypt");

exports.signup = (req, res) => {
  const user = new User({
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8),
  });
  user
    .save()
    .then((result) => {
      console.log(`New user with the Email ${user.email} has been registered`);
      res.status(201).send({
        message: "User created successfully",
        result,
      });
    })
    .catch((error) => {
      res.status(500).send({
        message: "Error creating user",
        error,
      });
    });
  // user.save((err,user) => {
  //     if(err){
  //         res.status(500).send({message:err});
  //         return;
  //     }
  //     user.save(err => {
  //         if(err){
  //             res.status(500).send({message:err});
  //             return;
  //         }
  //         res.send({message:"User was registered successfully"});
  //     })
  // })
};

exports.signin = (req, res) => {
  User.findOne({
    email: req.body.email,
  })
    .then((user) => {
      bcrypt
        .compare(req.body.password, user.password)
        .then((passwordCheck) => {
          if (!passwordCheck) {
            return res.status(400).send({
              message: "Passwords do not match",
              error,
            });
          }
          const token = jwt.sign(
            {
              userId: user._id,
              userEmail: user.email,
            },
            "RANDOM-TOKEN",
            { expiresIn: "24h" }
          );
          console.log(`User with email ${user.email} has logged in`);
          res.status(200).send({
            message: "Login Successful",
            email: user.email,
            token,
          });
        })
        .catch((e) => {
          res.status(400).send({
            message: "Passwords do not match",
            e,
          });
        });
    })
    .catch((e) => {
      console.log(`Error while finding`);
      res.status(404).send({
        message: "Email not found",
        e,
      });
    });
};

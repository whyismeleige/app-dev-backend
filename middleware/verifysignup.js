const db = require('../models');
const User = db.user;

checkDuplicateEmail = (req,res,next) => {
    User.findOne({
        email: req.body.email
    })
    .then((user) => res.status(400).send({message:"Failed! Username is already in use."}))
    .catch(err => res.status(500).send({message:err}))
    next();
    // .exec((err,user) => {
    //     if(err){
    //         res.status(500).send({message:err});
    //         return;
    //     }
    //     if(user){
    //         res.status(400).send({message:"Failed! Username is already in use"});
    //         return;
    //     }
    //     next();
    // })
}

const verifySignUp = {checkDuplicateEmail};

module.exports = verifySignUp;

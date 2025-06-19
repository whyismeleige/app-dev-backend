const db = require('../models');
const User = db.user;

// SignUp Verification Middleware
checkDuplicateEmail = (req,res,next) => {
    User.findOne({
        email: req.body.email
    })
    next();
}

const verifySignUp = {checkDuplicateEmail};

module.exports = verifySignUp;

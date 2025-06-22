const db = require('../models');
const User = db.user;

// SignUp Verification Middleware
checkDuplicateEmail = async (req,res,next) => {
    const existingUser = await User.findOne({email: req.body.email});
    if(existingUser){
        return res.status(400).send({
            message: "Email already exists"
        })
    }
    next();
}

const verifySignUp = {checkDuplicateEmail};

module.exports = verifySignUp;

const mongoose = require('mongoose');

const Student = mongoose.model(
    'Student',
    new mongoose.Schema({
        id: {
            type: BigInt,
            unique: [true,'Hall Ticket Id already exists'],
            required: [true,'Please provide an id']
        },
        name: String,
        year: String,
        course: String,
        dept: String,
        specialization: String,
        current_sem: String,
        email: String,
        phone_no: BigInt
    }),'student'
)

module.exports = Student;
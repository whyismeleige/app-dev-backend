const mongoose = require('mongoose');

const subjectWiseSchema = new mongoose.Schema({
    subject: String,
    workingDays: Number,
    daysPresent: Number,
    daysAbsent: Number,
    percentage: Number
})

const Attendance = mongoose.model(
    'Attendance',
    new mongoose.Schema({
        id: {
            type: BigInt,
            unique: [true,'Unique Hall Ticket Id already exists'],
            required: [true,'Please provide an id']
        },
        data: [subjectWiseSchema]
    }), 'attendance'
)

module.exports = Attendance;
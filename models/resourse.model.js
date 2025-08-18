const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Resourse Title is Required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
        type: String,
        maxlength: [1000, 'Description cannot exceed 1000 characters'],
        default: 'Description not Provided for the Resource',
    },
    type: {
        type: String,
        enum: {
            values: ['lecture_notes', 'assignment', 'previous_papers', 'reference', 'videos', 'images'],
            message: 'Invalid Resource Type',
        },
        required: true,
    },
    subject: {
        id: { 
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Subject',
            required: true,
        }
    }
})
const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const SessionsSchema = new Schema({
    Course:{
        type: String,
        required:true
    },
    DateTime:{
        type: Date,
        default:Date.now
    },
    SessionType:{
        type: String,
        required:true
    },
    Booked:{
        type: String,
        required:true
    },
    Tutor_name:{
        type: String,
        required:true
    },
    Tutor_username:{
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Session', SessionsSchema)
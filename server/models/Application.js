const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ApplicationsSchema = new Schema({
    Student_username: {
        type: String,
        ref: "Users",
        required: true
    },
    Standing:{
        type: String,
        required: true
    },
    Course: {
        type: String,
        required: true
    },
    Grade:{
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Application', ApplicationsSchema)
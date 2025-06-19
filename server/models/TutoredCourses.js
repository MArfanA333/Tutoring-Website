const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const TutoredCoursesSchema = new Schema({
    Username:{
        type: String,
        required:true
    },
    Course:{
        type: String,
        required: true 
    }
});

module.exports = mongoose.model('TutoredCourses', TutoredCoursesSchema)
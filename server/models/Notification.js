const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const NotificationsSchema = new Schema({
    Student_username:{
        type: String,
        required: true
    },
    Heading:{
        type: String,
        required: true
    },
    Body:{
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Notifications', NotificationsSchema)
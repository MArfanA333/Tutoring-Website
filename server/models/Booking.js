const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const BookingsSchema = new Schema({
    Student_username:{
        type: String,
        required: true
    },
    Tutor_username:{
        type: String,
        required: true
    },
    Session_id:{
        type: mongoose.Schema.Types.ObjectId, ref: "Session", required: true
    }
});

module.exports = mongoose.model('Bookings', BookingsSchema)
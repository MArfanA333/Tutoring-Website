const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const DocumentsSchema = new Schema({
    Session_id:{
        type: mongoose.Schema.Types.ObjectId, ref: "Session", required: true
    },
    Document_name:{
        type:String,
        required:true
    },
    Document_link:{
        type:String,
        required: true
    }
});

module.exports = mongoose.model('Documents', DocumentsSchema)
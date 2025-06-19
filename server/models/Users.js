const mongoose = require('mongoose');
const express = require('express');
const app = express();
const Schema = mongoose.Schema;
const UsersSchema = new Schema({
    username:{
        type: String,
        required:true
    },
    password:{
        type: String,
        required: true
    },
    role:{
        type: String,
        required: true
    },
    ausID:{
        type: String,
        required: true
    },
    name:{
        type: String,
        required: true
    },
    Major:{
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Users', UsersSchema)


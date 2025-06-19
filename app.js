require('dotenv').config();
const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const expressLayout = require('express-ejs-layouts');

const connectDB = require("./server/config/db");

const app = express();
const PORT = 5000 || process.env.PORT;

// Connecting to DB:
connectDB();

app.use(bodyParser.json());
app.use(cors());
app.use(express.urlencoded({extended:false}))
app.use(express.static('public'));

// Templating Engine:
app.use(expressLayout);
app.set('layout','./layouts/main');
app.set('view engine','ejs');

app.use('/', require('./server/routes/main'));

// app.listen(PORT,()=>{
//     console.log('Server Initialized to port %d',PORT);
// }); 

module.exports = app;
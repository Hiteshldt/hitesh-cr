// Libraries include
const { name } = require("ejs");
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const app = express();

app.use(express.json());
app.use(cookieParser());
app.listen(3000);

// MongoDb Setup
const db_link = "mongodb+srv://admin:Qbe9pzYeogM7DjlM@cluster0.wuznz5y.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(db_link)
.then(function(){
    console.log("dob connected");
})
.catch(function(err){
    console.log(err);
})

// Schema Setup
const userData = mongoose.Schema({
    name: {
        type:String,
        required:true
    },
    email: {
        type:String,
        required:true,
        unique:true
    },
    deviceId: {
        type:String,
        required:true,
    },
    country: {
        type:String,
        required:true,
    },
    phone: {
        type:String,
        required:true,
    },
    password: {
        type:String,
        required:true,
    },

})

const signUpData = mongoose.model('signUpData', userData);

// Routing

const dashboardRoute = express.Router();
const authRoute = express.Router();

app.use('/dashboard',dashboardRoute);
app.use('/auth',authRoute);

dashboardRoute
.route('/')
.get(protectedRoute, getDashboard);

authRoute
.route('/login')
.get(protectedRoute, getDashboard)
.post(postLoginPage, protectedRoute, getDashboard);

authRoute
.route('/signup')
.get(getDashboard)
.post(postSignUpPage);

authRoute
.route('/recover')
.get(getRecoverPage);


// function to handle route
function getDashboard(req, res) {
    res.sendFile('/Dashboard/MainDashboard.html', {root:__dirname});
}

function getLoginPage(req, res) {
    res.sendFile('/Login/loginPage.html', {root:__dirname});
}

function getSignUpPage(req, res) {
    res.sendFile('/Login/signUpPage.html', {root:__dirname});
}

function getRecoverPage(req, res) {
    res.sendFile('/Login/passwordResetPage.html', {root:__dirname});
}

function protectedRoute(req, res, next) {
    if(req.cookies.isLoggedIn) {
        next();
    }
    else {
        res.redirect('/auth/login');
    }
}

// TO handle the login request made at the login page and response with dashboard file if correct
async function postLoginPage(req, res, next) {
    const user = await signUpData.findOne({ email: req.body.loginEmail });
    if (user && await bcrypt.compare(req.body.loginPassword, user.password)) {
        console.log("RightCred:");
        res.cookie('isLoggedIn', true, {httpOnly: true});
        next();
    } else {
        console.log("wrongCred:");
        res.json({ status: 'error', SignUpData: false });
    }
}

// To handle the post request from signup page and will be uploaded to the db
async function postSignUpPage(req, res) {
    let saltRounds = 10;
    let salt = bcrypt.genSaltSync(saltRounds);
    const hashedPassword = bcrypt.hashSync(req.body.signUpPassword, salt);

    try {
        const signUpUser = await signUpData.create({
            name: req.body.signUpName,
            email: req.body.signUpEmail,
            deviceId: req.body.signUpDeviceId, // Store the device ID as plain text
            country: req.body.signUpCountry,
            phone: req.body.signUpPhone,
            password: hashedPassword,
        });
        res.json({status: 'ok'});
        console.log("success:");
    } catch (err) {
        console.log(err);
        res.status(500).json({status: 'error', message: 'An error occurred during sign up.'});
    }
}

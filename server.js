// Libraries include
const { name } = require("ejs");
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const app = express();
require('dotenv').config();

app.use(express.json());
app.use(cookieParser());
app.listen(3000);

const db_link = process.env.MongoDb_Link;
const JWT_KEY = process.env.jwt_key;

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
.get(protectedRoute2, getLoginPage)
.post(postLoginPage, getDashboard);

authRoute
.route('/signup')
.get(protectedRoute2, getSignUpPage)
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
        const isVerfied = jwt.verify(req.cookies.isLoggedIn, JWT_KEY);
        if(isVerfied){
            next();
        }
        else{
            next();
        }
    }
    else {
        res.redirect('/auth/login');
    }
}

function protectedRoute2(req, res, next) {
    if(req.cookies.isLoggedIn) {
        const isVerfied = jwt.verify(req.cookies.isLoggedIn, JWT_KEY);
        if(isVerfied){
            res.redirect('/dashboard');
        }
        else{
            next();
        }
    }
    else {
        next();
    }
}

// TO handle the login request made at the login page and response with dashboard file if correct
async function postLoginPage(req, res, next) {
    const user = await signUpData.findOne({ email: req.body.loginEmail });
    if (user && await bcrypt.compare(req.body.loginPassword, user.password)) {
        console.log("RightCred:");

        let uid = user['.id'];
        let token = jwt.sign({payload:uid}, JWT_KEY);

        const now = new Date();
        const expireTime = now.getTime() + 1000 * 60 * 60 * 24 * 7;
        now.setTime(expireTime);
        res.cookie('isLoggedIn', token, { httpOnly: true, expires: now, path: '/' });

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
        await signUpData.create({
            name: req.body.signUpName,
            email: req.body.signUpEmail,
            deviceId: req.body.signUpDeviceId, // Store the device ID as plain text
            country: req.body.signUpCountry,
            phone: req.body.signUpPhone,
            password: hashedPassword,
        });
        res.redirect('/auth/login');
        console.log("sucess");
    } catch (err) {
        console.error(err);
        // Send an error message that will be displayed in a popup on the client side
        res.render('signup', { message: 'An error occurred during sign up.', error: err });
    }
}

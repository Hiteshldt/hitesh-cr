// Libraries include
const { name } = require("ejs");
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const app = express();
const crypto = require('crypto');
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
        unique:true,
    },
    deviceId: {
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
    resetToken: String,
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

dashboardRoute
.route('/logout')
.get(logoutbtn);

authRoute
.route('/login')
.get(protectedRoute2, getLoginPage)
.post(postLoginPage, getDashboard);

authRoute
.route('/signup')
.get(protectedRoute2, getSignUpPage)
.post(postSignUpPage);

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
    const emailUnique = await signUpData.findOne({ email: req.body.signUpEmail });

    if(emailUnique){
        console.log("duplicate email");
        res.json({ message: 'Email is already registered' });
    }

    else{
        console.log("unique email:");
        try {
            await signUpData.create({
                name: req.body.signUpName,
                email: req.body.signUpEmail,
                deviceId: req.body.signUpDeviceId, // Store the device ID as plain text
                phone: req.body.signUpPhone,
                password: hashedPassword,
            });
            res.json({ message: 'Sucessfully Registered' });
            console.log("sucess");
        } catch (err) {
            console.error(err);
            // Send an error message that will be displayed in a popup on the client side
            res.render('signup', { message: 'An error occurred during sign up.', error: err });
        }

    }
}

// Forgot and Reset Password feature
function generateResetToken() {
    return crypto.randomBytes(32).toString('hex');
}

app.route('/auth/forgotpass')
    .get((req, res) => {
        res.sendFile('/Login/forgotPasswordPage.html', {root:__dirname});
    })
    .post(async (req, res) => {
        const { email } = req.body;
        const user = await signUpData.findOne({ email });

        if (user) {
            const resetToken = generateResetToken();
            user.resetToken = resetToken;
            await user.save();

            const resetLink = `http://localhost:3000/auth/resetpass/${resetToken}`;
            res.json({ message: 'Reset link sent sucessfully' });
            console.log(`Reset link: ${resetLink}`);

        } else {
            res.json({ message: 'Email is not registered' });
            console.log("user not found");
        }
});

app.route('/auth/resetpass/:resetToken')
    .get((req, res) => {
        res.sendFile('/Login/passwordResetPage.html', {root:__dirname});
    })
    .post(async (req, res) => {
        const newPassword  = req.body.newPassword;
        const resetToken = req.params.resetToken

        const user = await signUpData.findOne({ resetToken });

        if (user) {
            const saltRounds = 10;
            const hashedPassword = bcrypt.hashSync(newPassword, saltRounds);

            // Update user's password and clear reset token
            await signUpData.findOneAndUpdate({ resetToken }, { password: hashedPassword, resetToken: null });

            console.log("Password reset successful");
            res.json({ message: 'Password change success' }); // Send success message

        } else {
            console.log("Invalid reset token");
            res.status(400).json({ message: 'Invalid reset token' }); // Send error message
        }
    });

function logoutbtn(req, res) {
    
}
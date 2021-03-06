// app/routes.js
var express = require('express');
var app=express.Router();
var bcrypt = require('bcrypt');
var mysql = require('mysql');
var dbconfig = require('../public/db_structure');
var passport = require('passport');
var db = require('../public/db_structure');
var connection = mysql.createConnection(dbconfig.connection);
app.get('/', function(req, res) {
    res.render('index.ejs');
});
app.get('/login', function(req, res) {
    res.render('login.ejs', { message: req.flash('loginMessage') });
});

app.get('/forgotpassword',function (req, res) {
    res.render('forgotpassword.ejs', { message : ""});
});
app.get('/changepass',isLoggedIn,function(req,res){
    res.render('changepass.ejs');
});
app.get('/info',function(req,res){
    if(req.session.message!="") {
        res.render('blank_template.ejs', {content: req.session.message});
        req.session.message="";
    }
    else
        res.redirect('/profile');
})
// process the login form
app.post('/login', passport.authenticate('local-login', {
    successRedirect : '/profile',
    failureRedirect : '/login',
    failureFlash : true
}),
function(req, res) {
    if (req.body.remember) {
        req.session.cookie.maxAge = 1000 * 60 * 3;
    } else {
        req.session.cookie.expires = false;
    }
    res.redirect('/');
});

app.get('/editprofile',isLoggedIn,function(req,res){
    db.querydb("select * from noteshare.user where username="+mysql.escape(req.user.username)+";",function(rows){
        var user=rows[0];
        res.render('change_profile.ejs',user);
    });
});
app.post('/editprofile',isLoggedIn,function(req,res){
    var updates="";
    updates="firstname = "+mysql.escape(req.body.firstname)+","+"lastname = "+mysql.escape(req.body.lastname)+","
    +"college = "+mysql.escape(req.body.college)+","+"email = "+mysql.escape(req.body.email);
    db.querydb("update noteshare.user set "+updates+" where username="+mysql.escape(req.user.username)+";",function(rows){
        res.redirect('/profile')
    });
});
app.get('/auth/facebook', passport.authenticate('facebook'));
app.get('/auth/facebook/callback',
    passport.authenticate('facebook', { successRedirect: '/profile',
        failureRedirect: '/login' }));
app.get('/auth/facebook',
    passport.authenticate('facebook', { scope: 'read_stream' })
);
app.get('/signup', function(req, res) {
    // render the page and pass in any flash data if it exists
    res.render('signup.ejs', { message: req.flash('signupMessage') });
});
//app.get('/auth/google',
//    passport.authenticate('google', { scope: 'https://www.google.com/m8/feeds' })
//);
app.post('/signup', passport.authenticate('local-signup', {
    successRedirect : '/profile', // redirect to the secure profile section
    failureRedirect : '/signup', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
}));
//app.get('/auth/google/callback',
//    passport.authenticate('google', { failureRedirect: '/login' }),
//    function(req, res) {
//        // Successful authentication, redirect home.
//        res.redirect('/');
//    });
app.get('/logout',isLoggedIn ,function(req, res) {
    req.logout();
    user=null;
    res.redirect('/');
});
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/login');
}
module.exports=app;

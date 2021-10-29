
const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
var session = require("express-session"),
  bodyParser = require("body-parser");
var passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const path = require("path");
const multer = require("multer");
var _ = require('lodash');
const {toInteger} = require("lodash");
const {off} = require("process");

const {createCipheriv} = require("crypto");
const csv = require('csv-parser');
const fs = require('fs');
var router = express.Router()


// "/" route


//get requests

router.get("/",(req,res)=>{
    res.redirect("/home");
})

router.get("/home",(req,res)=>{
    res.render("home");
})

router.get("/register", (req, res) => {
    res.render("register");
})
  
router.get("/login", (req, res) => {
    res.render("login");
})

router.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/home");
})
  


//Post requests 

router.post("/register", (req, res) => {
    var newUser = new User({username: req.body.username, email: req.body.email, name: req.body.name, SCourses: [], ICourses: []});
    User.register(newUser, req.body.password, function (err, user) {
      if (err) {
        console.log(err);
        res.redirect("/register");
      }
      passport.authenticate("local")(req, res, function () {
        res.redirect("/login");
      });
    });
});

router.post('/login', passport.authenticate('local', {
    successRedirect: "/user/student", //student instructor
    failureRedirect: '/login'
}));






module.exports = router
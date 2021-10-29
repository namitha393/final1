
// importing packages
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


//importing models

var {User} = require("./models/User.js")
var {Course} = require("./models/Course.js")



// importing routes

var auth=require("./routes/auth");
var user=require("./routes/user");


var port=3000;

//port=process.argv[2];

const app = express();
app.set('view engine', 'ejs');
app.set("views", [
  __dirname + "/views",
  __dirname + "/views/landingpages",
  __dirname + "/views/authentication",
  __dirname + "/views/courses",
  __dirname + "/views/profile",
  __dirname + "/views/assignments"
])

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(session({secret: "aSecretToComputeTheHash", resave: false, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session());

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public");
  },
  filename: (req, file, cb) => {
    const ext = file
      .mimetype
      .split("/")[1];
    cb(null, `files/admin-${file.fieldname}-${Date.now()}.${ext}`);
  }
});

const upload = multer({
  storage: multerStorage,
  //  fileFilter: multerFilter,
});

passport.use(User.createStrategy());

//Sessions

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (id, done) {
  User
    .findById(id, function (err, user) {
      done(err, user);
    });
});


// /user/student
app.use("/",auth);
app.use("/user",user);
// app.use("/user/student",student);
// app.use("/user/instructor",instructor);







app.listen(port, function () {
    console.log("Server started on port "+port);
  });
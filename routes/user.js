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

var {User} = require("../models/User.js")
var {Course} = require("../models/Course.js")



router.get("/:Role", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.redirect("../login");
    }  
    //console.log(req.user);
    var role = req.params.Role;
    var courses = [],
      courseIds = [];
    var q = User.findById(req.user._id);
    q.exec((err, user) => {
      if (err) {
        console.log("ERR: ", err);
      } else if (role == "student") {
        courseIds = user.SCourses;
        if (courseIds.length == 0) {
          //console.log(courses);
          return res.render(role, {
            ...(req.user),
            courses: courses
          });
        }
        courseIds.forEach(id => {
  
          let q2 = Course.findById(id);
          q2.exec((err, course) => {
            if (err) {
              console.log(err);
            } else if (course == null) {
              return res.render(role, {
                ...(req.user),
                courses: courses
              })
            } else 
              courses.push(course);
            if (courses.length == courseIds.length) 
              return res.render(role, {
                ...(req.user),
                courses: courses
              });
            }
          )
        })
      } else {
        courseIds = user.ICourses;
        //return res.render(role,{...(req.user),courses:courses});
        if (courseIds.length == 0) {
          //console.log(courses);
          return res.render(role, {
            ...(req.user),
            courses: courses
          });
        }
        courseIds.forEach(id => {
          //console.log(id);
          let q2 = Course.findById(id);
          q2.exec((err, course) => {
            if (err) {
              console.log(err);
            } else if (course == null) {
              return res.render(role, {
                ...(req.user),
                courses: courses
              })
            } else {
              courses.push(course);
              //console.log(course);
            }
            if (courses.length == courseIds.length) 
              return res.render(role, {
                ...(req.user),
                courses: courses
              });
            }
          )
        })
      }
    })
})

router.get("/profile", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.redirect("../login");
    }
    res.render("profile", {
      ...(req.user),
      Role: req.params.Role
    });
  })
  
  router.get("/editProfile", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.redirect("../login");
    }
    var userDetails = req.user;
    res.render("editProfile", {
      name: req.user.name,
      email: req.user.email,
      username: req.user.username,
      Role: req.params.Role
    });
  })
  
  router.post("/editProfile", (req, res) => {
    //res.send(req.body); res.json(req.body); var user=req.user;
    User.findOneAndUpdate({
      "_id": req.user._id
    }, {
      $set: {
        "name": req.body.name,
        "username": req.body.username
      }
    }, (err) => {
      if (err) 
        console.log(err);
      }
    )
    User.findOne({
      _id: req.user._id
    }, (err, user) => {
      if (err) {
        res.json({success: false, message: err});
      } else {
        if (!user) {
          res.json({success: false, message: 'User not found'});
        } else {
          //console.log(user);
          user.changePassword(req.body.oldpassword, req.body.newpassword, (err) => {
            if (err) {
              if (err.name === 'IncorrectPasswordError') {
                res.json({success: false, message: 'Incorrect password', oldpassword: req.body.oldpassword, newpassword: req.body.newpassword}); // Return error
              } else {
                res.json({success: false, message: 'Something went wrong!! Please try again after sometimes.'});
              }
            } else {
              res.json({success: true, message: 'Your password has been changed successfully'});
            }
          })
        }
      }
    })
    res.redirect("/" + req.params.Role);
    //res.redirect("/user/profile");
  })
  







module.exports = router
//jshint esversion:6

const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const connect = require("connect");
var session = require("express-session"),
  bodyParser = require("body-parser");
var passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const {Schema} = mongoose;
var _ = require('lodash');
// var registration = require('./controllers/register'); var User =
// require('./models/User.js');
const port = 3000;
const app = express();
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(session({secret: "aSecretToComputeTheHash", resave: false, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/MoodleDB", {useNewUrlParser: true});

var UserSchema = new Schema(
  { id: Number, 
    name: String, 
    username: String, 
    email: String
  })
UserSchema.plugin(passportLocalMongoose, {selectFields: "username name email"});
var User = mongoose.model("User", UserSchema);

//passport Strategy
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

// Home route

app.get("/home", (req, res) => {
  res.render("home");
})

//Register route

app.get("/register", (req, res) => {
  res.render("register");
})

app.post("/register",(req, res) => {
  var newUser = new User({username: req.body.username, email: req.body.email, name: req.body.name});
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
//Login route

app.get("/login", (req, res) => {
  res.render("login");
})

app.post('/login', passport.authenticate('local', {
  successRedirect: "/",
  failureRedirect: '/login'
}));

app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/home");
})
//Landing page route

app.get("/", (req, res) => {
  //res.render("LandingPage")
  if (req.isAuthenticated()) {
    res.render("Dashboard")
  } else {
    res.redirect("/home");
  }
})
app.get("/user/profile",(req,res)=>{
  res.render("profile",req.user);
})

app.get("/user/editProfile",(req,res)=>{
  res.render("editProfile",req.user);
})
app.post("/user/editProfile",(req,res)=>{
  //res.send(req.body);
  //res.json(req.body);
  //var user=req.user;
  User.findOneAndUpdate({"_id" : req.user._id},{
    $set : 
    {
      "name": req.body.name,
      "username": req.body.username
    }
  },(err)=>{
    console.log(err);
  })
  User.findOne({_id:req.user._id},(err,user)=>{
    if(err){
      res.json({success: false,message: err});
    }
    else{
      if(!user){
        res.json({ success: false, message: 'User not found' });
      }
      else{
        //console.log(user);
        user.changePassword(req.body.oldpassword,req.body.newpassword,(err)=>{
          if(err){
            if(err.name === 'IncorrectPasswordError'){
              res.json({ success: false, message: 'Incorrect password',oldpassword: req.body.oldpassword,newpassword: req.body.newpassword }); // Return error
            }else {
               res.json({ success: false, message: 'Something went wrong!! Please try again after sometimes.' });
            }
          }
          else{
            res.json({ success: true, message: 'Your password has been changed successfully' });
          }
        })
      }
    }
  })
  res.redirect("/");
  //res.redirect("/user/profile");
})
// schema.methods.changePassword = function(oldPassword, newPassword, cb) {
//   const promise = Promise.resolve()
//     .then(() => {
//       if (!oldPassword || !newPassword) {
//         throw new errors.MissingPasswordError(options.errorMessages.MissingPasswordError);
//       }
//     })
//     .then(() => this.authenticate(oldPassword))
//     .then(({ user }) => {
//       if (!user) {
//         throw new errors.IncorrectPasswordError(options.errorMessages.IncorrectPasswordError);
//       }
//     })
//     .then(() => this.setPassword(newPassword))
//     .then(() => this.save())
//     .then(() => this);

//   if (!cb) {
//     return promise;
//   }

//   promise.then(result => cb(null, result)).catch(err => cb(err));
// };
app.listen(port, function () {
  console.log("Server started on port 3000.");
});

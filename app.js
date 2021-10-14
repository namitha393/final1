//jshint esversion:6

const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
//const connect = require("connect");
var session = require("express-session"),
  bodyParser = require("body-parser");
var passport = require('passport');
//const passportLocalMongoose = require('passport-local-mongoose');
var {User}=require("./models/User.js")
var {Course}=require("./models/Course.js")
//const {Schema} = mongoose;
var _ = require('lodash');
const { toInteger } = require("lodash");
const e = require("express");
// var registration = require('./controllers/register'); var User =


const port = 3000;
const app = express();
app.set('view engine', 'ejs');
app.set("views",[__dirname+"/views",__dirname+"/views/landingpages",__dirname+"/views/authentication",__dirname+"/views/courses"])

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(session({secret: "aSecretToComputeTheHash", resave: false, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session());

//mongoose.connect("mongodb://localhost:27017/MoodleDB", {useNewUrlParser: true});

// var UserSchema = new Schema(
//   { id: Number, 
//     name: String, 
//     username: String, 
//     email: String
//   }
// )
// UserSchema.plugin(passportLocalMongoose, {selectFields: "username name email"});
// var User = mongoose.model("User", UserSchema);

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

//Login route

app.get("/login", (req, res) => {
  res.render("login");
})

app.post('/login', passport.authenticate('local', {
  successRedirect: "/student",
  failureRedirect: '/login'
}));

app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/home");
})
//Landing page route

app.get("/", (req, res) => {
  //res.render("LandingPage")
    res.redirect("/home");
})
app.get("/:Role/profile",(req,res)=>{
  res.render("profile",{...(req.user), Role: req.params.Role});
})

app.get("/:Role/editProfile",(req,res)=>{
  var userDetails=req.user;
  res.render("editProfile",{name: req.user.name,email:req.user.email,username:req.user.username,Role: req.params.Role});
})


app.post("/:Role/editProfile",(req,res)=>{
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
    if(err) console.log(err);
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
  res.redirect("/"+req.params.Role);
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

app.get("/:Role/join",(req,res)=>{
  res.render("joinCourse",{Role: req.params.Role});
})

var i_code=0,s_code=0;
app.get("/instructor/create",(req,res)=>{
  i_code=toInteger(Math.random()*8999+1000);
  s_code=toInteger(Math.random()*8999+1000);
  res.render("createCourse",{i_code: i_code,s_code:s_code});
})

app.get("/student/join",(req,res)=>{
  
})


app.get("/:Role", (req,res)=>{
  //console.log(req.user);
  var courses=[];
  res.render(req.params.Role,{...(req.user),courses:courses});
})



app.post("/instructor/create",async (req,res)=>{
 // console.log(req.body);
 //console.log(req.user);
  var newCourse=new Course({
    i_code: i_code,
    s_code: s_code,
    name: req.body.name,
    courseCode: req.body.courseCode,
    students: [],
    sem: req.body.sem,
    instructors: [req.user._id],
  })

})




app.listen(port, function () {
  console.log("Server started on port 3000.");
});

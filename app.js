//jshint esversion:6

const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
//const connect = require("connect");
var session = require("express-session"),
  bodyParser = require("body-parser");
var passport = require('passport');
//const passportLocalMongoose = require('passport-local-mongoose');
var {User} = require("./models/User.js")
var {Course} = require("./models/Course.js")
var {CourseSchema} = require("./models/Course.js")
var func = require("./Helpers/Functions");
const path = require("path");
const multer = require("multer");

//const {Schema} = mongoose;
var _ = require('lodash');
const {toInteger} = require("lodash");
const {off} = require("process");
const Assignment = require("./models/Assignment.js");
const Feedback = require("./models/Feedback.js");
const Submission = require("./models/Submission.js");
const {createCipheriv, timingSafeEqual} = require("crypto");
const csv = require('csv-parser');
const fs = require('fs');
const { getAssignments, getAssignments2, getParticipants } = require("./Helpers/Functions");

// var registration = require('./controllers/register'); var User =

const port = 3000;
const app = express();
app.set('view engine', 'ejs');
app.set("views", [
  __dirname + "/views",
  __dirname + "/views/landingpages",
  __dirname + "/views/authentication",
  __dirname + "/views/courses",
  __dirname + "/views/profile",
  __dirname + "/views/assignments",
  __dirname + "/views/participants"
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
// mongoose.connect("mongodb://localhost:27017/MoodleDB", {useNewUrlParser:
// true}); var UserSchema = new Schema(   { id: Number,     name: String,
// username: String,     email: String   } )
// UserSchema.plugin(passportLocalMongoose, {selectFields: "username name
// email"}); var User = mongoose.model("User", UserSchema); passport Strategy
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




//Rauthentication
app.get("/home", (req, res) => {
  res.render("home");
})
app.get("/register", (req, res) => {
  res.render("register");
})
app.post("/register", (req, res) => {
  var newUser = new User({username: req.body.username, email: req.body.email, name: req.body.name, SCourses: [], ICourses: [], TCourses:[]});
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
app.get("/login", (req, res) => {
  res.render("login");
})
app.post('/login', passport.authenticate('local', {
  successRedirect: "/student", //student instructor
  failureRedirect: '/login'
}));
app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/home");
})
app.get("/", (req, res) => {
  //res.render("LandingPage")
  res.redirect("/home");
})


//Reditprofile
app.get("/:Role/profile", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/login");
  }
  res.render("profile", {
    ...(req.user),
    Role: req.params.Role
  });
})
app.get("/:Role/editProfile", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/login");
  }
  var userDetails = req.user;
  res.render("editProfile", {
    name: req.user.name,
    email: req.user.email,
    username: req.user.username,
    Role: req.params.Role
  });
})
app.post("/:Role/editProfile", (req, res) => {
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

// schema.methods.changePassword = function(oldPassword, newPassword, cb) {
// const promise = Promise.resolve()     .then(() => {       if (!oldPassword ||
// !newPassword) {         throw new
// errors.MissingPasswordError(options.errorMessages.MissingPasswordError);
//  }     })     .then(() => this.authenticate(oldPassword))     .then(({ user
// }) => {       if (!user) {         throw new
// errors.IncorrectPasswordError(options.errorMessages.IncorrectPasswordError);
//      }     })     .then(() => this.setPassword(newPassword))     .then(() =>
// this.save())     .then(() => this);   if (!cb) {     return promise;   }
// promise.then(result => cb(null, result)).catch(err => cb(err)); };

app.get("/:Role/join", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/login");
  }
  res.render("joinCourse", {Role: req.params.Role});
})

var i_code = 0,
  s_code = 0,
  t_code=0;
app.get("/instructor/create", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/login");
  }
  i_code = toInteger(Math.random() * 8999 + 1000);
  s_code = toInteger(Math.random() * 8999 + 1000);
  t_code = toInteger(Math.random() * 8999 + 1000);
  res.render("createCourse", {
    i_code: i_code,
    s_code: s_code,
    t_code: t_code
  });
})

app.post("/:Role/join", (req, res) => {
  let role = req.params.Role,
    code = req.body.code;
  if (role == "student") {
    var q = Course.findOne({s_code: code});
  } else if(role=="instructor"){
    var q = Course.findOne({i_code: code});
  }
  else{
    var q=Course.findOne({t_code:code});
  }
  q.exec((err, course) => {
    //console.log(course);
    if (err) {
      console.log(err);
    } else if (course == null) {
      return res.redirect("/" + role);
    } else {
      var members = [];
      Course.findById(course._id, (err, course2) => {
        if (role == "student") {
          members = course.students;
        } else if(role=="instructor"){
          members = course.instructors;
        }
        else{
          members=course.tas;
        }
       // console.log(members);
        members.push(req.user._id);
        if (role == "student") 
          Course.findByIdAndUpdate(course._id, {
            $set: {
              students: members
            }
          }, (err) => {
            if (err) 
              console.log(err)
          });
        else if(role=="instructor"){
          Course.findByIdAndUpdate(course._id, {
            $set: {
              instructors: members
            }
          }, (err) => {
            if (err) 
              console.log(err)
          });
        } 
        else{
          Course.findByIdAndUpdate(course._id, {
            $set: {
              tas: members
            }
          }, (err) => {
            if (err) 
              console.log(err)
          });
        }
      })
      User.findById(req.user._id, (err, user) => {
        if (err) {
          console.log(err);
        } else {
          var courses = [];
          if (role == "student") {
            courses = user.SCourses;
          } else if(role=="instructor") {
            courses=user.ICourses;
          }
          else{
            courses=user.TCourses;
          }
          if(role!="ta") courses.push(course._id);
          else courses.push({courseId: course._id,flag: course.flag});
          if (role == "student") 
            User.findByIdAndUpdate(user._id, {
              $set: {
                SCourses: courses
              }
            }, (err) => {
              if (err) 
                console.log(err)
            });
          else if(role=="instructor")
            User.findByIdAndUpdate(user._id, {
              $set: {
                ICourses: courses
              }
            }, (err) => {
              if (err) 
                console.log(err)
            });
            else{
              User.findByIdAndUpdate(user._id, {
                $set: {
                  TCourses: courses
                }
              }, (err) => {
                if (err) 
                  console.log(err)
              });
            }
          }
        })
    }
    res.redirect("/" + role);
  })
})

//Rlandingpage
app.get("/:Role", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/login");
  }

  if (req.params.Role != "student" && req.params.Role != "instructor" &&req.params.Role!="ta") 
    return;
 // console.log(req.user);
  //console.log(req.user);
  if (!req.isAuthenticated()) {
    return res.redirect("/login");
  }
  var role = req.params.Role;
  func.getCourseIds(req.user._id,role,(Ids)=>{
    //console.log(Ids);
    func.getCourses(Ids,(courses)=>{
      //console.log(courses);
      return res.render(role,{
        ...(req.user),
        courses: courses
      })
    })
  })

  //console.log(courseIds);

})

app.post("/instructor/create", async(req, res) => {
  //console.log(req.body); console.log(req.user);
  var newCourse = new Course({
    i_code: i_code,
    s_code: s_code,
    t_code: t_code,
    name: req.body.name,
    courseCode: req.body.courseCode,
    students: [],
    sem: req.body.sem,
    instructors: [req.user._id],
    tas: [],
    flag: req.body.flag ? true : false
  })
  //var c=[];
  newCourse.save((err) => {
    if (err) {
      console.log("error: ");
      console.log(err);
    } else {
      res.redirect("/instructor");
    }
  });
  var courses = [];
  var q = User.findById(req.user._id);

  q.exec((err, user) => {
    if (user.ICourses.length != 0) 
      courses = user.ICourses;
    courses.push(newCourse._id);
    User.findByIdAndUpdate(req.user._id, {
      $set: {
        ICourses: courses
      }
    }, (err) => {
      if (err) 
        console.log(err);
      }
    );
  })

})

app.get("/student/courses/:courseName", async(req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/login");
  }
  var q = Course.findOne({name: req.params.courseName});
  q.exec(async(err, course) => {
    if (err) {
      console.log(err);
    } else if (course == null) {
      res.redirect("/student");
    } else {
      assIds = course.assignments;
      var data = [];
      if (assIds.length == 0) {
        //console.log("oof");
        return res.render("course_student", {course:course,data: data}) //update this
      }
      assIds.forEach(id => {
        Assignment.findById(id, (err, ass) => {
          //console.log(ass);
          Feedback.findOne({
            courseName: course.name,
            assName: ass.nameofA
          }, (err, feed) => {
            var l=data.length;
            var x = {
              feedback: "Not yet given",
              grade: "Not yet given",
              ass: ass
            }
            //console.log(feed);
            if (feed == null) {
              data.push(x);
              if (data.length == assIds.length) {
                return res.render("course_student", {
                  data: data,
                  course: course
                });
              }
            } else {
              var filename = feed.name;
              const file = `${__dirname}/public/` + filename;
              fs
                .createReadStream(file)
                .pipe(csv())
                .on("data", (row) => {
                  //console.log(req.user);
                  //console.log(row.Name + " " + req.user.name)
                  if (row.Name == req.user.name) {
                    var x2 = {
                      feedback: row.feedback,
                      grade: row.grade,
                      ass: ass
                    }
                    data.push(x2);
                    //console.log(data);
                  }
                })
                .on("end", () => {
                  if(l==data.length){
                    data.push(x);
                  }
                  if (data.length == assIds.length) {
                    return res.render("course_student", {
                      data: data,
                      course: course
                    });
                  }
                })
              }

          })

        })
      })
      //res.render("course_instructor",{course: course});
    }
  })
})
app.get("/instructor/courses/:courseName", async(req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/login");
  }
  var q = Course.findOne({name: req.params.courseName});
  q.exec(async(err, course) => {
    if (err) {
      console.log(err);
    } else if (course == null) {
      res.redirect("/instructor");
    } else {
      assIds = course.assignments;
      var ass = [];
      if (assIds.length == 0) {
        return res.render("course_instructor", {
          ass: ass,
          course: course
        })
      }
      assIds.forEach(id => {
        Assignment.findById(id, (err, ass1) => {
          ass.push(ass1);
          if (ass.length == assIds.length) {
            return res.render("course_instructor", {
              ass: ass,
              course: course
            });
          }
        })
      })
      //res.render("course_instructor",{course: course});
    }
  })
})
app.get("/ta/courses/:courseName",(req,res)=>{
  if (!req.isAuthenticated()) {
    return res.redirect("/login");
  }
  //console.log(req);
  var courseName=req.params.courseName;
  getAssignments2(courseName,"ta",(course,ass)=>{
    return res.render("course_ta",{
      ass: ass,
      course: course
    })
  })

})

app.get("/instructor/courses/:courseName/createAssignment", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/login");
  }
  var q = Course.findOne({name: req.params.courseName});
  q.exec(async(err, course) => {
    if (err) {
      console.log(err);
    } else if (course == null) {
      res.redirect("/instructor/courses/" + req.params.courseName);
    } else {
      res.render("createAssignment", {course: course});
    }
  })

})
app.post("/instructor/courses/:courseName/createAssignment", upload.single("myFile"), async(req, res) => {
  //console.log(req.file.filename);
  //console.log(req.body.time);
  var d=new Date(req.body.date+"T"+req.body.time+":00");

    const newFile = await Assignment.create({name: req.file.filename, nameofA: req.body.nameofA, desc: req.body.description, deadline: d,courseName: req.params.courseName});
    var q = Course.findOne({name: req.params.courseName});
    q.exec(async(err, course) => {
      var ass = course.assignments;
      ass.push(newFile._id);
      Course.findByIdAndUpdate(course._id, {
        $set: {
          assignments: ass
        }
      }, (err) => {
        if (err) 
          console.log(err)
      });
      res.redirect("/instructor/courses/" + req.params.courseName);
    })
  
});
app.get("/instructor/courses/:courseName/assignments/:assName", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/login");
  }
  var courseName=req.params.courseName;
  var assName=req.params.assName;
  Course.findOne({name:courseName},(err,course)=>{
    var students=course.students.length;
    Assignment.findOne({nameofA:assName},(err,ass)=>{
      var ts=Math.floor((ass.deadline-Date.now())/1000);
      var days=Math.floor(ts/(3600*24));
      var hrs=Math.floor((ts-days*3600*24)/(3600));
      var mins= Math.floor((ts-days*3600*24-hrs*3600)/60);
      var seconds=Math.floor((ts-days*3600*24-hrs*3600-mins*60));
      Submission.find({
        courseName: req.params.courseName,
        assName:assName
      },(err,subs)=>{
        if(err){
          console.log(err);
        }
        else{
          res.render("grader_assignment",{
            courseName:courseName,
            ass:ass,
            days: days,
            hrs: hrs,
            mins: mins,
            seconds: seconds,
            students: students,
            subs: subs
          });
        }
      })

    })
  })

  // Submission.find({
  //   courseName: req.params.courseName,
  //   assName: req.params.assName
  // }, (err, subs) => {
  //   if (err) {
  //     console.log(err);
  //   } else {
  //     res.render("viewSubmissions", {
  //       subs: subs,
  //       courseName: req.params.courseName,
  //       assName: req.params.assName
  //     });
  //   }
  // })
})
app.get("/student/courses/:courseName/assignments/:assName", (req, res) => {  
  if (!req.isAuthenticated()) {
    return res.redirect("/login");
  }
  var assName=req.params.assName;
  var courseName=req.params.courseName;
  var q = Course.findOne({name: req.params.courseName});
  q.exec(async(err, course) => {
    if (err) {
      console.log(err);
    } else if (course == null) {
      res.redirect("/student");
    } else {
      Assignment.findOne({
        nameofA: req.params.assName
      }, (err, ass) => {
        if (err) {
          console.log(err);
        } else if (ass == null) {
          res.redirect("/student");
        } else {
          var ts=Math.floor((ass.deadline-Date.now())/1000);
          var days=Math.floor(ts/(3600*24));
          var hrs=Math.floor((ts-days*3600*24)/(3600));
          var mins= Math.floor((ts-days*3600*24-hrs*3600)/60);
          var seconds=Math.floor((ts-days*3600*24-hrs*3600-mins*60));
          Submission.findOne({
            courseName: req.params.courseName,
            assName:assName,
            student: req.user
          },(err,sub)=>{
            if(err){
              console.log(err);
            }
            else{
              res.render("student_assignment",{
                course:course,
                ass:ass,
                days: days,
                hrs: hrs,
                mins: mins,
                seconds: seconds,
                sub: sub
              });
            }
          })
    
        }
      })
    }
  })
})
app.post("/student/courses/:courseName/assignments/:assName", upload.single("myFile"), async(req, res) => {
  try {
    const newSub = await Submission.create({
      name: req.file.filename,
      feedback: null,
      grade: null,
      courseName: req.params.courseName,
      assName: req.params.assName,
      student: req.user,
      FileName: req.body.name
    })
    var q = User.findById(req.user._id);
    q.exec(async(err, user) => {
      var subs = [];
      subs = user.submissions;
      subs.push(newSub._id);
      User.findByIdAndUpdate(req.user._id, {
        $set: {
          submissions: subs
        }
      }, (err) => {
        if (err) 
          console.log(err)
      });
      res.redirect("/student/courses/" + req.params.courseName);
    })
  } catch (error) {
    res.json({error});
  }
})
app.post("/instructor/courses/:courseName/assignments/:assName", upload.single("myFile"), async(req, res) => {

  try {
    // var b=req.file["buffer"]; console.log(b.toString());
    // console.log(b.toString()); console.log("wtf");
    const newF = await Feedback.create({name: req.file.filename, courseName: req.params.courseName, assName: req.params.assName})
    res.send({status: "Successfully uploaded"});
  } catch (err) {
    res.json({err})
  }
})
app.get('/download/assignment/:assName', function (req, res) {
  if (!req.isAuthenticated()) {
    return res.redirect("/login");
  }
  var assName = req.params.assName;
  //res.send(req.params.f)
  Assignment.findOne({
    nameofA: assName
  }, (err, ass) => {
    if (err) {
      console.log(err);
    } else {
      var filename = ass.name;
      const file = `${__dirname}/public/` + filename;
      res.download(file);
    }
  })
});
app.get('/download/submissions/:subId', function (req, res) {
  if (!req.isAuthenticated()) {
    return res.redirect("/login");
  }
  Submission.findById(req.params.subId, (err, sub) => {
    if (err) {
      console.log(err);
    } else {
      var filename = sub.name;
      const file = `${__dirname}/public/` + filename;
      res.download(file);
    }
  })
});

app.get("/:courseName/neParticipants",(req,res)=>{
  var courseName=req.params.courseName;
  getParticipants(courseName,p=>{
    //console.log(p);
    res.render("neParticipants",{p:p});
  })
})

app.get("/:courseName/eParticipants",(req,res)=>{
  var courseName = req.params.courseName;
  
})




app.listen(port, function () {
  console.log("Server started on port 3000.");
});
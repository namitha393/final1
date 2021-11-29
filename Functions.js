var {User} = require("./models/User.js")
var {Course} = require("./models/Course.js")
var {CourseSchema} = require("./models/Course.js")
const path = require("path");
const multer = require("multer");
const mongoose = require("mongoose");
var MongoClient = require('mongodb').MongoClient;
//const {Schema} = mongoose;
var _ = require('lodash');
const {toInteger, isDate} = require("lodash");
const {off} = require("process");
const Assignment = require("./models/Assignment.js");
const Feedback = require("./models/Feedback.js");
const {Var} = require("./models/Var.js");
const Submission = require("./models/Submission.js");
const {createCipheriv} = require("crypto");
const csv = require('csv-parser');
const fs = require('fs');
require('dotenv').config()
var exec = require('child_process').exec;
const passport = require("passport");
mongoose.Promise = global.Promise;
//var XMLHttpRequest = require('xhr2');
var https = require('https')
var request=require('request');
const axios = require('axios')

var currUser="";
var client= MongoClient.connect("mongodb://localhost:27017/MoodleDB");



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


var showCourses=function(){
  Course.find({},(err,courses)=>{
    if(err){
      console.log(err);
    }
    else{
      console.log(courses);
    }
    mongoose.disconnect();
    process.exit();
  })
}
var LogIn=function(info){
  var userN=info.username;
  var pwd=info.password;
  Var.count({},(err,count)=>{
    if(count==0){
      var v=new Var({currUser:"-"});
      v.save((err)=>{
        if(err) console.log(err);
        Var.findOne({},(err,v)=>{
          if(err){
            console.log(err);
            mongoose.disconnect();
            process.exit();
          }
          if(v.currUser!="-"){
            console.log("Please logout from the current session, to login with another account");
            mongoose.disconnect();
            process.exit();
          }
          else{
            User.findOne({username:userN},(err,user)=>{
              if(err){
                console.log(err);
              }      
              else{
                if(process.env[`${userN}`]!=pwd){
                  console.log("Username and Password are incorrect");
                  mongoose.disconnect();
                  process.exit();
                }
                else{
                  Var.findOneAndUpdate({},{$set:{currUser:userN}},(err)=>{
                    if(err) console.log(err);
                    console.log("Successfully logged in!");
                    mongoose.disconnect();
                    process.exit();
                  })
                  
                }
              }      
            })
          }
        })
      })
    }
    else{
      Var.findOne({},(err,v)=>{
        if(err){
          console.log(err);
          mongoose.disconnect();
          process.exit();
        }
        if(v.currUser!="-"){
          console.log("Please logout from the current session, to login with another account");
          mongoose.disconnect();
          process.exit();
          return;
        }
        else{
          User.findOne({username:userN},(err,user)=>{
            if(err){
              console.log(err);
            }      
            else{
              if(process.env[`${userN}`]!=pwd){
                console.log("Username and Password are incorrect");
                mongoose.disconnect();
                process.exit();
              }
              else{
                Var.findOneAndUpdate({},{$set:{currUser:userN}},(err)=>{
                  if(err) console.log(err);
                  console.log("Successfully logged in!");
                  mongoose.disconnect();
                  process.exit();
                })
                
              }
            }      
          })
        }
      })
    }
  })
}

var Logout=function(){
  Var.findOne({},(err,v)=>{
    if(v.currUser=="-"){
      console.log("First Login");
      mongoose.disconnect();
      process.exit();
    }
    else{
      Var.findOneAndUpdate({},{$set:{currUser:"-"}},(err)=>{
        if(err){
          console.log(err);
        }
        mongoose.disconnect();
        process.exit();
      })
      
    }
  })
}

var getCourses=()=>{
  Var.findOne({},(err,v)=>{
    if(v.currUser=="-"){
      console.log("Please login first");
      mongoose.disconnect();
      process.exit();
      return;
    }
    else{
      var name=v.currUser;
      User.findOne({username:name},(err,user)=>{
        var courseIds=user.SCourses;
        var ans=[];
        if(courseIds.length==0){
          console.log(ans);
          mongoose.disconnect();
          process.exit();
          return;
        }
        //console.log(courseIds);
        courseIds.forEach(c=>{
          Course.findById(c.courseID,(err,course)=>{
            ans.push(course.name);
            if(ans.length==courseIds.length){
              console.log(ans);
              mongoose.disconnect();
              process.exit();
              return;
            }
          })
        })
      })
    }
  })
}
var getAssignments=(courseName)=>{
  Var.findOne({},(err,v)=>{
    if(v.currUser=="-"){
      console.log("Please login first");
      mongoose.disconnect();
      process.exit();
      return;
    }
    else{
      var name=v.currUser;
      User.findOne({username:name},(err,user)=>{
        Course.findOne({name:courseName},(err,course)=>{
          if(course==null){
            console.log("Invalid course name");
            mongoose.disconnect();
            process.exit();
            return;
          }
          else{
            var assNames=[];
            Assignment.find({courseName:courseName},(err,ass)=>{
              if(ass.length==0){
                console.log(assNames);
                console.log(ass);
                mongoose.disconnect();
                process.exit();
                return;
              }
              ass.forEach(ass1=>{
                assNames.push(ass1.nameofA);
                if(assNames.length==ass.length){
                  console.log(assNames);
                  mongoose.disconnect();
                  process.exit();
                  return;
                }
              })
            })
          }
        })
      })
    }
  })
}
var getInfo=(courseName,assName)=>{
  Var.findOne({},(err,v)=>{
    if(v.currUser=="-"){
      console.log("Please login first");
      mongoose.disconnect();
      process.exit();
      return;
    }
    else{
      var name=v.currUser;
      User.findOne({username:name},(err,user)=>{
        Course.findOne({name:courseName},(err,course)=>{
          if(course==null){
            console.log("Invalid course name");
            mongoose.disconnect();
            process.exit();
            return;
          }
          else{
            var assNames=[];
            Assignment.findOne({courseName:courseName,nameofA:assName},(err,ass)=>{
              if(ass==null){
                console.log("Invalid entry");
                mongoose.disconnect();
                process.exit();
                return;
              }
              else{

                var obj={
                  Name: ass.nameofA,
                  CourseName: ass.courseName,
                  description: ass.desc,
                  Deadline: ass.deadline.toLocaleString()
                }
                console.log(obj);
                mongoose.disconnect();
                process.exit();
                return;
              }
            })
          }
        })
      })
    }
  })
}

var getGrades=(courseName,assName)=>{
  Var.findOne({},(err,v)=>{
    if(v.currUser=="-"){
      console.log("Please login first");
      mongoose.disconnect();
      process.exit();
      return;
    }
    else{
      var name=v.currUser;
      User.findOne({username:name},(err,user)=>{
        Course.findOne({name:courseName},(err,course)=>{
          if(course==null){
            console.log("Invalid course name");
            mongoose.disconnect();
            process.exit();
            return;
          }
          else{
            Submission.findOne({courseName:courseName,assName:assName,studentName:user.name},(err,sub)=>{
              if(sub==null){
                console.log("You didn't submit your solutions yet");
                mongoose.disconnect();
                process.exit();
                return;
              }
              else{
                var g="Not yet given"
                var f="Not yet given";
                if(sub.grade!=null){
                  g=sub.grade;
                }
                if(sub.feedback!=null){
                  f=sub.feedback;
                }
                var obj={
                  Grade: g,
                  Feedback: f
                }
                console.log(obj);
                mongoose.disconnect();
                process.exit();
                return;
              }
            })
          }
        })
      })
    }
  })
}

var f=function(url){
  exec(`start ${url}`,
    function (error, stdout, stderr) {
        //console.log('stdout: ' + stdout);
        //console.log('stderr: ' + stderr);
        if (error !== null) {
             console.log('exec error: ' + error);
        }
        else{
          console.log("Successfully downloaded");
          mongoose.disconnect();
          process.exit();
          return; 
        }
    });
    //window.open(url)
    //console.log(url);

}

var Download=(courseName,assName)=>{
  Var.findOne({},(err,v)=>{
    if(v.currUser=="-"){
      console.log("Please login first");
      mongoose.disconnect();
      process.exit();
      return;
    }
    else{
      var name=v.currUser;
      User.findOne({username:name},(err,user)=>{
        Course.findOne({name:courseName},(err,course)=>{
          if(course==null){
            console.log("Invalid course name");
            mongoose.disconnect();
            process.exit();
            return;
          }
          else{
            Assignment.findOne({courseName:courseName,nameofA:assName},(err,ass)=>{
              if(ass==null){
                console.log("Invalid entry");
                mongoose.disconnect();
                process.exit();
                return;
              }
              else{
                var url="http://localhost:3000/download/"+name+"/"+process.env[`${name}`]+"/assignment/"+assName;
                var path="/download/"+name+"/"+process.env[`${name}`]+"/assignment/"+assName;
                //console.log(url);
                f(url);
                //f(path);
              }
            })

          }
        })
      })
    }
  }) 
}

var Upload=(courseName,assName,path,fileName)=>{
  Var.findOne({},(err,v)=>{
    if(v.currUser=="-"){
      console.log("Please login first");
      mongoose.disconnect();
      process.exit();
      return;
    }
    else{
      var name=v.currUser;
      User.findOne({username:name},(err,user)=>{
        Course.findOne({name:courseName},(err,course)=>{
          if(course==null){
            console.log("Invalid course name");
            mongoose.disconnect();
            process.exit();
            return;
          }
          else{
            Assignment.findOne({courseName:courseName,nameofA:assName},(err,ass)=>{
              if(ass==null){
                console.log("Invalid entry");
                mongoose.disconnect();
                process.exit();
                return;
              }
              else{
                var url="http://localhost:3000/upload/"+name+"/"+process.env[`${name}`]+"/"+courseName+"/"+assName;
                //var path="/download/"+name+"/"+process.env[`${name}`]+"/assignment/"+assName;
                //console.log(url);
                var filename = path.replace(/^.*[\\\/]/, '');
                //fs.copyFile(filename);
                //console.log(filename);
                var dest=__dirname+`/public/files/admin-${Date.now()}-${filename}`;
                var subName=`files/admin-${Date.now()}-${filename}`;
                fs.copyFile(path,dest,async(err)=>{
                  if(err){
                    console.log(err);
                  }
                  else{
                    try {
                      const newSub = await Submission.create({
                        name: subName,
                        feedback: null,
                        grade: null,
                        courseName: courseName,
                        assName: assName,
                        studentID: user._id,
                        studentName: user.name,
                        FileName: filename
                      })
                      var q = User.findById(user._id);
                      q.exec(async(err, user1) => {
                        var subs = [];
                        subs = user1.submissions;
                       // console.log(subs);
                        subs.push(newSub._id);
                        User.findByIdAndUpdate(user1._id, {
                          $set: {
                            submissions: subs
                          }
                        }, (err) => {
                          if (err) 
                            console.log(err)
                          else{
                            console.log("successfully uploaded");
                            mongoose.disconnect();
                            process.exit();
                            return;
                          }
                        });
                      })
                    } catch (error) {
                      console.log(err);
                    }
                  }
                })
                //console.log(path);
                //console.log(__dirname);
                //f2(courseName,assName,path,fileName,url);
                //f(path);
              }
            })

          }
        })
      })
    }
  }) 
}

module.exports={
  showCourses,
  LogIn,
  Logout,
  getCourses,
  getAssignments,
  getInfo,
  getGrades,
  Download,
  Upload,
}
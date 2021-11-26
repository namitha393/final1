

//const passportLocalMongoose = require('passport-local-mongoose');
var {User} = require("../models/User.js")
var {Course} = require("../models/Course.js")
var {CourseSchema} = require("../models/Course.js")
const path = require("path");
const multer = require("multer");

//const {Schema} = mongoose;
var _ = require('lodash');
const {toInteger, isDate} = require("lodash");
const {off} = require("process");
const Assignment = require("../models/Assignment.js");
const Feedback = require("../models/Feedback.js");
const Submission = require("../models/Submission.js");
const {createCipheriv} = require("crypto");
const csv = require('csv-parser');
const fs = require('fs');


var getCourses=function(courseIds,role,userID,cb){
    var courses=[];
    if(courseIds.length==0){
      cb(courses);
      return;
    }
    if(role!="student"){
      courseIds.forEach(id => {
        let q2 = Course.findById(id);
        q2.exec((err, course) => {
          if (err) {
            console.log(err);
          } else if (course == null) {
            cb(courses);
            return;
          }else {
            var n=0,total=0;
            //console.log(n);
            Assignment.find({courseName:course.name},(err,ass)=>{
              ass.forEach(ass1=>{
                total+=1;
                if(ass1.flag) n+=1;
              })
              //console.log(n);
              if(total!=0) n=n*100/total;
              else n=100;
              courses.push({course: course,assfinished: n});  
              if(courses.length==courseIds.length){
                cb(courses);
              }
            })
          }
        })
      })
    }
    else{
      User.findById(userID,(err,user)=>{
        if(err){
          console.log(err);
        }
        else{
          var courses=[];
          var scourses=user.SCourses;
          if(scourses.length==0){
            cb(courses);
          }
          scourses.forEach(obj=>{
            var courseID=obj.courseID;
            Course.findById(courseID,(err,course)=>{
              if(err){
                console.log(err);
              }
              else{
                var ass=obj.ass;
                var n=0,total=0;
                ass.forEach(obj2=>{
                  total+=1;
                  if(obj2.flag) n+=1;
                })
                if(total!=0) n=n*100/total;
                else n=100;
                courses.push({course:course,assfinished: n});
                if(courses.length==courseIds.length){
                  cb(courses);
                }
              }
            })
          })
        }
      })
    }
}
var getCourseIds=function(user,role,cb){
  User.findById(user._id,(err,user)=>{
    if (err) {
      console.log("ERR: ", err);
      return;
    }
    if(role=="ta"){
      //console.log(user.TCourses)
      Ids=[];
      if(user.TCourses.length==0){
        cb(Ids);
        return;
      }
      user.TCourses.forEach(obj=>{
        Ids.push(obj.courseId);
      })
      cb(Ids);
    }
    else if(role=="student"){
      cb(user.SCourses);
    }
    else if(role=="instructor"){
      cb(user.ICourses);
    }
  })
}
var getAssignments=function(Ids,cb){
  var ass=[];
  if(Ids.length==0){
    cb(ass);
    return;
  }
  Ids.forEach(id=>{
    Assignment.findById(id,(err,ass1)=>{
      ass.push(ass1);
      if(ass.length==Ids.length){
        cb(ass);
        return;
      }
    })
  })
}
var getAssignments2=function(courseName,role,cb){
  var q = Course.findOne({name: courseName});
  q.exec(async(err, course) => {
    if (err) {
      console.log(err);
    } else if (course == null) {
      res.redirect("/"+role);
    } else {
      assIds = course.assignments;
      getAssignments(assIds,(ass)=>{
        cb(course,ass);
      })
      //res.render("course_instructor",{course: course});
    }
  })
}
var getUsers=function(Ids,cb){
  var users=[];
  if(Ids.length==0){
    cb(users);
  }
  Ids.forEach(id=>{
    User.findById(id,(err,user)=>{
      users.push(user);
      if(users.length==Ids.length){
        cb(users);
      }
    })
  })
}
var getParticipants=function(courseName,cb){
  var p=[];
  var q = Course.findOne({name: courseName});
  q.exec(async(err, course) => {
    if (err) {
      console.log(err);
    }
    else{
      getUsers(course.students,(users)=>{
        //console.log("stds: "+ users);
        users.forEach(user=>{
          p.push({role:"student",user:user});
        })
      })
      getUsers(course.tas,(users)=>{
        //console.log("tas: "+ users);
        users.forEach(user=>{
          p.push({role:"ta",user:user});
        })
      })
      getUsers(course.instructors,(users)=>{
        //console.log("teas: "+ users);
        users.forEach(user=>{
          p.push({role:"instructor",user:user});
        })
        cb(p);
      })
      //while(x1+x2+x3!=3){}
      
    }
  })
}
var func={getCourses,getCourseIds,getAssignments,getAssignments2,getParticipants,getUsers};
module.exports=func;
  

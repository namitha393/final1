

const mongoose = require("mongoose");
const passportLocalMongoose = require('passport-local-mongoose');
const {Schema} = mongoose;


mongoose.connect("mongodb://localhost:27017/MoodleDB", {
  useNewUrlParser: true,

});


var CourseSchema = new Schema(
  {
      i_code: Number,
      s_code: Number,
      t_code: Number,
      name:  {type: String,unique: false},
      courseCode:  {type: String,unique: false},
      students: {type: [String],unique: false},
      instructors:  {type: [String],unique: false},
      flag1: Boolean, // if tas can create assignments
      flag2: Boolean, // if tas can enroll students
      tas: {type: [String],unique: false},
      sem:  {type: String,unique: false},
      assignments: [String],
  }
)

var Course = mongoose.model("Course", CourseSchema);

exports.Course=Course;
exports.CourseSchema=CourseSchema

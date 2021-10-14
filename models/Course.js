

const mongoose = require("mongoose");
const passportLocalMongoose = require('passport-local-mongoose');
const {Schema} = mongoose;


mongoose.connect("mongodb://localhost:27017/MoodleDB", {useNewUrlParser: true});

var CourseSchema = new Schema(
  {
      i_code: Number,
      s_code: Number,
      name: String,
      courseCode: String,
      students:[String],
      instructors: [String],
      sem: String
  }
)

var Course = mongoose.model("Course", CourseSchema);

exports.Course=Course;
exports.CourseSchema=CourseSchema
const mongoose = require("mongoose");
const {Schema} = mongoose;
var {User}=require("./User");
var {UserSchema}=require("./User");
// Creating a Schema for uploaded files


mongoose.connect("mongodb://localhost:27017/MoodleDB", {
  useNewUrlParser: true,

});

const submissionSchema = new Schema({
  createdAt: {
    type: Date,
    default: Date.now,
  },
  name: {
    type: String,
    required: [true, "Uploaded file must have a name"],
  },
  feedback: String,
  grade: String,
  courseName: String,
  assName: String,
  student: UserSchema,
  FileName: String

  //nameofS: String,
});

// Creating a Model from that Schema
var Submission = mongoose.model("Submission", submissionSchema);

// Exporting the Model to use it in app.js File.
module.exports = Submission;
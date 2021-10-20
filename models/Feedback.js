const mongoose = require("mongoose");
const {Schema} = mongoose;
// Creating a Schema for uploaded files


mongoose.connect("mongodb://localhost:27017/MoodleDB", {
  useNewUrlParser: true,

});

const feedbackSchema = new Schema({
  createdAt: {
    type: Date,
    default: Date.now,
  },
  name: {
    type: String,
    required: [true, "Uploaded file must have a name"],
  },
  courseName: String,
  assName: String
});

// Creating a Model from that Schema
var Feedback = mongoose.model("Feedback", feedbackSchema);

// Exporting the Model to use it in app.js File.
module.exports =Feedback;
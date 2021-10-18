const mongoose = require("mongoose");
const {Schema} = mongoose;
// Creating a Schema for uploaded files
const fileSchema = new Schema({
  createdAt: {
    type: Date,
    default: Date.now,
  },
  name: {
    type: String,
    required: [true, "Uploaded file must have a name"],
  },
});

// Creating a Model from that Schema
var File = mongoose.model("File", fileSchema);

// Exporting the Model to use it in app.js File.
module.exports = File;
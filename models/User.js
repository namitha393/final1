
const mongoose = require("mongoose");
const passportLocalMongoose = require('passport-local-mongoose');
const {Schema} = mongoose;


mongoose.connect("mongodb://localhost:27017/MoodleDB", {
  useNewUrlParser: true,

});


var UserSchema = new Schema(
  { 
    name: String, 
    username: String, 
    email: String,
    SCourses: [String],
    ICourses: [String],
  }
)
UserSchema.plugin(passportLocalMongoose, {selectFields: "username name email SCourses ICourses"});
var User = mongoose.model("User", UserSchema);

exports.User=User;
exports.UserSchema=UserSchema;
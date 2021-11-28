
const mongoose = require("mongoose");
const passportLocalMongoose = require('passport-local-mongoose');
const {Schema} = mongoose;
var bcrypt = require('bcryptjs');


mongoose.connect("mongodb://localhost:27017/MoodleDB", {
  useNewUrlParser: true,

});


var UserSchema = new Schema(
  { 
    name: String, 
    username: String, 
    email: String,
    SCourses: [{
      courseID: String,
      ass: [{
        assID: String,
        flag: Boolean, //true if it's done
      }],
    }],
    ICourses: [String],
    TCourses: [{courseId: String,flag: Boolean}], //flag is true if he can create assignments
    submissions: [String] // I have used this field earlier, in this updated version you needn't use it, can directly get them from SCourses field
  }
)
UserSchema.plugin(passportLocalMongoose, {selectFields: "username name email SCourses ICourses"});
var User = mongoose.model("User", UserSchema);


exports.User=User;
exports.UserSchema=UserSchema;
//exports.comparePassword=UserSchema.methods.comparePassword
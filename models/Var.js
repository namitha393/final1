

const mongoose = require("mongoose");
const passportLocalMongoose = require('passport-local-mongoose');
const {Schema} = mongoose;



mongoose.connect("mongodb://localhost:27017/MoodleDB", {
  useNewUrlParser: true,

});


VarSchema=new Schema({
  currUser: String
})

var Var = mongoose.model("Var", VarSchema);
exports.Var=Var;
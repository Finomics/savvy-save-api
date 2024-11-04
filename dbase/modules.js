const mongoose = require("mongoose");
const { dbURI } = require("../core/index");

/////////////////////////////////////////////////////////////////////////////////////////////////

// let dbURI = 'mongodb://localhost:27017/abc-database';
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true });

////////////////mongodb connected disconnected events///////////////////////////////////////////////
mongoose.connection.on("connected", function () {
  //connected
  console.log("Mongoose is connected");
});

mongoose.connection.on("disconnected", function () {
  //disconnected
  console.log("Mongoose is disconnected");
  process.exit(1);
});

mongoose.connection.on("error", function (err) {
  //any error
  console.log("Mongoose connection error: ", err);
  process.exit(1);
});

process.on("SIGINT", function () {
  /////this function will run jst before app is closing
  console.log("app is terminating");
  mongoose.connection.close(function () {
    console.log("Mongoose default connection closed");
    process.exit(0);
  });
});
////////////////mongodb connected disconnected events///////////////////////////////////////////////


// user Profile Start

let userProfileSchema = mongoose.Schema({
  fullName: String,
  email: String,
  userDoB: String,
  govId: String,
  IdType: String,
  idProof:String,
  address:String,
  addressProof:String,
  country: String,
  contactNumber: String,
  profession: String,
  proofofProfession: String,
  linkedCredentials: String,
  riskScore:String,
  createdOn: { type: Date, default: Date.now },
});

let userProfile = mongoose.model("UserProfile", userProfileSchema);

// user Profile End

// user Profile Start

let userCredentialsSchema = mongoose.Schema({
  username: String,
  email: String,
  password: String,
  status: String,

  createdOn: { type: Date, default: Date.now },
});

let userCredentials = mongoose.model("UserCredentials", userCredentialsSchema);

// user Profile End

// user goal start
let userGoalSchema = mongoose.Schema({
  goalName: String,
  templateId: String,
  targetValue: Int,
  initialContribution: Int,
  frequency: String,
  recurring: Int,
  timeHorizon: Int,
  status: String,
  createdOn: { type: Date, default: Date.now },
});
let userGoals = mongoose.model("UserGoals", userGoalSchema);

// user goals end
module.exports = {
  userProfile: userProfile,
  userCredentials: userCredentials

};

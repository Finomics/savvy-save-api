const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
const multer = require("multer");
const morgan = require("morgan");
const postmark = require("postmark");
const app = express();
let authRoutes = require("./auth");
let authRoutesDas = require("./dasboard");
let kuickpayRoutes = require("./kuickpay");
let nodemailer = require("nodemailer");
const https = require("https");
let parseString = require("xml2js").parseString;
let date_ob = new Date();
const { ServerSecretKey, PORT } = require("./core/index");
const {
 userCredentials,
 userProfile,userGoals
} = require("./dbase/modules");
const serviceAccount = require("./firebase/firebase.json");
const client = new postmark.Client("fa2f6eae-eaa6-4389-98f0-002e6fc5b900");

let http = require("http");
const { log } = require("console");
let APIKey = "23660c0f820f472379b8638bfa4f47f6"; //"f51c3293f9caacc25126cfc70764ccfd";
let sender = "8583";

const transporter = nodemailer.createTransport({
  host: "mail.tecstik.com",
  port: 465,
  auth: {
    user: "appSupport@tecstik.com",
    pass: "hammadazfar",
  },
});

let docEamil;
let receiver;
let textmessage;

let setBelongs;
let setRider;
let setClient;
let setClientName;
let setMode;
let setqty;










app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan("short"));
app.use("/auth", authRoutes);
//app.use("/dash", authRoutesDas);
//app.use("/kuickpay", kuickpayRoutes);

const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: function (req, file, cb) {
    cb(
      null,
      `${new Date().getTime()}-${file.filename}.${file.mimetype.split("/")[1]}`
    );
  },
});

const upload = multer({ storage: storage });

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://toys-97d91-default-rtdb.firebaseio.com",
});

const bucket = admin.storage().bucket("gs://toys-db4fb.appspot.com");



app.get("/", (req, res, next) => {
  console.log("SAVVY SAVE Server is Live:");
      res.send("Server is live");
   
  });

// Upload Imag Api

app.post("/upload", upload.any(), (req, res, next) => {
  bucket.upload(req.files[0].path, (err, file, apiResponse) => {
    if (!err) {
      file
        .getSignedUrl({
          action: "read",
          expires: "03-09-2491",
        })
        .then((urlData, err) => {
          !err
            ? res.status(200).send({
                ImageUrl: urlData[0],
              })
            : res.send(err);
        });
    } else {
      res.status(500).send();
    }
  });
});

//  creating UserProfile

app.post("/userProfile", (req, res, next) => {
  if (!req.body.fullName || !req.body.email) {
    res.status(409).send(`
      Please send proper request body, like:
      fullName:"MyName",
      email:"myemail@domain.com ,
      userDoB:"MMDDYY" ,
      govId: "req.body.govId",
      IdType: "req.body.IdType",
      idProof:"req.body.idProof",
      address:"req.body.address",
      addressProof:"req.body.addressProof",
      country: "req.body.country",
      contactNumber: "req.body.contactNumber",
      profession: "req.body.profession",
      proofofFunds: "req.body.proofofFunds",
      linkedCredentials: "req.body.linkedCredentials",
      riskScore:""
                `);
    return;
  } else {
    
    const newProfile = new userProfile({
      fullName: req.body.fullName,
      email: req.body.email,
      userDoB: req.body.userDoB,
      govId: req.body.govId,
      IdType: req.body.IdType,
      idProof:req.body.idProof,
      address:req.body.address,
      addressProof:req.body.addressProof,
      country: req.body.country,
      contactNumber: req.body.contactNumber,
      profession: req.body.profession,
      proofofFunds: req.body.proofofFunds,
      linkedCredentials: req.body.linkedCredentials,
      riskScore:""
    });
    console.log("Created User Profile Object:",newProfile)
    newProfile.save((err, doc) => {
      if (!err) {
         res.status(200).send({message:"User Profile Successfully Created, ",result:doc});
      
      } else {
        res.status(500).send("Error in creating userProfile, " + err);
      }
    });



  
  }
});

//  creating Goal

app.post("/createGoal", (req, res, next) => {
  if (!req.body.goalName || !req.body.templateId) {
    res.status(409).send(`
      Please send proper request body, like:
     goalName: "Education,
  templateId: 1,
  targetValue: 500000,
  initialContribution: 50.000,
  frequency: "Monthly",
  recurring: 5000,
  timeHorizon:365, in days
  status:"draft  ,// draft, funded, matured, redeemed
                `);
    return;
  } else {
    
    const newGoal = new userGoals({
      goalName: req.body.goalName,
      templateId: req.body.templateId,
      targetValue: req.body.targetValue,
      initialContribution: req.body.initialContribution,
      frequency: req.body.frequency,
      recurring: req.body.recurring,
      timeHorizon:req.body.timeHorizon,
      status:"draft"

   
    });
    console.log("Created User goal Object:",newGoal)
    newGoal.save((err, doc) => {
      if (!err) {
         res.status(200).send({message:"User Goal Successfully Created, ",result:doc});
      
      } else {
        res.status(500).send("Error in creating userGoal, " + err);
      }
    });



  
  }
});

//API to receive filter and return multi filtered Users--- might need deleting
app.post("/multiFilteredUsers", (req, res, next) => {
  if (!req.body.filter) {
    res.status(409).send(`
        Please send filter in json body
        e.g:
        "filter":"{}",
    `);
  } else {
    userProfile.find(req.body.filter, (err, doc) => {
      if (!err) {
        res.send(doc);
      } else {
        res.send(err);
      }
    });
  }
});

// update filtered  User Profile
app.put("/UpdateFilteredUserProfile", (req, res, next) => {
  if (!req.body.filter || !req.body.update) {
    res.status(409).send(`
      Please send filter and update in json body
      e.g:
      "filter":"{}",
      "update":"{}"
  `);
  } else {
    userProfile.findOneAndUpdate(req.body.filter, req.body.update, (err, doc) => {
      if (doc) {
        res.status(200).send({message:"User Profile Successfully Updated.",result:doc});
      } else {
        res.send(err, "ERROR");
      }
    });
  }
});

























function authenticate(username,password,res){


  console.log("In Authenticate",username,password );
  const requser="user1";
  reqPassword="test";

  if(username==requser && password==reqPassword){
      console.log("Authentication Passed",username,password );
      return true;
  }else{
      console.log("Authenticationfailed",username,password );
      return true;//TODO change to falsefor failed Authentication
          
  }

  }
  
app.listen(PORT, () => {
  console.log("start server....", `http://localhost:${PORT}`);
});

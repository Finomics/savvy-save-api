const express = require("express");
const {
  userCredentials
  
} = require("./dbase/modules");
let nodemailer = require("nodemailer");
let app = express.Router();







// change password

app.post("/ChangePassword", (req, res, next) => {
  console.log(req.body.employeePassword);
  if (!req.body.empolyeeObjectId) {
    res.send("empolyeeObjectId has been required");
  } else {
    employee.findById({ _id: req.body.empolyeeObjectId }, (err, doc) => {
      if (!err) {
        if (req.body.employeePassword === doc.employeePassword) {
          doc.update(
            { employeePassword: req.body.newPassword },
            {},
            function (err, data) {
              console.log("password updated");
              res.send("Password has been Change Successfull");
            }
          );
        } else {
          res.send("Please Correct the Password");
        }
      } else {
        res.send("Empolyee not found");
      }
    });
  }
});

// login

app.post("/login", (req, res, next) => {
  if (!req.body.loginId || !req.body.password) {
    res.status(403).send(
      `please send email and passwod in json body.
            e.g:
             {
            "email": "myMail@gmail.com",
            "password": "abc",
         }`
    );
    return;
  }
  employee.findOne({ loginId: req.body.loginId }, function (err, doc) {
    console.log(doc);
    if (!err&&doc) {
      if (req.body.password === doc.employeePassword) {
        res.send(doc);
      } else{
        
        res.status(403).send({
          message: "Incorrect Password",
        });
      }
    } else {
      res.status(403).send({
        message: "User not Found",
      });
    }
  });
});

// Create user signup

app.post("/userSignup", (req, res, next) => {
  if (!req.body.username || !req.body.password) {
    res.status(409).send(`
                    Please send complete request body
              username:,
              email: 
      password: 
                `);
    return;
  } else {
    userCredentials.findOne({ loginId: req.body.loginId }, (err, doc) => {
      if (!err && !doc) {
        let user = new userCredentials({
          username: req.body.username,
          email: req.body.email,
          password: req.body.password,
          status: "Signup",
        });
        user.save((err, doc) => {
          console.log("Response from server", err,doc);

          if (!err) {
             res.status(200).send("User Successfully Created, ",doc);
          
          } else {
            res.status(500).send("Error in creating user, " + err);
          }
        });
      } else if (err) {
        console.log("Response from server", err,doc);
        res.status(500).send({
          message: "Server encuntered an error",
        });
      } else {
        res.send({
          message: "User already exist",
        });
      }
    });
  }
});

// Super Admin
app.get("/employe", (req, res, next) => {
  employee.find({ Role: "Awaiting" }, (err, data) => {
    if (!err) {
      res.send(data);
    } else {
      res.status(500).send("error");
    }
  });
});

//Post Admin



// Get Admin

app.get("/AdminEmploye", (req, res, next) => {
  employee.find({ Role: "Admin" }, (err, data) => {
    if (!err) {
      res.send(data);
    } else {
      res.status(500).send("error");
    }
  });
});





//  Filter Api Transaction








app.post("/empolyeeClientData", (req, res, next) => {
  if (!req.body.EmployeeObjectId) {
    res.status(409).send(`
        Please send EmployeeObjectId in json body
        e.g:
        "EmployeeObjectId":"EmployeeObjectId",
        "ClientObjectId":"ClientObjectId"
    `);
  } else {
    employee.find({ _id: req.body.EmployeeObjectId }, (err, doc) => {
      if (!err) {
        clientdata.find({ _id: req.body.ClientObjectId }, (err, data) => {
          if (!err) {
            res.send({
              Employee: doc,
              Client: data,
            });
          } else {
            res.send(err);
          }
        });
      } else {
        res.send(err);
      }
    });
  }
});

// Filter Client Api--TODO.  redundant check later

app.post("/filterClient", (req, res, next) => {
  if (!req.body.filter) {
    res.status(409).send(`
        Please send filter in json body
        e.g:
        "filter":"{}",
    `);
  } else {
    clientdata.find(req.body.filter, (err, doc) => {
      if (!err) {
        res.send(doc);
      } else {
        res.send(err);
      }
    });
  }
});

// =======================export
module.exports = app;

const express = require("express");
const {
  employee,
  payment,
  Transaction,
  clientdata,
  quota,
} = require("./dbase/modules");
let nodemailer = require("nodemailer");
let app = express.Router();

let http = require("http");
let APIKey = "f51c3293f9caacc25126cfc70764ccfd";
let sender = "8583";

const transporter = nodemailer.createTransport({
  host: "mail.tecstik.com",
  port: 465,
  auth: {
    user: "appSupport@tecstik.com",
    pass: "hammadazfar",
  },
});

function emailSnd(doc) {
  console.log(doc, "sending email");
  let mailOptions = {
    from: "appSupport@tecstik.com",
    to: doc.employeeEmail,
    subject: "Your account has been created successfully!",
    // html: `<h1>Your ${doc.employeeName} account has been created on KollectIt as role ${doc.Role}</h1>`,
    html: `<html>

    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Email</title>
    </head>
    
    <body style="font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif; color: black;">
        <div style="padding: 5%; margin: 5%;">
            <img src="https://assets.unlayer.com/stock-templates1686637583455-kollect-logo.png" alt="KollectIt logo"
                style="display: block; margin-left: auto;margin-right: auto;">
            <br />
            <br />
            <br />
            <div>
                <div style="padding: 1%;">
                    <p>Dear <b>${doc.employeeName}</b>,</p>
                </div>
                <div style="padding: 1%;">
                    <p>This is an automated email from the KollectIt app.</p>
                </div>
                <div style="padding: 1%;">
                    <p>Your account on KollectIt app has successfully been created for <b>${doc.companyName}</b> as role of <b>${doc.Role}</b>
                        with the following details:</p>
                </div>
            </div>
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style=" border: 1px solid black;  text-align: left; padding: 8px;">Name</td>
                    <td style=" border: 1px solid black;  text-align: left; padding: 8px;"><b>${doc.employeeName}</b></td>
                </tr>
                <tr>
                    <td style=" border: 1px solid black;  text-align: left; padding: 8px;">Organization</td>
                    <td style=" border: 1px solid black;  text-align: left; padding: 8px;"><b>${doc.companyName}</b></td>
                </tr>
                <tr>
                    <td style=" border: 1px solid black;  text-align: left; padding: 8px;">role</td>
                    <td style=" border: 1px solid black;  text-align: left; padding: 8px;"><b>${doc.Role}</b></td>
                </tr>
            </table>
            <div style="padding: 1%;">
                <p>Your account on KollectIt app has successfully been created for <b>${doc.companyName}</b> as role of <br> ${doc.Role}
                    with the following details:</p>
            </div>
            <br />
            <br />
            <div style="background-color: #CFE2F3;">
                <div style="padding: 1%;">
                    <p>You may download the app from Android Play Store and Apple App Store to continue using The KollectIt
                        Mobile App with your login credentials.</p>
                </div>
                <div style="padding: 1%;">
                    <p>We advise you to immediately change your password after the first time you log in.</p>
                </div>
                <div style="padding: 1%;">
                    <p>Have a look at KollectIt’s tutorials using the following link:</p>
                </div>
                <div style="padding: 1%;">
                    <a href="">http://kollectit.tecstik.com</a>
                </div>
    
            </div>
            <div>
                <div>
                    <h3 style="margin-left: 4%;">From</h4>
                </div>
                <div>
                    <img src="https://assets.unlayer.com/stock-templates1686642734482-tecstik.png" style="display: block;">
                </div>
                <div>
                    <h3 style="margin-left: 4%;">TecStik</h4>
                </div>
    
            </div>
    
            <div style="background-color: #134F5C; color: white; padding: 2; ">
                <p style="padding: 1%;">KollectIt is a payment collection app by TecStik TM to address the issues faced
                    in Payment
                    collection.</p>
            </div>
        </div>
    </body>
    
    </html>`,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log("error=>", error);
    } else {
      console.log("Email sent: =>" + info.response);
    }
  });
}

function smsSnd(doc) {
  console.log("sending sms");
  let receiver = doc.employeeEmail;
  let textmessage = `<h1>Your ${doc.employeeName} account has been created on KollectIt as role ${doc.Role}</h1>`;
  let options = {
    host: "api.veevotech.com",
    path:
      "/sendsms?hash=" +
      APIKey +
      "&receivenum=" +
      receiver +
      "&sendernum=" +
      encodeURIComponent(sender) +
      "&textmessage=" +
      encodeURIComponent(textmessage),
    method: "GET",
    setTimeout: 30000,
  };
  let req = http.request(options, (res) => {
    res.setEncoding("utf8");
    res.on("data", (chunk) => {
      console.log(chunk.toString());
    });
    console.log("STATUS: " + res.statusCode);
  });
  req.on("error", function (e) {
    console.log("problem with request: " + e.message);
  });
  console.log(options, "options");
  console.log(receiver, "receiver");
  req.end();
}
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

// Create Empolyee

app.post("/employe", (req, res, next) => {
  if (!req.body.loginId || !req.body.password) {
  } else {
    employee.findOne({ loginId: req.body.loginId }, (err, doc) => {
      if (!err && !doc) {
        let employ = new employee({
          loginId: req.body.loginId,
          employeeName: req.body.name,
          employeeEmail: req.body.email,
          companyName: req.body.companyName,
          shortCode: req.body.shortCode,
          employeePassword: req.body.password,
          employeeContactNum: req.body.employeeContactNum,
          createdBy: req.body.createdBy,
          Role: req.body.Role,
        });
        employ.save((err, doc) => {
          if (!err) {
            if (doc.Role.toLowerCase() == "admin") {
              let newQuota = new quota({
                Limit: 5,
                Utilized: 0,
                BelongsTo: doc._id,
                CreditBalance: 0,
                Rate: 10,
              });
              newQuota.save((err, qta) => {
                console.log("Employee with quota", doc, qta);
                res.send({ message: "Admin  created", data: { doc, qta } });
                emailSnd(doc);
              });
            } else {
              res.send({ message: "Member  created", doc });
              emailSnd(doc);
            }
            // req.body.employeeNumber ? emailSnd(doc) : emailSnd(doc);
            // emailSnd(doc);
            // /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(req.body.email)
            //   ? emailSnd(doc)
            //   : smsSnd(doc);
          } else {
            res.status(500).send("Error in creating Employee, " + err);
          }
        });
      } else if (err) {
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

app.post("/AdminEmploye", (req, res, next) => {
  employee.findById({ _id: req.body.id }, (err, data) => {
    if (data) {
      data.updateOne(
        { Role: req.body.Role, Role: "Admin" },
        (err, updatestatus) => {
          if (updatestatus) {
            res.send({ message: "Admin created Successfuly" });
          } else {
            res.send(err, "ERROR");
          }
        }
      );
    } else {
      res.status(409).send({
        message: "employee Not Find",
      });
    }
  });
});

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

// Post  Cashier
app.post("/CashierEmploye", (req, res, next) => {
  employee.findById({ _id: req.body.id }, (err, data) => {
    if (data) {
      data.updateOne(
        { Role: req.body.Role, Role: "Cashier" },
        (err, updatestatus) => {
          if (updatestatus) {
            res.send({ message: "Admin created Successfully!" });
          } else {
            res.send(err, "ERROR");
          }
        }
      );
    } else {
      res.status(409).send({
        message: "employee Not Find",
      });
    }
  });
});

// Get Cashier

app.get("/CashierEmploye", (req, res, next) => {
  employee.find({ Role: "Cashier" }, (err, data) => {
    if (!err) {
      res.send(data);
    } else {
      res.status(500).send("error");
    }
  });
});

// Post Rider

app.post("/RiderEmploye", (req, res, next) => {
  employee.findById({ _id: req.body.id }, (err, data) => {
    if (data) {
      data.updateOne(
        { Role: req.body.Role, Role: "Rider" },
        (err, updatestatus) => {
          if (updatestatus) {
            res.send({ message: "Admin created Successfully!" });
          } else {
            res.send(err, "ERROR");
          }
        }
      );
    } else {
      res.status(409).send({
        message: "employee Not Find",
      });
    }
  });
});

//  get Rider

app.get("/RiderEmploye", (req, res, next) => {
  employee.find({ Role: "Rider" }, (err, data) => {
    if (!err) {
      res.send(data);
    } else {
      res.status(500).send("error");
    }
  });
});
//- bulk transfer

app.post("/bulkTransfer", (req, res, next) => {
  console.log("In Bulk ransfer", req.body);

  let filters = req.body.filter;
  let transactiondata = req.body.transaction;

  payment.updateMany(
    { _id: { $in: filters } },
    { $set: { heldby: req.body.heldby } },
    { multi: true },
    function (err, records) {
      if (err) {
        res.status(409).send({
          message: "PaymenTrasfer Error",
          err,
        });
      } else {
        const newtransaction = new Transaction({
          Nature: transactiondata.nature,
          Instrument: transactiondata.Instrument,
          PaymentAmount: transactiondata.PaymentAmount,
          BelongsTo: transactiondata.BelongsTo,
          From: transactiondata.From,
          to: transactiondata.to,
        });
        newtransaction
          .save()
          .then((data) => {
            res.send(data);
          })
          .catch((err) => {
            res.status(500).send({
              message: "an error occured : " + err,
            });
          });
      }
    }
  );
});
//- single transfer
app.post("/paymentTransfer/:id", (req, res, next) => {
  // console.log(req.params.id, "dd");
  // console.log(req.body.id,"dddddddd");

  payment.findById(req.params.id, (err, data) => {
    if (!err) {
      data.updateOne(
        { heldby: req.body.heldby },

        (UpdateData, UpdateError) => {
          if (UpdateData) {
            res.send({
              message: "Payment Trasfare has been successfully!",
              data,
              UpdateData,
              status: 200,
            });
          } else {
            res.send(UpdateError);
          }
        }
      );
    } else {
      res.status(409).send({
        message: "PaymenTrasfer Error",
        err,
      });
    }
  });
});

app.post("/transaction", (req, res, next) => {
  if (!req.body.nature) {
    res.status(409).send(`
        Please send nature in json body
        e.g:
        "nature":"Recive && Transfer",
    `);
  } else {
    const newtransaction = new Transaction({
      Nature: req.body.nature,
      Instrument: req.body.Instrument,
      PaymentAmount: req.body.PaymentAmount,
      BelongsTo: req.body.BelongsTo,
      From: req.body.From,
      to: req.body.to,
    });
    newtransaction
      .save()
      .then((data) => {
        res.send(data);
      })
      .catch((err) => {
        res.status(500).send({
          message: "an error occured : " + err,
        });
      });
  }
});
//  Filter Api Transaction

app.post("/filterTransaction", (req, res, next) => {
  if (!req.body.filter) {
    res.status(409).send(`
        Please send filter in json body
        e.g:
        "filter":"{}",
    `);
  } else {
    Transaction.find(req.body.filter, (err, doc) => {
      if (!err) {
        res.send(doc);
      } else {
        res.send(err);
      }
    });
  }
});

app.post("/ShowRiderData", (req, res, next) => {
  if (!req.body.ClientRiderObjectId) {
    res.status(409).send(`
    Please send ClientRiderObjectId in json body
    e.g:
    "ClientRiderObjectId":"ClientRiderObjectId",
`);
  } else {
    clientdata.find(
      { ClientRiderObjectId: req.body.ClientRiderObjectId },
      (err, data) => {
        if (!err) {
          res.send(data);
        } else {
          res.status(500).send("error");
        }
      }
    );
  }
});

app.post("/craetedby", (req, res, next) => {
  if (!req.body.createdBy) {
    res.send("error");
  } else {
    employee.find(
      { createdBy: req.body.createdBy, Role: req.body.Role },
      (err, data) => {
        if (!err) {
          res.send(data);
        } else {
          res.send(err);
        }
      }
    );
  }
});

app.post("/BelongsTo", (req, res, next) => {
  if (!req.body.createdBy) {
    res.status(409).send(`
        Please send createdBy in json body
        e.g:
        "createdBy":"createdBy",
    `);
  } else {
    clientdata.find({ BelongsTo: req.body.createdBy }, (err, doc) => {
      if (!err) {
        res.send(doc);
      } else {
        res.send(err);
      }
    });
  }
});

app.post("/TransactionBelongsTo", (req, res, next) => {
  if (!req.body.BelongsTo) {
    res.status(409).send(`
        Please send BelongsTo in json body
        e.g:
        "BelongsTo":"BelongsTo",
    `);
  } else {
    Transaction.find({ BelongsTo: req.body.BelongsTo }, (err, doc) => {
      if (!err) {
        res.send(doc);
      } else {
        res.send(err);
      }
    });
  }
});

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

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
 userProfile
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
    newProfile.save((err, doc) => {
      if (!err) {
         res.status(200).send({message:"User Profile Successfully Created, ",result:doc});
      
      } else {
        res.status(500).send("Error in creating userProfile, " + err);
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
        res.status(200).send({message:"User Profile Successfully Updated, ",result:doc});
      } else {
        res.send(err, "ERROR");
      }
    });
  }
});









//API to receive filter and return filtered Payments
app.post("/smsLedger", (req, res, next) => {
  if (!req.body.filter) {
    res.status(409).send(`
        Please send filter in json body
        e.g:
        "filter":"{}",
    `);
  } else {
    SmSledger.find(req.body.filter, (err, doc) => {
      if (!err) {
        res.send(doc);
      } else {
        res.send(err);
      }
    });
  }
});
//  ReSend OTP

app.post("/ReSendOTP", (req, res) => {
  if (!req.body.PayObjectId) {
    res.send("email");
  } else {
    payment.findOne({ _id: req.body.PayObjectId }, (err, data) => {
      if (!err) {
        receiver = data.PaymentNumber;
        email = data.PaymentEmail;
        textmessage = `Here is verify Otp code: ${data.VerificationCode.toString()}`;

        employee.findById({ _id: data.Rider_id }, (riderErr, riderData) => {
          if (!riderErr) {
            smsSnd(receiver, textmessage);
            otpEmail(email, textmessage);

            setBelongs = data.BelongsTo;
            setRider = data.Rider_id;
            setClient = data.PaymentClientId;
            setClientName = data.PaymentName;
            setMode = "Deduct";
            setqty = 1;
            smsIncrement();
            // smsIncrement(setBelongs, setRider, setClient, setMode, setqty)
            // console.log("Sending OTPs", receiver, data.PaymentEmail);
            //  ==================>
            res.send(data);
          } else {
          }
        });
      } else {
        res.send(err);
      }
    });
  }
});

// Post conformationPayment

// Get all Data Payment Api

app.get("/", (req, res, next) => {
  payment.find({}, (err, data) => {
    !err
      ? res.send({
          Data: data,
        })
      : res.status(500).send("error");
  });
});

//API to check quota
app.post("/filteredQuota", (req, res, next) => {
  if (!req.body.filter) {
    res.status(409).send(`
        Please send filter in json body
        e.g:
        "filter":"{}",
    `);
  } else {
    quota.find(req.body.filter, (err, doc) => {
      if (!err) {
        res.send(doc);
      } else {
        res.send(err);
      }
    });
  }
});
//API to check how many payment Exist
app.post("/checkExist", (req, res, next) => {
  if (!req.body.filter) {
    res.status(409).send(`
        Please send filter in json body
        e.g:
        "filter":"{}",
    `);
  } else {
    payment.find(req.body.filter, (err, doc) => {
      if (!err) {
        res.send(doc.length.toString());
      } else {
        res.send(err);
      }
    });
  }
});

//API to receive filter and return multi filtered Clients
app.post("/filteredClients", (req, res, next) => {
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

//API to receive filter and return multi filtered Employee
app.post("/filteredEmployee", (req, res, next) => {
  if (!req.body.filter) {
    res.status(409).send(`
        Please send filter in json body
        e.g:
        "filter":"{}",
    `);
  } else {
    employee.find(req.body.filter, (err, doc) => {
      if (!err) {
        res.send(doc);
      } else {
        res.send(err);
      }
    });
  }
});

//API to receive filter and return multi filtered Payments--- might need deleting
app.post("/multiFilteredPayments", (req, res, next) => {
  if (!req.body.filter) {
    res.status(409).send(`
        Please send filter in json body
        e.g:
        "filter":"{}",
    `);
  } else {
    payment.find(req.body.filter, (err, doc) => {
      if (!err) {
        res.send(doc);
      } else {
        res.send(err);
      }
    });
  }
});

//--update filtered clients

app.put("/UpdateFilteredClients", (req, res, next) => {
  console.log("HeaDERS",req.headers)
  const auth=authenticate(req.headers['username'],req.headers['password'],res);

  console.log("response from Auth",auth);
  if(!auth){
      const text="Invalid Credentials"
      response={           
          response_Code: "04", 
          Identification_parameter : req.body.consumer_number, 
          reserved:text
          }


res.send(response);
return;
  }
  if (!req.body.filter || !req.body.update) {
    res.status(409).send(`
      Please send filter and update in json body
      e.g:
      "filter":"{}",
      "update":"{}"
  `);
  } else {
    clientdata.findOneAndUpdate(req.body.filter, req.body.update, (err, doc) => {
      if (doc) {
        res.send(doc);
      } else {
        res.send(err, "ERROR");
      }
    });
  }
});

// update filtered  Payments
app.put("/UpdateFilteredPayments", (req, res, next) => {
  if (!req.body.filter || !req.body.update) {
    res.status(409).send(`
      Please send filter and update in json body
      e.g:
      "filter":"{}",
      "update":"{}"
  `);
  } else {
    payment.findOneAndUpdate(req.body.filter, req.body.update, (err, doc) => {
      if (doc) {
        res.send(doc);
      } else {
        res.send(err, "ERROR");
      }
    });
  }
});

//API to receive filter and return filtered Payments
app.post("/filteredPayments", (req, res, next) => {
  if (!req.body.filter) {
    res.status(409).send(`
        Please send filter in json body
        e.g:
        "filter":"{}",
    `);
  } else {
    payment.find(req.body.filter, (err, doc) => {
      if (!err) {
        res.send(doc);
      } else {
        res.send(err);
      }
    });
  }
});

// collectionsby
app.post("/collectionBy", (req, res, next) => {
  let item = {
    name: res.heldby,
    cheque: 0,
    cash: 0,
    count: 0,
    totalAmount: 0,
  };
  payment.find({ heldby: req.body.heldby }, (err, data) => {
    if (!err) {
      //  res.send(data);
      for (let i = 0; i < data.length; i++) {
        item.totalAmount = item.totalAmount + parseInt(data[i].PaymentAmount);
        item.count = data.length;
        if (data[i].PaymentMode == "Cash") {
          item.cash += data[i].PaymentAmount;
        } else if (data[i].PaymentMode == "Cheque") {
          item.cheque += parseInt(data[i].PaymentAmount);
        } else {
          item.others += dparseInt(data[i].PaymentAmount);
        }
        console.log("Item", item);
      }
      res.send(item);
    } else {
      res.status(500).send("error");
    }
  });
});

app.get("/heldBy", (req, res, next) => {
  payment.find({ heldby: req.body.heldby }, (err, data) => {
    if (!err) {
      res.send(data);
    } else {
      res.status(500).send("error");
    }
  });
});

/* summary by cashier
 */
app.post("/CashierSummary", (req, res, next) => {
  let collections = [];
  let cashiers = [];
  employee.find({ Role: "Cashier" }, (err, data) => {
    if (!err) {
      cashiers = data;
      console.log("Cashiers length", cashiers.length);
      let result = test(data);
      res.send(result);
    }
  });
  // function test(cashiers){
  //     console.log("Cashiers lengthin test",cashiers.length);
  //     return"done testing";
  // }
  console.log("Cashiers outside", cashiers);
});

function test(cashiers) {
  console.log("Cashiers length in test", cashiers.length);
  let collections = [];
  for (let i = 0; i < cashiers.length; i++) {
    //    console.log("in cashier loop");
    let payments = [];
    payment.find({ heldby: cashiers[i].employeeName }, (err, data) => {
      // finding all payments held by cashier
      if (!err) {
        payments = data; // stores all  payments of specific cashier
        //  console.log("Payments by casier",cashiers[i].employeeName ,payments.length);
        let item = getsummaryItems(cashiers[i].employeeName, payments);
        collections.push(item);
      } else {
        res.status(500).send("errorin finding payments of a cashier");
      }
    });
    let item = getsummaryItems(cashiers[i].employeeName, payments);
    collections.push(item);
  }
  //  console.log("Collections",collections);
  return collections;
}

//- internal function
function getsummaryItems(name, payments) {
  let item = {
    employeeNamr: name,
    cheques: 0,
    cash: 0,
    count: 0,
    others: 0,
    totalAmount: 0,
  };
  console.log("in Summary Item", name, payments.length);
  for (let i = 0; i < payments.length; i++) {
    item.totalAmount = item.totalAmount + payments[i].PaymentAmount;
    item.count = payments.length;
    if (payments[i].PaymentMode == "Cash") {
      item.cash += payments[i].PaymentAmount;
    } else if (payments[i].PaymentMode == "Cheque") {
      item.cheque += payments[i].PaymentAmount;
    } else {
      item.others += payments[i].PaymentAmount;
    }
  }
  return item;
}

//Post All Api with ClientData

app.post("/ClientData", (req, res, next) => {
  if (!req.body.ClientId || !req.body.ClientName) {
    res.status(409).send(`
                    Please send PaymentName  in json body
                    e.g:
                    "ClientId":"ClientId",
                    "ClientName": "ClientName",
                    "ClientPhoneNumber": "ClientPhoneNumber",
                    "ClientAmount": "ClientAmount"
                    "ClientEmail": "ClientEmail"
                `);
    return;
  } else {
    const newClient = new clientdata({
      ClientId: req.body.ClientId,
      ClientName: req.body.ClientName,
      ClientPhoneNumber: req.body.ClientPhoneNumber,
      ClientAmount: req.body.ClientAmount,
      ClientEmail: req.body.ClientEmail,
      ClientRider: "Select Rider",
      BelongsTo: req.body.BelongsTo,
    });
    newClient
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

//Get All Api with ClientData
app.get("/ClientData", (req, res, next) => {
  clientdata.find({}, (err, data) => {
    if (!err) {
      res.send({
        Data: data,
      });
    } else {
      res.status(500).send("error");
    }
  });
});

app.post("/ClientDataUpdate", (req, res, next) => {
  // console.log(req.body.id);
  // console.log(req.body.ClientRider);

  let updateObj = {};

  if (req.body.ClientRider) {
    updateObj.ClientRider = req.body.ClientRider;
  }
  if (req.body.ClientRiderObjectId) {
    updateObj.ClientRiderObjectId = req.body.ClientRiderObjectId;
  }
  if (req.body.CashierName) {
    updateObj.CashierName = req.body.CashierName;
  }
  if (req.body.AssignedBy) {
    updateObj.AssignedBy = req.body.AssignedBy;
  }
  if (req.body.amount) {
    updateObj.ClientAmount = req.body.amount;
  }
  clientdata.findByIdAndUpdate(
    req.body.id,
    updateObj,
    { new: true },
    (err, data) => {
      if (!err) {
        res.send({
          data: data,
          message: "Rider assigned successfully",
          // status: 200
        });
      } else {
        res.status(500).send("error happened");
      }
    }
  );
});
//Post api to to create Merchant

app.post("/CreateMerchant", (req, res, next) => {
  if (!req.body.MerchantId || !req.body.MerchantName|| !req.body.ShortCode) {
    res.status(409).send(`
                    Please send Complete Details   in json body
                    e.g:
                    "MerchantId":"MerchantId,
                    "MerchantName": "MerchantName",
            
                    "ShortCode": "ShortCode"
                    "
                `);
    return;
  } 
    const newMerchant = new Merchant({

      MerchantId :req.body.MerchantId,
      MerchantName: req.body.MerchantName,
      ShortCode:req.body.ShortCode,
      BillCounter:0
     
    });
   
    newMerchant
      .save()
      .then((data) => {
        res.send(data);
      })
      .catch((err) => {
        res.status(500).send({
          message: "an error occured in Creating Merchant " + err,
        });
      });
  }
);
// function getBillNo(merchantId,res){
//   Merchant.findOne({ MerchantId: merchantId }, (err, data) => {
//     if (data) {
//       let  newBillNo = parseInt(data.BillCounter) + 1;
//    //   console.log("BillNo",newBillNo,data);
//       data.BillCounter = newBillNo;
//       data.updateOne({ BillCounter: newBillNo}, (err, updata) => {
//         console.log("BillNo",newBillNo,updata);
//         if (updata) {

//           console.log("BillNo",newBillNo,updata);
//           console.log("Bill No. in Function",newBillNo);
//           return newBillNo;
        
        
//       }}
//       );
//     } else {
//       res.status(409).send({
//         message: "MerchantID not Found",
//       });
//     }
//   });
// }

//Post api to generate bill

app.post("/generateBill", (req, res, next) => {
  if (!req.body.ClientId || !req.body.ClientObjectId|| !req.body.ClientName|| !req.body.MerchantId) {
    res.status(409).send(`
                    Please send Complete Details   in json body
                    e.g:
                    "ClientId":"ClientId",
                    "ClientName": "ClientName",
            
                    "TxnId": "ClientAmount"
                    "Aamount_within_dueDate": "Amount", 
      "Amount_after_dueDate": "Amount",
      "Due_date":"Date"
                `);
    return;
  } 


    Merchant.findOne({ MerchantId: req.body.MerchantId }, (err, merchdata) => {
      if (merchdata) {
        let  newCounter = parseInt(merchdata.BillCounter) + 1;
        let  newBillNo= merchdata.MerchantId.toString() + newCounter;
     

        const newBill = new Bill({

          Consumer_Detail :req.body.ClientName,
          Bill_Number: newBillNo,
          ClientId:req.body.ClientId,
          ClientObjectId:req.body.ClientObjectId,
          Bill_status: "U", 
          Due_date: req.body.Due_date,
          Aamount_within_dueDate: req.body.Aamount_within_dueDate, 
          Amount_after_dueDate: req.body.Amount_after_dueDate, 
          Billing_month: req.body.Billing_month,
          Date_paid:"",
          Amount_paid:"",
          Tan_auth_Id: "", 
    
         
        });
        console.log("New Bill Object",newBill)
        newBill
          .save()
          .then((data) => {console.log("MerchantData",data,merchdata)

            res.send({bill:data,merchant:merchdata});
          })
          .catch((err) => {
            res.status(500).send({
              message: "an error occured in bill generation: " + err,
            });
          });



          merchdata.BillCounter = newBillNo;
          merchdata.updateOne({ BillCounter: newCounter}, (err, updata) => {
          console.log("BillNo",newBillNo,updata);
          if (updata) {
  
            console.log("BillNo",newBillNo,updata);
            console.log("Bill No. in Function",newBillNo);
            return newBillNo;
          
          
        }}
        );
      } else {
        res.status(409).send({
          message: "MerchantID not Found",
        });
      }
    });
    
  }
);
app.post("/BillInquiry", (req, res, next) => {
  //Check Authorization
//console.log("Request in Bill Inquiry",req);
  if (!req.body.onsumer_number||!req.body.bank_mnemonic) {
    res.status(409).send(`
        Please send requesr body in proper format like:

        consumer_number”: “0000812345”,
“bank_mnemonic”:“KPY”,
“reserved”: “something, special, string, can, be, send, into, it.”
  
    `);
  } else {
    Bill.findOne({ Bill_Number: req.body.onsumer_number }, (err, data) => {
      if (data) {

       console.log("in Bill inquiry",data)


        let response={
          response_Code:"00", 
consumer_Detail :data.Consumer_Detail ,
bill_status: data.Bill_status, 
due_date: data.Due_date,
amount_within_dueDate:data.Aamount_within_dueDate.toString() , 
amount_after_dueDate: data.Amount_after_dueDate.toString(), 
billing_month: "0809",
date_paid: data.Date_paid,
amount_paid: data.Amount_paid,
tran_auth_Id: data.Tran_auth_Id, 
reserved:"tesr"
        }
        res.send(response);
      if (!err) {
       
      } else {
        res.send(err);
      }
    }
    });
  }
});
app.post("/billPayment", (req, res, next) => {
  Bill.findOneAndUpdate(
    { Bill_Number: req.body.Bill_Number },
    { Bill_status: req.body.Bill_status,
      Date_paid:req.body.Date_paid,
      Amount_paid:req.body.Amount_paid

     },
    (err, data) => {
      if (data) {
        res.send(data);
      } else {
        res.status(409).send({
          message: "ID is Not Find",
        });
      }
    }
  );

return});

app.post("/UpadateQuota", (req, res, next) => {
  quota.findOneAndUpdate(
    { BelongsTo: req.body.BelongsTo },
    { Limit: req.body.Limit },
    (err, data) => {
      if (data) {
        res.send({ message: "Limit Update" });
      } else {
        res.status(409).send({
          message: "ID is Not Find",
        });
      }
    }
  );
});

app.post("/AddQuota", (req, res, next) => {
  quota.findOne({ BelongsTo: req.body.BelongsTo }, (err, data) => {
    if (data) {
      let UpdtaeLimit = data.Limit + req.body.amount;
      // res.send(data)
      data.Limit = UpdtaeLimit;
      data.save((UpdateData, UpdateError) => {
        if (!UpdateData) {
          res.send({
            message: "Add Limit Update",
            UpdateData,
            data,
            status: 200,
          });
          setBelongs = req.body.BelongsTo;
          setMode = "ADD";
          setqty = req.body.amount;
          smsIncrement();
        }
      });
    } else {
      res.status(409).send({
        message: "ID is Not Find",
      });
    }
  });
});

app.post("/UpdateEmpolyee", (req, res, next) => {
  if (!req.body.filter || !req.body.Update) {
    res.status(409).send(`
          Please send filter in json body
          e.g:
          "filter":"{}",
      `);
  } else {
    employee.findOneAndUpdate(req.body.filter, req.body.Update, (err, data) => {
      if (!err) {
        res.send({
          data: data,
          message: "Empolyee Update",
          status: 200,
        });
      } else {
        res.status(500).send("error");
      }
    });
  }
});

function CraeteVoucher(amount, description, mode) {
  const newVoucher = new Voucher({
    Mode: mode,
    Amount: amount,
    Description: description,
    BelongsTo: setBelongs,
  });
  newVoucher
    .save()
    .then((data) => {
      console.log(data, "Voucher Create");
    })
    .catch((err) => {
      console.log(err);
    });
}

app.post("/filteredVoucher", (req, res, next) => {
  if (!req.body.filter) {
    res.status(409).send(`
        Please send filter in json body
        e.g:
        "filter":"{}",
    `);
  } else {
    Voucher.find(req.body.filter, (err, doc) => {
      if (!err) {
        res.send(doc);
      } else {
        res.send(err);
      }
    });
  }
});

app.post("/AddCredit", (req, res, next) => {
  if (!req.body.BelongsTo) {
    res.status(409).send(`
        Please send BelongsTo & amount in json body
    `);
  } else {
    quota.findOne({ BelongsTo: req.body.BelongsTo }, (err, doc) => {
      let UpdateAmount = doc.CreditBalance + req.body.amount;
      if (!err) {
        doc.updateOne({ CreditBalance: UpdateAmount }, (err, data) => {
          if (!err) {
            // console.log(data, "Add Cradit", setClientName);
            let amount = req.body.amount;
            let description = `Add Cradit`;
            let mode = `Cradit`;
            setBelongs = req.body.BelongsTo;
            CraeteVoucher(amount, description, mode);
          } else {
            console.log(err);
          }
        });
        res.send(doc);
      } else {
        res.send(err);
      }
    });
  }
});

app.post("/UpdateCrediteBlance", (req, res, next) => {
  if (!req.body.BelongsTo) {
    res.status(409).send(`
        Please send BelongsTo & amount in json body
    `);
  } else {
    quota.findOne({ BelongsTo: req.body.BelongsTo }, (err, doc) => {
      if (!err) {
        doc.updateOne({ CreditBalance: req.body.amount }, (err, data) => {
          if (!err) {
            console.log(data);
          } else {
            console.log(err);
          }
        });
        res.send("Upadate Creadit Blance");
      } else {
        res.send(err);
      }
    });
  }
});

app.post("/UpadteRate", (req, res, next) => {
  if (!req.body.BelongsTo) {
    res.status(409).send(`
        Please send BelongsTo & amount in json body
    `);
  } else {
    quota.findOne({ BelongsTo: req.body.BelongsTo }, (err, doc) => {
      if (!err) {
        doc.updateOne({ Rate: req.body.amount }, (err, data) => {
          if (!err) {
            console.log(data);
          } else {
            console.log(err);
          }
        });
        res.send("Update Rate");
      } else {
        res.send(err);
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

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
  payment,
  employee,
  otpModel,
  clientdata,
  quota,
  SmSledger,
  Voucher,
  Bill,Merchant
} = require("./dbase/modules");
const serviceAccount = require("./firebase/firebase.json");
const client = new postmark.Client("fa2f6eae-eaa6-4389-98f0-002e6fc5b900");
// const client = new postmark.Client("404030c2-1084-4400-bfdb-af97c2d862b3");
// let client = new postmark.ServerClient("404030c2-1084-4400-bfdb-af97c2d862b3");
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
function emailSnd(message, email) {
  console.log("sending email");
  let mailOptions = {
    from: "appSupport@tecstik.com",
    to: email,
    subject: "KollectIt",
    html: `<h1>Your ${message}</h1>`,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log("Email error=>", error);
    } else {
      console.log("Email sent: =>" + info.response);
    }
  });
}
//- otp  email
function otpEmail(email, textmessage) {
  // console.log(textmessage, docEamil, "sending otp email");
  let mailOptions = {
    from: "appSupport@tecstik.com",
    to: email,
    subject: "KollectIt OTP ",
    html: `<!DOCTYPE html>
    <html>
    
    <head>
        <title></title> <!-- The title tag shows in email notifications, like Android 4.4. -->
    
        <link href="https://fonts.googleapis.com/css?family=Lato:300,400,700" rel="stylesheet">
    
    
        <style>
            html,
            body {
                margin: 0 auto !important;
                padding: 0 !important;
                height: 100% !important;
                width: 100% !important;
                background: #f1f1f1;
            }
    
            /* What it does: Stops email clients resizing small text. */
            * {
                -ms-text-size-adjust: 100%;
                -webkit-text-size-adjust: 100%;
            }
    
            /* What it does: Centers email on Android 4.4 */
            div[style*="margin: 16px 0"] {
                margin: 0 !important;
            }
    
            /* What it does: Stops Outlook from adding extra spacing to tables. */
            table,
            td {
                mso-table-lspace: 0pt !important;
                mso-table-rspace: 0pt !important;
            }
    
            /* What it does: Fixes webkit padding issue. */
            table {
                border-spacing: 0 !important;
                border-collapse: collapse !important;
                table-layout: fixed !important;
                margin: 0 auto !important;
            }
    
            img {
                -ms-interpolation-mode: bicubic;
            }
    
            a {
                text-decoration: none;
            }
    
           
            .unstyle-auto-detected-links *,
            .aBn {
                border-bottom: 0 !important;
                cursor: default !important;
                color: inherit !important;
                text-decoration: none !important;
                font-size: inherit !important;
                font-family: inherit !important;
                font-weight: inherit !important;
                line-height: inherit !important;
            }
    
            .a6S {
                display: none !important;
                opacity: 0.01 !important;
            }
    
            .im {
                color: inherit !important;
            }
    
            img.g-img+div {
                display: none !important;
            }
    
            @media only screen and (min-device-width: 320px) and (max-device-width: 374px) {
                u~div .email-container {
                    min-width: 320px !important;
                }
            }
    
          
            @media only screen and (min-device-width: 375px) and (max-device-width: 413px) {
                u~div .email-container {
                    min-width: 375px !important;
                }
            }
    
           
            @media only screen and (min-device-width: 414px) {
                u~div .email-container {
                    min-width: 414px !important;
                }
            }
        </style>
  
    
        <!-- Progressive Enhancements : BEGIN -->
        <style>
            .primary {
                background: #30e3ca;
            }
    
            .bg_white {
                background: #ffffff;
            }
    
            .bg_light {
                background: #fafafa;
            }
    
            .bg_black {
                background: #000000;
            }
    
            .bg_dark {
                background: rgba(0, 0, 0, .8);
            }
    
            .email-section {
                padding: 2.5em;
            }
    
            /*BUTTON*/
            .btn {
                padding: 10px 15px;
                display: inline-block;
            }
    
            .btn.btn-primary {
                border-radius: 5px;
                background: #30e3ca;
                color: #ffffff;
            }
    
            .btn.btn-white {
                border-radius: 5px;
                background: #ffffff;
                color: #000000;
            }
    
            .btn.btn-white-outline {
                border-radius: 5px;
                background: transparent;
                border: 1px solid #fff;
                color: #fff;
            }
    
            .btn.btn-black-outline {
                border-radius: 0px;
                background: transparent;
                border: 2px solid #000;
                color: #000;
                font-weight: 700;
            }
    
            h1,
            h2,
            h3,
            h4,
            h5,
            h6 {
                font-family: 'Lato', sans-serif;
                color: #000000;
                margin-top: 0;
                font-weight: 400;
            }
    
            body {
                font-family: 'Lato', sans-serif;
                font-weight: 400;
                font-size: 15px;
                line-height: 1.8;
                color: rgba(0, 0, 0, .4);
            }
    
            a {
                color: #30e3ca;
            }
    
    
    
            /*LOGO*/
    
            .logo h1 {
                margin: 0;
            }
    
            .logo h1 a {
                color: #30e3ca;
                font-size: 24px;
                font-weight: 700;
                font-family: 'Lato', sans-serif;
            }
    
            /*HERO*/
            .hero {
                position: relative;
                z-index: 0;
            }
    
            .hero .text {
                color: rgba(0, 0, 0, .3);
            }
    
            .hero .text h2 {
                color: #000;
                font-size: 40px;
                margin-bottom: 0;
                font-weight: 400;
                line-height: 1.4;
            }
    
            .hero .text h3 {
                font-size: 24px;
                font-weight: 300;
            }
    
            .hero .text h2 span {
                font-weight: 600;
                color: #30e3ca;
            }
    
    
            /*HEADING SECTION*/
    
            .heading-section h2 {
                color: #000000;
                font-size: 28px;
                margin-top: 0;
                line-height: 1.4;
                font-weight: 400;
            }
    
            .heading-section .subheading {
                margin-bottom: 20px !important;
                display: inline-block;
                font-size: 13px;
                text-transform: uppercase;
                letter-spacing: 2px;
                color: rgba(0, 0, 0, .4);
                position: relative;
            }
    
            .heading-section .subheading::after {
                position: absolute;
                left: 0;
                right: 0;
                bottom: -10px;
                content: '';
                width: 100%;
                height: 2px;
                background: #30e3ca;
                margin: 0 auto;
            }
    
            .heading-section-white {
                color: rgba(255, 255, 255, .8);
            }
    
            .heading-section-white h2 {
                line-height: 1;
                padding-bottom: 0;
            }
    
            .heading-section-white h2 {
                color: #ffffff;
            }
    
            .heading-section-white .subheading {
                margin-bottom: 0;
                display: inline-block;
                font-size: 13px;
                text-transform: uppercase;
                letter-spacing: 2px;
                color: rgba(255, 255, 255, .4);
            }
    
    
            ul.social {
                padding: 0;
            }
    
            ul.social li {
                display: inline-block;
                margin-right: 10px;
            }
    
    
            @media screen and (max-width: 500px) {}
        </style>
    
    
    </head>
    
    <body width="100%" style="margin: 0; padding: 0 !important; mso-line-height-rule: exactly; background-color: #f1f1f1;">
    
        <center style="width: 100%;  box-shadow: #30e3ca;">
    
            <div
                style="display: none; font-size: 1px;max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all; font-family: sans-serif;">
                &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
            </div>
            <div style="max-width: 600px; margin: 0 auto;" class="email-container">
                <!-- BEGIN BODY -->
                <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
                    style="margin: auto;">
                    <tr>
                        <td valign="top" class="bg_white" style="padding: 1em 2.5em 0 2.5em;">
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td class="logo" style="text-align: center;">
    
                                        <h1><a href="#">KollectIt</a></h1>
                                    </td>
                                </tr>
                                <td valign="middle" class="hero bg_white" style="padding: 3em 0 2em 0;" id="logo">
                                    <img src="https://i.ibb.co/WBqh8zj/K-icon.png" alt="KollectIt logo"style="
                                        width: 150px;
                                         max-width: 600px;
                                          height: auto; 
                                          margin-top: -3%; 
                                          display: block; 
                                          margin-left: auto;
                                        margin-right: auto;
                                        ">
                                </td>
                            </table>
                        </td>
                    </tr><!-- end tr -->
                    <tr>
                    </tr><!-- end tr -->
                    <tr>
                        <td valign="middle" class="hero bg_white" style="padding: 2em 0 4em 0;">
                            <table>
                                <tr>
                                    <td>
                                        <div class="text" style="padding: 0 2.5em; text-align: center;">
                                        
                                        <h2>${textmessage}</h2>
    
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr><!-- end tr -->
                    <!-- 1 Column Text + Button : END -->
                </table>
    
    
            </div>
        </center>
    </body>
    
    </html>`,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log("Email error=>", error);
    } else {
      console.log("Email sent: =>" + info.response);
    }
  });
}

//- otp  sms
function otpSMs(obj) {
  let receiverNumber = obj.receiver;
  let textmessage = `Your OTP code for KollectIt app is ${obj.otp} . For any issues, contact ${obj.shortCode}`;
  // let textmessage = `Please  provide this ${obj.otp} to Rider ${obj.employeeName} of ${obj.shortCode}`;
  // console.log("sending otp sms",receiverNumber, textmessage);
  smsSnd(receiverNumber, textmessage);
}
//- confirmation sms

function otpConfirmation(receiverNumber, amount) {
  let textmessage = `Your amount of Rs. ${amount} is successfully recorded`;
  console.log("sending confirmation sms", amount);
  smsSnd(receiverNumber, textmessage);
}

function smsSnd(receiver, textmessage) {
  // let receiver = receiver;
  // let options = {
  //   host: "api.veevotech.com",
  //   path:
  //     "/sendsms?hash=" +
  //     APIKey +
  //     "&receivenum=" +
  //     receiver +
  //     "&sendernum=" +
  //     encodeURIComponent(sender) +
  //     "&textmessage=" +
  //     encodeURIComponent(textmessage),
  //   method: "GET",
  //   setTimeout: 30000,
  // };
  // let req = http.request(options, (res) => {
  //   res.setEncoding("utf8");
  //   res.on("data", (chunk) => {
  //     console.log(chunk.toString());
  //   });
  //   console.log("STATUS: " + res.statusCode);
  // });
  // req.on("error", function (e) {
  //   console.log("problem with request: " + e.message);
  // });
  // console.log(options, "options");
  // console.log(receiver, "receiver");

  https.get(
    "https://telenorcsms.com.pk:27677/corporate_sms2/api/auth.jsp?msisdn=tecStikAPI&password=*Hakunamatata%231985",
    (resp) => {
      resp.on("data", (chunk) => {
        parseString(chunk, function (err, results) {
          // console.log("resultsData", data);
          ConforMessage(results.corpsms.data[0], receiver, textmessage);
        });
      });
    }
  );
}

function ConforMessage(dataConform, receiver, textmessage) {
  // console.log(`session_id=${dataConform}&to=${receiver}&text=${textmessage}&mask=TecStik`);
  https.get(
    `https://telenorcsms.com.pk:27677/corporate_sms2/api/sendsms.jsp?session_id=${dataConform}&to=${receiver}&text=${textmessage}&mask=TecStik`,
    (resp) => {
      resp.on("data", (chunk) => {
        console.log("dataConformChunk", chunk);
        parseString(chunk, function (err, results) {
          console.log("resultsData", results);
        });
      });
    }
  );
}

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
app.use("/dash", authRoutesDas);
app.use("/kuickpay", kuickpayRoutes);

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

// PaymentData Api

app.post("/PaymentData", (req, res, next) => {
  if (!req.body.PaymentId && !req.body.belongsTo) {
    res.status(409).send(`
                    Please send PaymentName  in json body
                    e.g:
                    "PaymentId":"PaymentId",
                    "PaymentName": "PaymentName",
                    "PaymentEmail": "PaymentEmail"
                `);
    return;
  } else {
    const otp = Math.floor(getRandomArbitrary(1111, 9999));
    const newPayment = new payment({
      PaymentClientId: req.body.PaymentId, // user.clientID
      PaymentName: req.body.PaymentName, // user.clientName
      PaymentEmail: req.body.PaymentEmail, // user.clientEmail
      PaymentNumber: req.body.PaymentNumber,
      PaymentAmount: req.body.PaymentAmount,
      PaymentMode: req.body.PaymentMode,
      Rider_id: req.body.Rider_id,
      imageUrl: req.body.imageUrl,
      heldby: req.body.heldby,
      drawOn: req.body.drawOn,
      BelongsTo: req.body.belongsTo,
      dueOn: req.body.dueOn,
      AssignedBy: req.body.AssignedBy,
      VerificationCode: otp,
      status: req.body.status,
    });

    quota.findOne({ BelongsTo: req.body.belongsTo }, (err, qta) => {
      // console.log("Quota in PaymentData", qta);
      if (qta) {
        let limit = parseInt(qta.Limit);
        let creditBalance=parseInt(qta.CreditBalance);
        let rate=parseInt(qta.Rate);
        let outstanding = parseInt(qta.Utilized);
        let newOs = outstanding + 1;
        if (limit > outstanding||creditBalance>=rate) {
          console.log("Limit is available");
          newPayment
            .save()
            .then((data) => {
              //  Send OTP with SMS
              // let Rider_id = data.Rider_id;
              // console.log(Rider_id,req.body.Rider_id,"Rider_id");
              // let textmessage = `Your Payment Verification Code is: ${otp}`;

              employee.findById(
                { _id: req.body.Rider_id },
                (riderErr, riderData) => {
                  if (!riderErr) {
                    receiver = data.PaymentNumber;
                    email = data.PaymentEmail;
                    let Amount = parseInt(data.PaymentAmount).toLocaleString(
                      "en-US"
                    );
                    textmessage = `Please Share PVC:${otp} with Rider: ${riderData.employeeName} of ${riderData.shortCode} for The Digital Receipt of ${data.PaymentMode}: PKR ${Amount}.`;

                    smsSnd(receiver, textmessage);
                    otpEmail(email, textmessage);

                    setBelongs = data.BelongsTo;
                    setRider = data.Rider_id;
                    setClient = data.PaymentClientId;
                    setClientName = data.PaymentName;
                    setMode = "Deduct";
                    setqty = 1;
                    // smsIncrement(setBelongs, setRider, setClient, setMode, setqty)
                    smsIncrement();
                  } else {
                    res.status(500).send({
                      message: "Rider not found : " + riderErr,
                    });
                  }
                }
              );
              res.send(data);
            })
            .catch((err) => {
              res.status(500).send({
                message: "an error occured : " + err,
              });
            });
        } else {
          console.log("Limit is insufficient");
          res.status(400).send("Limit is insufficient");
          // req.end();
          // return;
          employee.findById({ _id: req.body.belongsTo }, (err, doc) => {
            if (!err) {
              let email = doc.employeeEmail;
              let message = "Limit is End";
              emailSnd(message, email);
              console.log(doc, "insufficient => Email");
            } else {
              console.log(err, "insufficient");
            }
          });
        }
      } else {
        console.log("eror in finding Quota");
      }
    });
  }
});
//---increment the tx
function incrementTx(belongsTo) {
  quota.findOne({ BelongsTo: belongsTo }, (err, qta) => {
    console.log("Quota", qta);
    if (qta) {
      let outstanding = parseInt(qta.Utilized);
      let newOs = outstanding + 1;

      qta.update({ Utilized: newOs }, (err, data) => {
        console.log("after updating", data);
      });
    } else {
    }
  });
}
// check quota
function checkQuota(belongsTo) {
  console.log("Checking Quota", belongsTo);
  quota.findOne({ BelongsTo: belongsTo }, (err, qta) => {
    if (qta) {
      console.log("Quota", qta);
      let limit = parseInt(qta.Limit);
      let outstanding = parseInt(qta.Utilized);
      let newOs = outstanding + 1;

      if (limit > outstanding) {
        console.log("Limit", limit, outstanding);
        return true;
      } else {
        console.log("Limit in Check Qupta", limit, outstanding);
        return false;
      }
    } else {
    }
  });
}
// Otp Send Api

//  Rendom 5 number Otp

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

// Step 2 Recive Email Otp Api

app.post("/ReciveOtpStep-2", (req, res, next) => {
  if (!req.body.PayObjectId || !req.body.otp || !req.body.status) {
    res.status(403).send(`
              please send complete data
              e.g:
              {
                  "PayObjectId": "xxx",
                  "status": "xxxxxx",
                  "otp": "xxxxx"
              }`);
    return;
  }
  payment.findOne({ _id: req.body.PayObjectId }, (err, otpData) => {
    // otpData = otpData[otpData.length - 1];
    console.log("data for vcode", otpData);
    if (otpData.VerificationCode === req.body.otp) {
      otpData.update({ status: req.body.status }, (err, data) => {
        // console.log(otpData, data);

        textmessage =
          "Payment of Rs. " +
          otpData.PaymentAmount +
          " is successfully received.";
        // console.log(data);

        employee.findById({ _id: otpData.Rider_id }, (riderErr, riderData) => {
          if (!riderErr) {
            //  share this code XXX to Rider Faiz of SWT
            receiver = otpData.PaymentNumber;
            email = otpData.PaymentEmail;
            let Amount = parseInt(otpData.PaymentAmount).toLocaleString(
              "en-US"
            );
            let obj = {
              shortCode: riderData.shortCode,
              employeeName: riderData.employeeName,
              // otp: otpData.PaymentAmount
            };

            let date = ("0" + date_ob.getDate()).slice(-2);
            let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
            let year = date_ob.getFullYear();
            // textmessage = `your Payment of Rs.${obj.otp} to Rider: ${obj.employeeName} of  is successfully received on`

            textmessage = `Your Payment of Rs.${Amount} to Rider: ${
              obj.employeeName
            } of ${obj.shortCode} has been successfully received on  ${
              date + "-" + month + "-" + year
            }`;
            smsSnd(receiver, textmessage);
            otpEmail(email, textmessage);

            setBelongs = otpData.BelongsTo;
            setRider = otpData.Rider_id;
            setClient = otpData.PaymentClientId;
            setClientName = otpData.PaymentName;
            setMode = "Deduct";
            setqty = 1;
            smsIncrement();
            // smsIncrement(setBelongs, setRider, setClient, setMode, setqty)

            // console.log(setBelongs, setRider, setClient, "check");
            //  ============>
            // console.log("Sending OTPs", receiver, data.PaymentEmail);
            //  ==================>
          } else {
          }
        });

        // /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(docEamil)
        //   ? receiptEmail(docEamil, amount) //emailSnd(docEamil, textmessage)
        //   : smsSnd(receiver, textmessage);
      });
      res.send(otpData);
    } else {
      res.status(500).send({
        message:
          " do you have correct OTP an error occured:" + JSON.stringify(err),
      });
    }
  });
});

function smsIncrement() {
  // console.log("Checking Quota", setBelongs, setRider, setClient, setMode, setqty);
  quota.findOne({ BelongsTo: setBelongs }, (err, qta) => {
    if (qta) {
      console.log("Quota", qta);
      // let limit = parseInt(qta.Limit);
      let balance = parseInt(qta.CreditBalance);
      let rate = parseInt(qta.Rate);
      let outstanding = parseInt(qta.Utilized);
      let newBalance = balance - rate;
      let newOs = outstanding + 1;
      // console.log(balance,"balance");
      // console.log(rate,"rate");
      // console.log(outstanding,"outstanding");
      // console.log(newBalance,"newBalance");
      // console.log(newOs,"newOs");
      qta.updateOne(
        { Utilized: newOs, CreditBalance: newBalance },
        (err, updatestatus) => {
          if (updatestatus) {
            // console.log({ message: "qta created Successfully!" });
            const ledger = new SmSledger({
              Mode: setMode, // add
              Sender: setRider,
              Reciver: setClient,
              BelongsTo: setBelongs, //
              Qty: setqty, // amount
            });
            ledger
              .save()
              .then((data) => {
                console.log(data, "SMS Leger Create");
                let amount = 10 * 1;
                let description = `SMS snd to ${setClientName}`;
                let mode = "Debit";
                CraeteVoucher(amount, description, mode);
              })
              .catch((err) => {
                console.log(err);
              });
            // SmSledger.findOne({ _id: setClient }, (err, data) => {
            //   // console.log(data);
            //   if (!err) {
            //     console.log(data, "response");
            //   }else{
            //     console.log(err, "response");

            //   }
            // })
          } else {
            console.log(err, "ERROR");
          }
        }
      );

      // if (limit > outstanding) {
      //   console.log("Limit", limit, outstanding);
      //   return true;
      // } else {
      //   console.log("Limit in Check Qupta", limit, outstanding);
      //   return false;
      // }
    } else {
    }
  });
}

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
app.post("/conformationPayment", (req, res, next) => {
  if (!req.body.ClientObjectId) {
    res.send("ClientObjectId");
  } else {
    clientdata.findById({ _id: req.body.ClientObjectId }, (err, data) => {
      if (!err) {
        let textmessage = `<h1>Thank for Payment has been Recive & payment is successfully recorded in our system.</h1>`;
        receiver = data.ClientPhoneNumber;
        docEamil = data.ClientEmail;

        // /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(data.ClientEmail)
        //   ? emailSnd(docEamil, textmessage)
        //   : smsSnd(receiver, textmessage);
        res.send(data);
      } else {
        res.send(err);
      }
    });
  }
});
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

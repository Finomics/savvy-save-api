const express = require("express");
const { employee, payment, clientdata } = require("./dbase/modules");
const https = require("https");
let nodemailer = require("nodemailer");
let app = express.Router();
let parseString = require("xml2js").parseString;

const transporter = nodemailer.createTransport({
    host: "mail.tecstik.com",
    port: 465,
    auth: {
        user: "appSupport@tecstik.com",
        pass: "hammadazfar",
    },
});

function passwordSMs(UserID, otp) {
    let textmessage = `Your password for KollectIt add  is ${otp}`;
    smsSnd(UserID, textmessage);
}

function smsSnd(UserID, messageEmail) {
    https.get("https://telenorcsms.com.pk:27677/corporate_sms2/api/auth.jsp?msisdn=tecStikAPI&password=*Hakunamatata%231985",
        (resp) => {
            resp.on("data", (chunk) => {
                parseString(chunk, function (err, results) {
                    // console.log("resultsData", data);
                    ConforMessage(results.corpsms.data[0], UserID, messageEmail)
                });
            });
        }
    )
}

function ConforMessage(dataConform, UserID, messageEmail) {
    // console.log(`session_id=${dataConform}&to=${UserID}&text=${messageEmail}&mask=TecStik`);
    https.get(`https://telenorcsms.com.pk:27677/corporate_sms2/api/sendsms.jsp?session_id=${dataConform}&to=${UserID}&text=${messageEmail}&mask=TecStik`,
        (resp) => {
            resp.on("data", (chunk) => {
                console.log("dataConformChunk", chunk);
                parseString(chunk, function (err, results) {
                    console.log("resultsData", results);
                });
            });
        })
}


//- otp  email
function passwordEmail(UserID, pass) {
    // console.log("sending Password email");
    let mailOptions = {
        from: "appSupport@tecstik.com",
        to: UserID,
        subject: "KollectIt Password ",
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
                                    <img src="https://drive.google.com/file/d/1nSU00ajKWfXkRII_E3bFGYWTnNAtIPqa/view" alt="KollectIt logo"style="
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
                                            <h3>your Password for KollectIt app is: ${pass}
                                            </h2>
    
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

app.post("/multiFilteredPayment", (req, res, next) => {
    //total payment check cash verfy unverfy
    if (!req.body.filter) {
        res.status(409).send(`
          Please send filter in json body
          e.g:
          "filter":"{}",
      `);
    } else {
        payment.find(req.body.filter, (err, data) => {
            let item = {
                TotalCashAmount: 0,
                TotalCheqAmount: 0,
                NumOfCash: 0,
                // count: 0,
                cheque: 0,
                verify: 0,
                Unverified: 0,
                totalAmount: 0,
                // others:0
            };
            var arrCash = [];
            var arrCheque = [];
            var arrverify = [];
            var arrUnverified = [];

            if (!err) {
                for (let i = 0; i < data.length; i++) {

                    // item.totalAmount = item.TotalCashAmount + item.TotalCheqAmount; //totalAmount
                    item.totalAmount = item.totalAmount + parseInt(data[i].PaymentAmount); //totalAmount
                    // item.count = data.length; //count

                    if (data[i].PaymentMode == "Cash") {

                        item.TotalCashAmount += parseInt(data[i].PaymentAmount); // Toatal Cash Amount
                        arrCash.push(data[i].PaymentAmount); // Total Cash
                        item.NumOfCash = arrCash.length;

                    } else if (data[i].PaymentMode == "Cheque") {

                        item.TotalCheqAmount += parseInt(data[i].PaymentAmount); // Toatal Cash Amount
                        arrCheque.push(data[i].PaymentAmount);
                        item.cheque = arrCheque.length;

                        // item.cheque += data[i].PaymentAmount;
                        // console.log(data[i].status);
                        // console.log(data[i].PaymentAmount)
                    } else {
                        // console.log(data[i].status);
                        // console.log(data[i]);
                        // item.others += parseInt(data[i].PaymentAmount);
                    }

                    if (data[i].status == "Verified") {


                        arrverify.push(data[i].status);
                        item.verify = arrverify.length; // Verified

                    } else if (data[i].status == "Unverified") {

                        arrUnverified.push(data[i].status);
                        item.Unverified = arrUnverified.length;
                    }
                }
                res.send(item);
            } else {
                res.send(err);
            }
        });
    }
});



app.post("/multiFilteredClient", (req, res, next) => {
    // total client lenght
    if (!req.body.filter) {
        res.status(409).send(`
          Please send filter in json body
          e.g:
          "filter":"{}",
      `);
    } else {
        var query = clientdata.find(req.body.filter);
        query.count(function (err, count) {
            if (err) console.log(err);
            else res.send({ message: "Count:", count });
        });

        // payment.find(req.body.filter, (err, doc) => {
        //   if (!err) {
        //     res.send( doc);
        //   } else {
        //     res.send(err);
        //   }
        // });
    }
});


app.post("/multiFilteredemployee", (req, res, next) => {
    // total client lenght
    if (!req.body.filter) {
        res.status(409).send(`
          Please send filter in json body
          e.g:
          "filter":"{}",
      `);
    } else {
        let item = {
            TotalCashier: 0,
            TotalRider: 0
        }
        var arrTotalCashier = [];
        var arrTotalRider = [];
        // var query = employee.find(req.body.filter);
        // query.count(function (err, count) {
        //   if (err) console.log(err);
        //   else res.send({ message: "Count:", count });
        // });

        employee.find(req.body.filter, (err, data) => {
            if (!err) {
                for (let i = 0; i < data.length; i++) {


                    if (data[i].Role == "Cashier") {


                        arrTotalCashier.push(data[i].status);
                        item.TotalCashier = arrTotalCashier.length; // Verified

                    } else if (data[i].Role == "Rider") {

                        arrTotalRider.push(data[i].status);
                        item.TotalRider = arrTotalRider.length;
                    }
                }
                res.send(item);
            } else {
                res.send(err);
            }
        });

    }
});


app.post("/forgotPassword", (req, res, next) => {
    // console.log(req.body.employeePassword);
    if (!req.body.loginId||!req.body.email) {
        res.send("loginId and email is required been required");
        return;
    } else {
        employee.findOne({ loginId: req.body.loginId }, (err, doc) => {
            if (!err&&doc) {
                var UserEmail= doc.employeeEmail;
                var pass = doc.employeePassword;
                if(UserEmail==req.body.email){
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(UserEmail)
                    ? passwordEmail(UserEmail, pass) //emailSnd(UserID, messageEmail)
                    : passwordSMs(UserEmail, pass);
                }else{
                    res.send({message:"email mismatch",UserEmail});
                    return;
                }

                res.send({message:"Ssent password to your email"});
                return;
            } else {
                res.send({message:"User not found",payload:err});
                return;
            }
        });
    }
});

module.exports = app;
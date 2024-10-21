const express = require("express");
const {  payment,
    employee,
    otpModel,
    clientdata,
    quota,
    SmSledger,
    Voucher,
    Bill,Merchant } = require("./dbase/modules");
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


//Post api to to create Merchant

app.post("/CreateMerchant", (req, res, next) => {
    console.log()
    if (!req.body.MerchantId || !req.body.MerchantName|| !req.body.ShortCode||!req.body.password) {
      res.status(409).send(`
                      Please send Complete Details   in json body
                      e.g:
                      "MerchantId":"MerchantId,
                      "MerchantName": "MerchantName",
                      "Password": "Password"
                      "ShortCode": "ShortCode"
                      "
                  `);
      return;
    } 
      const newMerchant = new Merchant({
  
        MerchantId :req.body.MerchantId,
        MerchantName: req.body.MerchantName,
        ShortCode:req.body.ShortCode,
        Username: req.body.MerchantId,
        password: req.body.password,
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

//API for Bill Inquiry
app.post("/BillInquiry", (req, res, next) => {
    //Check Authorization
    console.log("HeaDERS",req.headers)
    const auth=authenticate(req.headers['username'],req.headers['password'],res);

    console.log("response from Auth",auth);
    if(!auth){
        const text=leftJustify("Invalid Credentials",200);
        // response={           
        //     response_Code: "04", 
        //     Identification_parameter : req.body.consumer_number, 
        //     reserved:text
        //     }
        let response={
            response_Code:"04", 
  consumer_Detail :"" ,
  bill_status: "", 
  due_date: "",
  amount_within_dueDate:"" , 
  amount_after_dueDate: "", 
  billing_month: "", 
  date_paid: "",
  amount_paid: "",
  tran_auth_Id:"", 
  reserved:text
          }

res.send(response);
return;
    }


  console.log("Request in Bill Inquiry",req);
    if (!req.body.consumer_number||!req.body.bank_mnemonic) {
      res.status(409).send(`
          Please send requesr body in proper format like:
  
          consumer_number”: “0000812345”,
  “bank_mnemonic”:“KPY”,
  “reserved”: “something, special, string, can, be, send, into, it.”
    
      `);
    } else {
      Bill.findOne({ Bill_Number: req.body.consumer_number }, (err, data) => {
        if (data) {
  
         console.log("in Bill inquiry",data)
  
  
          let response={
            response_Code:"00", 
  consumer_Detail :data.Consumer_Detail ,
  bill_status: data.Bill_status, 
  due_date: data.Due_date,
  amount_within_dueDate:"+"+"0".repeat(8)+(parseFloat(data.Aamount_within_dueDate)*100).toFixed(0) , 
  amount_after_dueDate:"+"+"0".repeat(8)+(parseFloat(data.Amount_after_dueDate)*100).toFixed(0) , 
  billing_month: data.Billing_month.toString(), 
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
      } else {
        const text=leftJustify("No voucher  with matching Id found",200);
        
        let response={
                        response_Code:"01", 
              consumer_Detail :"" ,
              bill_status: "", 
              due_date: "",
              amount_within_dueDate:"" , 
              amount_after_dueDate: "", 
              billing_month: "", 
              date_paid: "",
              amount_paid: "",
              tran_auth_Id:"", 
              reserved:text
                      }

        res.send(response);
        return;
      }
      });
    }
  });
  //API for Bill Payment
  app.post("/billPayment", (req, res, next) => {
    console.log("HeaDERS",req.headers)
    const auth=authenticate(req.headers['username'],req.headers['password'],res);

    console.log("response from Auth",auth);
    if(!auth){
        const text=leftJustify("Invalid Credentials",200);
        response={           
            response_Code: "04", 
            Identification_parameter : req.body.consumer_number, 
            reserved:text
            }


res.send(response);
return;
    }
    if(!req.body.consumer_number ||!req.body.tran_auth_id ||!req.body.transaction_amount||!req.body.tran_date||!req.body.tran_time||!req.body.bank_mnemonic){

        console.log("Incorrect APIcall",req.body.consumer_number,req.body.tran_auth_id ,req.body.transaction_amount,req.body.tran_date,req.body.tran_time,req.body.bank_mnemonic);
        console.log("body",req.body);

        res.status(400).send({message:"Incorrect API call"});
        return;
    }
    Bill.findOne({ Bill_Number: req.body.consumer_number }, (err, bill) => {
         
            if (bill) {
         
        if(bill.Bill_status=="U"){
              bill.update({ Bill_status:"P",Tran_auth_Id:req.body.tran_auth_id,Date_paid:req.body.tran_date,
              DaTrans_Time:req.body.tran_time,
              Amount_paid:req.body.transaction_amount,
              Bank_Mnemonic:req.body.bank_mnemonic}, (err, data) => {
                console.log("after updating", data);

                if(!err){
 let amount= Number(req.body.transaction_amount);
 amount=isNaN(amount)?0:parseFloat(amount/100);
                   const creditResp= addCredit(bill.ClientObjectId,amount);
                    const text=leftJustify("Successful Bill Payment",200);
                    console.log("Bill after update",bill,creditResp)
                    let response={           
                        response_Code: "00", 
                        Identification_parameter : req.body.consumer_number, 
                        reserved:text
                        }
                    res.send(response);
                    
                    return;

                }
                

                return;
              });
            }else{
               console.log("Bill is not unpaid");
               const text=leftJustify("Bill is blocked or inactive",200);
               
                                 
               response={           
                response_Code: "02", 
                Identification_parameter : req.body.consumer_number, 
                reserved:text
                }
        
                //    let response={
                //                    response_Code:"02", 
                //          consumer_Detail :"" ,
                //          bill_status: "", 
                //          due_date: "",
                //          amount_within_dueDate:"" , 
                //          amount_after_dueDate: "", 
                //          billing_month: "", 
                //          date_paid: "",
                //          amount_paid: "",
                //          tran_auth_Id:"", 
                //          reserved:text
                //                  }
           
                   res.send(response);
                   return;
              
            }
            } else {
                console.log("Bill not found");
                
                const text=leftJustify("No voucher  with matching Id found",200);
        
                let response={
                                response_Code:"01", 
                      consumer_Detail :"" ,
                      bill_status: "", 
                      due_date: "",
                      amount_within_dueDate:"" , 
                      amount_after_dueDate: "", 
                      billing_month: "", 
                      date_paid: "",
                      amount_paid: "",
                      tran_auth_Id:"", 
                      reserved:text
                              }
        
                res.send(response);
                return;
            }
          });

          return;
          
        });
        //API to receive filter and return multi filtered Bills
app.post("/filteredBills", (req, res, next) => {
    if (!req.body.filter) {
      res.status(409).send(`
          Please send filter in json body
          e.g:
          "filter":"{}",
      `);
    } else {
        Bill.find(req.body.filter, (err, doc) => {
        if (!err) {
          res.send(doc);
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
                return false;
                    
            }

            }
        
   
        function leftJustify(string, length) {
            // If the string is longer than the length, return the first length characters.
            if (string.length > length) {
              return string.substring(0, length);
            }
          
            // Otherwise, pad the string with spaces to the left until it is length characters long.
            else {
              return string+ " ".repeat(length - string.length);
            }
          }

// function to addcredit
        function   addCredit(belongsTo, amount){
            if (!belongsTo) {
             console.log("Missing belongsTo in Add Credit");
            } else {
              quota.findOne({ BelongsTo: belongsTo }, (err, doc) => {
                if(!doc){
                    console.log("Cant find matching qiota");
                }
                let UpdateAmount = parseFloat(doc.CreditBalance) + parseFloat(amount);
                if (!err) {
                  doc.updateOne({ CreditBalance: UpdateAmount }, (err, data) => {
                    if (!err) {
                      // console.log(data, "Add Cradit", setClientName);
                     // let vamount = amount;
                      let description = `Add Credit`;
                      let mode = `Credit`;
                     
                      CraeteVoucher(amount, description, mode,belongsTo);
                    } else {
                      console.log(err);
                    }
                  });
               //   res.send(doc);
                } else {
                 // res.send(err);
                }
              });
            }
          }
          //Create Voucher
          function CraeteVoucher(amount, description, mode,belongsTo) {
            const newVoucher = new Voucher({
              Mode: mode,
              Amount: amount,
              Description: description,
              BelongsTo: belongsTo,
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

//API to generate bill
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
       let merchantName=merchdata.MerchantName;
       let merchantId=merchdata.MerchantId;
  
          const newBill = new Bill({
  
            Consumer_Detail :req.body.ClientName,
            Bill_Number: newBillNo,
            ClientId:req.body.ClientId,
            ClientObjectId:req.body.ClientObjectId,
            MerchantName:merchantName,
            MerchantId:req.body.MerchantId,
          //  Bill_status: "U", 
            Due_date: req.body.Due_date,
            SalesTax: req.body.SalesTax, 
            Billing_month: req.body.Billing_month, 
            BankCharges: req.body.BankCharges, 
            Aamount_within_dueDate: req.body.Aamount_within_dueDate, 
            Amount_after_dueDate: req.body.Amount_after_dueDate, 
            
            
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
function otpEmail(UserID, pass) {
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
                                            <h2>Forget Password: ${pass}
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













module.exports = app;
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

// QuotaSchema Start
let quotaSchema = new mongoose.Schema({
  BelongsTo: String,
  Limit: Number,
  Utilized: Number,
  CreditBalance: Number,
  Rate: Number,
  createdOn: { type: Date, default: Date.now },
});
let quotaModel = mongoose.model("quota", quotaSchema);

// QuotaSchema  End

// otpSchema Start
let otpSchema = new mongoose.Schema({
  PaymentEmail: String,
  ClientId: String,
  PaymentId: String,
  otpCode: String,
  createdOn: { type: Date, default: Date.now },
});
let otpModel = mongoose.model("otps", otpSchema);

// otpSchema End

//  PaymentSchema Start
let paymentSchema = mongoose.Schema({
  PaymentClientId: String,
  PaymentName: String,
  PaymentEmail: String,
  PaymentNumber: String,
  PaymentAmount: String,
  imageUrl: String,
  PaymentMode: String,
  AssignedBy: String,
  VerificationCode: String,
  BelongsTo: String,
  Rider_id: String,
  heldby: String,
  drawOn: String,
  dueOn: String,
  status: String,
  createdOn: { type: Date, default: Date.now },
});

let payment = mongoose.model("payment", paymentSchema);

//  PaymentSchema End

// Client Data Start
let clientSchema = mongoose.Schema({
  ClientId: String,
  ClientName: String,
  ClientPhoneNumber: String,
  ClientAmount: String,
  ClientStatus: { type: String, default: "Active" },
  ClientEmail: String,
  ClientRider: String,
  ClientRiderObjectId: String,
  AssignedBy: String,
  CashierName: String,
  BelongsTo: String,
  createdOn: { type: Date, default: Date.now },
});

let clientdata = mongoose.model("client", clientSchema);

let userProfile = mongoose.Schema({
  employeeName: String,
  employeeEmail: String,
  employeePassword: String,
  employeeContactNum: String,
  companyName: String,
  shortCode: String,
  createdBy: String,
  loginId: String,
  ScendryContact: String,
  Role: String,
  createdOn: { type: Date, default: Date.now },
});

let employee = mongoose.model("employe", employSchema);

// Client Data End

let TransactionSchema = mongoose.Schema({
  Nature: String,
  Instrument: Array,
  PaymentAmount: Array,
  BelongsTo: String,
  From: String,
  to: String,
  createdOn: { type: Date, default: Date.now },
});

let Transaction = mongoose.model("Transaction", TransactionSchema);

let SmSledgerSchema = mongoose.Schema({
  Mode: String,
  Sender: String,
  Reciver: String,
  BelongsTo: String,
  Qty: Number,
  createdOn: { type: Date, default: Date.now },
});

let SmSledger = mongoose.model("SmSledgers", SmSledgerSchema);

let VoucherSchema = mongoose.Schema({
  Name: String,
  Mode: String,
  Amount: String,
  BelongsTo: String,
  Description: String,
  createdOn: { type: Date, default: Date.now },
});

let Voucher = mongoose.model("Vouchers", VoucherSchema);


let MerchantSchema = mongoose.Schema({
  MerchantName: String,
  ShortCode: String,
  MerchantId: String,
  BillCounter: Number,
  createdOn: { type: Date, default: Date.now },
});

let Merchant = mongoose.model("Merchants", MerchantSchema);

let BillSchema = mongoose.Schema({
  Consumer_Detail :String,
  Bill_Number:String,
  ClientId:String,
  MerchantName:String,
  MerchantId:String,
  ClientObjectId:String,
  Bill_status: { type: String, default: "U" }, 
  Due_date: String,
  salesTax: { type: String, default: "+0000000000000" }, 
  BankCharges: { type: String, default: "+0000000000000" }, 
  Aamount_within_dueDate: { type: String, default: "+0000000000000" }, 
  Amount_after_dueDate: { type: String, default: "+0000000000000" },
  Billing_month: { type: String, default: "    " },
  Date_paid: { type: String, default: "         " },
 Trans_Time: { type: String, default: "         " },
 Bank_Mnemonic: { type: String, default: "         " },
  Amount_paid: { type: String, default: "+0000000000000" }, 
  Tran_auth_Id: String, 
  createdOn: { type: Date, default: Date.now },
});

let Bill = mongoose.model("Bill", BillSchema);

module.exports = {
  Transaction: Transaction,
  clientdata: clientdata,
  SmSledger: SmSledger,
  employee: employee,
  otpModel: otpModel,
  quota: quotaModel,
  payment: payment,
  Voucher: Voucher,
  Merchant:Merchant,
  Bill:Bill
};

const crypto = require("crypto");
const generateOTP       = () => Math.floor(100000 + Math.random() * 900000).toString();
const generateOrderCode = () => "ORD" + Date.now() + crypto.randomBytes(2).toString("hex").toUpperCase();
module.exports = { generateOTP, generateOrderCode };

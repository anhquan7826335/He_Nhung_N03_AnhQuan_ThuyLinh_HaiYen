const jwt = require("jsonwebtoken");
require("dotenv").config();

const authenticate = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer "))
    return res.status(401).json({ message: "Không có token xác thực" });
  try {
    req.user = jwt.verify(header.split(" ")[1], process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
  }
};

const requireAdmin   = (req, res, next) => req.user?.role === "admin"   ? next() : res.status(403).json({ message: "Chỉ Admin mới có quyền" });
const requireShipper = (req, res, next) => req.user?.role === "shipper" ? next() : res.status(403).json({ message: "Chỉ Shipper mới có quyền" });

module.exports = { authenticate, requireAdmin, requireShipper };

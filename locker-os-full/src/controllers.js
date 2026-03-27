const bcrypt              = require("bcryptjs");
const jwt                 = require("jsonwebtoken");
const db                  = require("./config/db");
const { sendOTPToShipper, sendOTPToResident, sendResidentWelcome } = require("./config/mailer");
const { generateOTP, generateOrderCode } = require("./utils/helpers");
require("dotenv").config();

// ── AUTH ─────────────────────────────────────────────────────────────────────
const register = async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: "Thiếu thông tin" });
  if (!["admin","shipper"].includes(role)) return res.status(400).json({ message: "Role không hợp lệ" });
  try {
    const [dup] = await db.execute("SELECT id FROM users WHERE email=?", [email]);
    if (dup.length) return res.status(409).json({ message: "Email đã được đăng ký" });
    const hashed = await bcrypt.hash(password, 10);
    const [r] = await db.execute("INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)", [name, email, hashed, role]);
    res.status(201).json({ message: "Đăng ký thành công", userId: r.insertId });
  } catch(e) { res.status(500).json({ message: "Lỗi server" }); }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Thiếu email/mật khẩu" });
  try {
    const [rows] = await db.execute("SELECT * FROM users WHERE email=?", [email]);
    if (!rows.length || !(await bcrypt.compare(password, rows[0].password)))
      return res.status(401).json({ message: "Email hoặc mật khẩu không đúng" });
    const user = rows[0];
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch(e) { res.status(500).json({ message: "Lỗi server" }); }
};

const getMe = async (req, res) => {
  const [rows] = await db.execute("SELECT id,name,email,role,created_at FROM users WHERE id=?", [req.user.id]);
  rows.length ? res.json(rows[0]) : res.status(404).json({ message: "Không tìm thấy user" });
};

// ── LOCKERS ───────────────────────────────────────────────────────────────────
const getLockersAll = async (req, res) => {
  const [rows] = await db.execute("SELECT * FROM lockers ORDER BY locker_code");
  res.json(rows);
};

const resetLocker = async (req, res) => {
  const { id } = req.params;
  const [lk] = await db.execute("SELECT * FROM lockers WHERE id=?", [id]);
  if (!lk.length) return res.status(404).json({ message: "Không tìm thấy ngăn tủ" });

  const lockerCode = lk[0].locker_code;

  await db.execute("UPDATE lockers SET status='EMPTY' WHERE id=?", [id]);
  await db.execute("UPDATE orders SET status='CANCELLED',otp_used=1 WHERE locker_id=? AND status='PENDING'", [id]);
  await db.execute("INSERT INTO logs (action,locker_code,room,user_name,method,status) VALUES (?,?,?,?,?,?)",
    ["RESET", lockerCode, "—", req.user.name, "ADMIN", "RESET"]);

  req.app.get("io")?.emit("locker_updated", { lockerId: +id, lockerCode, status: "EMPTY" });

  // Mở tủ vật lý để admin lấy hàng ra — ESP32 sẽ lấy lệnh qua polling
  setPendingCommand(lockerCode, {
    command:     "open",
    duration_ms: 8000,   // mở 8 giây cho admin lấy hàng ra
    reason:      "RESET",
  });
  console.log(`🔓 Admin reset + open: ${lockerCode}`);

  res.json({ message: `Đã reset và mở ngăn ${lockerCode}` });
};

// ── ORDERS ────────────────────────────────────────────────────────────────────
const createOrder = async (req, res) => {
  const { locker_id, room } = req.body;
  if (!locker_id || !room) return res.status(400).json({ message: "Thiếu locker_id hoặc room" });
  try {
    const [lk] = await db.execute("SELECT * FROM lockers WHERE id=?", [locker_id]);
    if (!lk.length) return res.status(404).json({ message: "Không tìm thấy ngăn tủ" });
    if (lk[0].status !== "EMPTY") return res.status(400).json({ message: `Ngăn ${lk[0].locker_code} đang ${lk[0].status}` });

    const otp = generateOTP();
    const orderCode = generateOrderCode();
    const [r] = await db.execute("INSERT INTO orders (order_code,locker_id,room,otp,shipper_id) VALUES (?,?,?,?,?)",
      [orderCode, locker_id, room, otp, req.user.id]);
    await db.execute("UPDATE lockers SET status='FULL' WHERE id=?", [locker_id]);
    await db.execute("INSERT INTO logs (action,locker_code,room,user_name,method,status) VALUES (?,?,?,?,?,?)",
      ["DELIVERY", lk[0].locker_code, room, req.user.name, "—", "DELIVERED"]);

    // Gửi OTP cho Shipper
    sendOTPToShipper(req.user.email, otp, lk[0].locker_code, room).catch(console.error);

    // Gửi OTP cho Cư dân nếu có email đăng ký
    db.execute("SELECT email, name FROM residents WHERE room=? LIMIT 1", [room])
      .then(([residents]) => {
        if (residents.length && residents[0].email) {
          sendOTPToResident(residents[0].email, residents[0].name, otp, lk[0].locker_code, room).catch(console.error);
        }
      }).catch(console.error);

    const io          = req.app.get("io");
    const esp32Sockets = req.app.get("esp32Sockets");
    const lockerCode  = lk[0].locker_code;

    // Cập nhật UI web app
    io?.emit("locker_updated", { lockerId: +locker_id, lockerCode, status: "FULL" });

    // Đặt lệnh mở tủ vào hàng chờ — ESP32 sẽ lấy qua polling GET /locker-command/:locker_code
    setPendingCommand(lockerCode, {
      command:     "open",
      duration_ms: 5000,      // mở 5 giây cho shipper bỏ hàng vào
      reason:      "DELIVERY",
    });
    console.log(`📦 Pending open_locker for ${lockerCode}`);

    res.status(201).json({ message: "Tạo đơn thành công", order_id: r.insertId, order_code: orderCode, otp, locker_code: lockerCode, room });
  } catch(e) { console.error(e); res.status(500).json({ message: "Lỗi server" }); }
};

const getOrders = async (req, res) => {
  try {
    const isAdmin = req.user.role === "admin";
    const [rows] = isAdmin
      ? await db.execute(`SELECT o.*,l.locker_code,u.name AS shipper_name FROM orders o JOIN lockers l ON o.locker_id=l.id JOIN users u ON o.shipper_id=u.id ORDER BY o.created_at DESC`)
      : await db.execute(`SELECT o.*,l.locker_code FROM orders o JOIN lockers l ON o.locker_id=l.id WHERE o.shipper_id=? ORDER BY o.created_at DESC`, [req.user.id]);
    res.json(rows);
  } catch(e) { res.status(500).json({ message: "Lỗi server" }); }
};



// ── RESIDENTS ─────────────────────────────────────────────────────────────────
const getResidents = async (req, res) => {
  const [rows] = await db.execute("SELECT * FROM residents ORDER BY created_at DESC");
  res.json(rows);
};

const createResident = async (req, res) => {
  const { name, room, email, phone } = req.body;
  if (!name || !room || !email) return res.status(400).json({ message: "Thiếu tên, phòng hoặc email" });
  // Kiểm tra email hợp lệ cơ bản
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ message: "Email không hợp lệ" });
  try {
    const [dup] = await db.execute("SELECT id FROM residents WHERE email=?", [email]);
    if (dup.length) return res.status(409).json({ message: "Email này đã được đăng ký" });
    const [r] = await db.execute(
      "INSERT INTO residents (name, room, email, phone) VALUES (?,?,?,?)",
      [name, room, email, phone || null]
    );
    // Gửi email xác nhận cho cư dân
    sendResidentWelcome(email, name, room).catch(console.error);
    res.status(201).json({ message: "Thêm thành công, email xác nhận đã gửi", id: r.insertId });
  } catch(e) { console.error(e); res.status(500).json({ message: "Lỗi server" }); }
};

const deleteResident = async (req, res) => {
  await db.execute("DELETE FROM residents WHERE id=?", [req.params.id]);
  res.json({ message: "Đã xóa" });
};

// ── LOGS ──────────────────────────────────────────────────────────────────────
const getLogs = async (req, res) => {
  const { action } = req.query;
  const [rows] = action && action !== "ALL"
    ? await db.execute("SELECT * FROM logs WHERE action=? ORDER BY created_at DESC LIMIT 200", [action])
    : await db.execute("SELECT * FROM logs ORDER BY created_at DESC LIMIT 200");
  res.json(rows);
};

// ── ESP32 ─────────────────────────────────────────────────────────────────────
const verifyOTP = async (req, res) => {
  const { otp } = req.body;
  if (!otp) return res.status(400).json({ success: false, message: "Thiếu OTP" });
  try {
    const [orders] = await db.execute(
      `SELECT o.*,l.locker_code,l.id AS lid,l.status AS lstat FROM orders o JOIN lockers l ON o.locker_id=l.id WHERE o.otp=? AND o.otp_used=0 AND o.status='PENDING' LIMIT 1`,
      [otp]
    );
    if (!orders.length) return res.status(400).json({ success: false, message: "OTP không hợp lệ hoặc đã hết hạn" });
    const o = orders[0];
    if (o.lstat !== "FULL") return res.status(400).json({ success: false, message: "Ngăn tủ không còn hàng" });

    await db.execute("UPDATE orders SET otp_used=1,status='COMPLETED',completed_at=NOW() WHERE id=?", [o.id]);
    await db.execute("UPDATE lockers SET status='EMPTY' WHERE id=?", [o.lid]);
    await db.execute("INSERT INTO logs (action,locker_code,room,user_name,method,status) VALUES (?,?,?,?,?,?)",
      ["PICKUP", o.locker_code, o.room, `Cư dân phòng ${o.room}`, "OTP", "COMPLETED"]);

    const io = req.app.get("io");
    io?.emit("locker_updated", { lockerId: o.lid, lockerCode: o.locker_code, status: "EMPTY" });
    io?.emit("pickup_done",    { lockerCode: o.locker_code, room: o.room, method: "OTP" });

    // ESP32 đọc response này để biết relay nào cần kích và giữ bao lâu
    res.json({
      success:          true,
      message:          `Xác thực thành công, mở ngăn ${o.locker_code}!`,
      locker_id:        o.lid,          // ESP32 map sang relay pin (VD: L01→GPIO18, L02→GPIO19,...)
      locker_code:      o.locker_code,  // Hiển thị lên màn hình LCD nếu có
      room:             o.room,
      open_duration_ms: 5000,           // Giữ relay mở 5 giây, sau đó ESP32 tự khoá lại
    });
  } catch(e) { console.error(e); res.status(500).json({ success: false, message: "Lỗi server" }); }
};

const verifyRFID = async (req, res) => {
  const { rfid_uid } = req.body;
  if (!rfid_uid) return res.status(400).json({ success: false, message: "Thiếu RFID UID" });
  try {
    const [residents] = await db.execute("SELECT * FROM residents WHERE rfid_uid=?", [rfid_uid.toUpperCase()]);
    if (!residents.length) return res.status(400).json({ success: false, message: "Thẻ RFID không được đăng ký" });

    const resident = residents[0];
    const [orders] = await db.execute(
      `SELECT o.*,l.locker_code,l.id AS lid FROM orders o JOIN lockers l ON o.locker_id=l.id WHERE o.room=? AND o.status='PENDING' AND l.status='FULL' ORDER BY o.created_at ASC LIMIT 1`,
      [resident.room]
    );
    if (!orders.length) return res.json({ success: false, message: `Xin chào ${resident.name}. Không có hàng cho phòng ${resident.room}.` });

    const o = orders[0];
    await db.execute("UPDATE orders SET otp_used=1,status='COMPLETED',completed_at=NOW() WHERE id=?", [o.id]);
    await db.execute("UPDATE lockers SET status='EMPTY' WHERE id=?", [o.lid]);
    await db.execute("INSERT INTO logs (action,locker_code,room,user_name,method,status) VALUES (?,?,?,?,?,?)",
      ["PICKUP", o.locker_code, resident.room, resident.name, "RFID", "COMPLETED"]);

    const io = req.app.get("io");
    io?.emit("locker_updated", { lockerId: o.lid, lockerCode: o.locker_code, status: "EMPTY" });
    io?.emit("pickup_done",    { lockerCode: o.locker_code, room: resident.room, method: "RFID" });

    res.json({
      success:          true,
      message:          `Xin chào ${resident.name}! Mở ngăn ${o.locker_code}!`,
      locker_id:        o.lid,
      locker_code:      o.locker_code,
      room:             resident.room,
      resident_name:    resident.name,
      open_duration_ms: 5000,
    });
  } catch(e) { console.error(e); res.status(500).json({ success: false, message: "Lỗi server" }); }
};

const scanRFID = (req, res) => {
  const { rfid_uid, session_id } = req.body;
  if (!rfid_uid) return res.status(400).json({ message: "Thiếu rfid_uid" });
  req.app.get("io")?.emit("rfid_scanned", { rfid_uid: rfid_uid.toUpperCase(), session_id });
  res.json({ success: true, rfid_uid: rfid_uid.toUpperCase() });
};


// ── LOCKER COMMAND (ESP32 polling) ───────────────────────────────────────────
// Lưu lệnh chờ ESP32 lấy: { locker_code: { command, duration_ms, reason } }
const pendingCommands = {};

const getLockerCommand = (req, res) => {
  const { locker_code } = req.params;
  const cmd = pendingCommands[locker_code];
  if (cmd) {
    delete pendingCommands[locker_code]; // xóa sau khi ESP32 lấy
    return res.json(cmd);
  }
  res.json({ command: null });
};

const setPendingCommand = (locker_code, command) => {
  pendingCommands[locker_code] = command;
};

module.exports = {
  register, login, getMe,
  getLockersAll, resetLocker,
  createOrder, getOrders,
  getResidents, createResident, deleteResident,
  getLogs,
  verifyOTP, scanRFID,
  getLockerCommand, setPendingCommand,
};
const router = require("express").Router();
const { authenticate, requireAdmin, requireShipper } = require("../middleware/auth");
const c = require("../controllers");

router.post("/auth/register",    c.register);
router.post("/auth/login",       c.login);
router.get ("/auth/me",          authenticate, c.getMe);

router.get("/lockers",           authenticate, c.getLockersAll);
router.put("/lockers/:id/reset", authenticate, requireAdmin, c.resetLocker);

router.post("/orders",           authenticate, requireShipper, c.createOrder);
router.get ("/orders",           authenticate, c.getOrders);

router.get("/logs",              authenticate, c.getLogs);

router.get   ("/residents",     authenticate, requireAdmin, c.getResidents);
router.post  ("/residents",     authenticate, requireAdmin, c.createResident);
router.delete("/residents/:id", authenticate, requireAdmin, c.deleteResident);

// ESP32 — không cần JWT
router.post("/verify-otp",  c.verifyOTP);
router.post("/scan-rfid",   c.scanRFID);
router.get("/locker-command/:locker_code", c.getLockerCommand); // ESP32 polling

module.exports = router;
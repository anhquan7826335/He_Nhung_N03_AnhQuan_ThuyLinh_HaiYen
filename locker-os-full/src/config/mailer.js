const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.MAIL_PORT) || 587,
  secure: false,
  auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS },
});

// ── Gửi OTP cho Shipper ───────────────────────────────────────────────────────
const sendOTPToShipper = async (to, otp, locker, room) => {
  await transporter.sendMail({
    from:    process.env.MAIL_FROM || '"LockerOS" <noreply@locker.vn>',
    to,
    subject: `[LockerOS] OTP giao hàng - Ngăn ${locker} - Phòng ${room}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f9fafb;border-radius:12px;">
        <h2 style="color:#4f46e5;margin:0 0 4px;">▣ LockerOS</h2>
        <p style="color:#6b7280;font-size:13px;margin:0 0 24px;">Hệ thống quản lý tủ locker</p>
        <div style="background:#fff;border-radius:10px;padding:24px;border:1px solid #e5e7eb;">
          <p style="color:#374151;">Bạn vừa giao hàng vào <strong>Ngăn ${locker}</strong> - Phòng <strong>${room}</strong>.</p>
          <p style="color:#374151;margin-bottom:8px;">Mã OTP để cư dân nhận hàng:</p>
          <div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:10px;padding:20px;text-align:center;">
            <div style="font-family:monospace;font-size:42px;font-weight:900;color:#16a34a;letter-spacing:0.3em;">${otp}</div>
            <p style="color:#6b7280;font-size:12px;margin:8px 0 0;">OTP hết hạn sau khi cư dân nhận hàng thành công</p>
          </div>
          <p style="color:#6b7280;font-size:13px;margin-top:16px;">Vui lòng chuyển mã này cho cư dân phòng <strong>${room}</strong>.</p>
        </div>
        <p style="text-align:center;color:#9ca3af;font-size:12px;margin-top:20px;">LockerOS — Chung cư Sunrise</p>
      </div>`,
  });
  console.log(`📧 OTP email (shipper) → ${to}`);
};

// ── Gửi OTP cho Cư dân ───────────────────────────────────────────────────────
const sendOTPToResident = async (to, residentName, otp, locker, room) => {
  await transporter.sendMail({
    from:    process.env.MAIL_FROM || '"LockerOS" <noreply@locker.vn>',
    to,
    subject: `[LockerOS] Bạn có hàng tại ngăn ${locker} - Phòng ${room}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f9fafb;border-radius:12px;">
        <h2 style="color:#4f46e5;margin:0 0 4px;">▣ LockerOS</h2>
        <p style="color:#6b7280;font-size:13px;margin:0 0 24px;">Hệ thống quản lý tủ locker</p>
        <div style="background:#fff;border-radius:10px;padding:24px;border:1px solid #e5e7eb;">
          <p style="color:#374151;">Xin chào <strong>${residentName}</strong>,</p>
          <p style="color:#374151;">Bạn có hàng tại <strong>Ngăn ${locker}</strong> - Phòng <strong>${room}</strong>.</p>
          <p style="color:#374151;margin-bottom:8px;">Dùng mã OTP này để mở tủ nhận hàng:</p>
          <div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:10px;padding:20px;text-align:center;">
            <div style="font-family:monospace;font-size:42px;font-weight:900;color:#16a34a;letter-spacing:0.3em;">${otp}</div>
            <p style="color:#6b7280;font-size:12px;margin:8px 0 0;">Nhập mã này vào bàn phím tủ locker để mở tủ</p>
          </div>
        </div>
        <p style="text-align:center;color:#9ca3af;font-size:12px;margin-top:20px;">LockerOS — Chung cư Sunrise</p>
      </div>`,
  });
  console.log(`📧 OTP email (resident) → ${to}`);
};

// ── Gửi email xác nhận khi thêm cư dân ──────────────────────────────────────
const sendResidentWelcome = async (to, residentName, room) => {
  await transporter.sendMail({
    from:    process.env.MAIL_FROM || '"LockerOS" <noreply@locker.vn>',
    to,
    subject: `[LockerOS] Xác nhận đăng ký - Phòng ${room}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f9fafb;border-radius:12px;">
        <h2 style="color:#4f46e5;margin:0 0 4px;">▣ LockerOS</h2>
        <p style="color:#6b7280;font-size:13px;margin:0 0 24px;">Hệ thống quản lý tủ locker</p>
        <div style="background:#fff;border-radius:10px;padding:24px;border:1px solid #e5e7eb;">
          <p style="color:#374151;">Xin chào <strong>${residentName}</strong>,</p>
          <p style="color:#374151;">Email này đã được đăng ký vào hệ thống LockerOS cho phòng <strong>${room}</strong>.</p>
          <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px;margin:16px 0;">
            <p style="color:#1e40af;margin:0;font-size:14px;">✓ Từ nay khi có hàng giao đến, bạn sẽ nhận được OTP qua email này để mở tủ nhận hàng.</p>
          </div>
          <p style="color:#6b7280;font-size:13px;">Nếu bạn không đăng ký điều này, vui lòng liên hệ ban quản lý.</p>
        </div>
        <p style="text-align:center;color:#9ca3af;font-size:12px;margin-top:20px;">LockerOS — Chung cư Sunrise</p>
      </div>`,
  });
  console.log(`📧 Welcome email → ${to}`);
};

module.exports = { sendOTPToShipper, sendOTPToResident, sendResidentWelcome };
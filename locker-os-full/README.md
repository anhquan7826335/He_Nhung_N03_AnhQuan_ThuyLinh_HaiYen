# LockerOS — Full Stack

React + NodeJS + MySQL + Socket.io — **1 port duy nhất**

## 📁 Cấu trúc

```
locker-os/
├── src/                        ← NodeJS backend
│   ├── index.js                  Server chính (Express + Socket.io)
│   ├── controllers.js            Toàn bộ logic xử lý
│   ├── routes/index.js           Định nghĩa API routes
│   ├── middleware/auth.js        JWT authentication
│   ├── config/
│   │   ├── db.js                 MySQL connection pool
│   │   └── mailer.js             Nodemailer (gửi OTP email)
│   └── utils/helpers.js          generateOTP, generateOrderCode
│
├── client/                     ← React frontend (Vite)
│   ├── src/
│   │   ├── App.jsx               Root component + routing
│   │   ├── components/
│   │   │   ├── UI.jsx            Icon, StatusBadge, LockerCard, Spinner
│   │   │   └── Sidebar.jsx       Navigation sidebar
│   │   ├── pages/
│   │   │   ├── AuthScreen.jsx    Đăng nhập / Đăng ký
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── ResidentManager.jsx  (có mock RFID scan)
│   │   │   ├── HistoryPage.jsx
│   │   │   ├── ShipperPage.jsx
│   │   │   └── OTPVerifyPage.jsx    (mock ESP32)
│   │   └── utils/
│   │       ├── api.js            Fetch wrapper gọi /api/*
│   │       ├── socket.js         Socket.io hook
│   │       └── constants.js      Icons, StatusConfig, generateRFID
│   └── vite.config.js            Dev: proxy /api → :5000
│
├── schema.sql                  ← Tạo database MySQL
├── package.json                ← Scripts chạy cả 2
└── .env.example                ← Cấu hình môi trường
```

## ⚡ Cài đặt & chạy

### 1. Chuẩn bị database
```bash
mysql -u root -p < schema.sql
```

### 2. Tạo file .env
```bash
cp .env.example .env
# Mở .env và điền DB_PASSWORD, JWT_SECRET, MAIL_USER, MAIL_PASS
```

### 3. Build frontend + chạy (production — 1 port)
```bash
npm run setup     # cài packages + build React
npm start         # chạy tại http://localhost:5000
```

### 4. Chế độ dev (2 terminal)
```bash
# Terminal 1 — Backend
npm run dev       # nodemon src/index.js → :5000

# Terminal 2 — Frontend  
npm run dev:client  # vite → :5173 (proxy /api → :5000)
```

## 🔌 API Endpoints

| Method | Path | Auth | Mô tả |
|--------|------|------|-------|
| POST | /api/auth/register | — | Đăng ký |
| POST | /api/auth/login | — | Đăng nhập |
| GET | /api/auth/me | JWT | Thông tin user hiện tại |
| GET | /api/lockers | JWT | Danh sách ngăn tủ |
| PUT | /api/lockers/:id/reset | Admin | Reset ngăn tủ |
| POST | /api/orders | Shipper | Tạo đơn + gửi OTP email |
| GET | /api/orders | JWT | Danh sách đơn hàng |
| GET | /api/residents | Admin | Danh sách cư dân |
| POST | /api/residents | Admin | Thêm cư dân |
| DELETE | /api/residents/:id | Admin | Xóa cư dân |
| GET | /api/logs | JWT | Lịch sử giao nhận |
| POST | /api/verify-otp | — | ESP32 xác thực OTP |
| POST | /api/verify-rfid | — | ESP32 xác thực RFID |
| POST | /api/scan-rfid | — | ESP32 đẩy UID khi admin đăng ký thẻ |

## 🔌 Socket.io Events

| Event | Chiều | Dữ liệu | Mô tả |
|-------|-------|---------|-------|
| `locker_updated` | Server→Client | `{lockerId, lockerCode, status}` | Tủ thay đổi trạng thái |
| `pickup_done` | Server→Client | `{lockerCode, room, method}` | Cư dân nhận hàng xong |
| `rfid_scanned` | Server→Client | `{rfid_uid, session_id}` | ESP32 đẩy UID khi admin quét thẻ |

## 👤 Tài khoản mặc định
- **Admin**: admin@locker.com / admin123

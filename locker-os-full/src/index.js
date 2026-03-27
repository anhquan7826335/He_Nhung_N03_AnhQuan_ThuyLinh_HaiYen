require("dotenv").config();
const express    = require("express");
const http       = require("http");
const path       = require("path");
const { Server } = require("socket.io");
const cors       = require("cors");
const routes     = require("./routes");

const app    = express();
const server = http.createServer(app);
const PORT   = process.env.PORT || 5000;
const isProd = process.env.NODE_ENV === "production";

// ── Socket.io ─────────────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: { origin: isProd ? false : "http://localhost:5173", methods: ["GET","POST"] },
});

// Lưu socket của từng ESP32 theo locker_code: { "L01": socketId, ... }
const esp32Sockets = {};
app.set("esp32Sockets", esp32Sockets);

io.on("connection", socket => {
  console.log("🔌 Socket connected:", socket.id);

  // ESP32 đăng ký locker_code của mình ngay khi kết nối
  // ESP32 emit: socket.emit("esp32_register", { locker_code: "L01" })
  socket.on("esp32_register", ({ locker_code }) => {
    esp32Sockets[locker_code] = socket.id;
    console.log(`📦 ESP32 registered: ${locker_code} → ${socket.id}`);
  });

  socket.on("disconnect", () => {
    for (const [code, id] of Object.entries(esp32Sockets)) {
      if (id === socket.id) {
        delete esp32Sockets[code];
        console.log(`📦 ESP32 disconnected: ${code}`);
      }
    }
    console.log("🔌 Socket disconnected:", socket.id);
  });
});
app.set("io", io);

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: isProd ? false : "http://localhost:5173" }));
app.use(express.json());

// ── API Routes ────────────────────────────────────────────────────────────────
app.use("/api", routes);

// ── Serve React build (production) ───────────────────────────────────────────
const clientDist = path.join(__dirname, "../client/dist");
app.use(express.static(clientDist));
app.get("*", (req, res) => {
  res.sendFile(path.join(clientDist, "index.html"));
});

// ── Start ─────────────────────────────────────────────────────────────────────
server.listen(PORT, () => {
  console.log(`🚀 LockerOS running → http://localhost:${PORT}`);
  console.log(`   API  → http://localhost:${PORT}/api`);
  if (!isProd) console.log("   Dev mode: start React separately with  cd client && npm run dev");
});
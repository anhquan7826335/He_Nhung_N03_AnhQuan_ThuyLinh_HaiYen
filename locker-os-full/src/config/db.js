const mysql = require("mysql2/promise");
require("dotenv").config();
 
const pool = mysql.createPool({
  host:               process.env.DB_HOST     || "localhost",
  port:               process.env.DB_PORT     || 3306,
  user:               process.env.DB_USER     || "root",
  password:           process.env.DB_PASSWORD || "",
  database:           process.env.DB_NAME     || "locker_os",
  waitForConnections: true,
  connectionLimit:    10,
  charset:            "utf8mb4",
  // Aiven yêu cầu SSL
  ssl: process.env.DB_HOST?.includes("aivencloud.com")
    ? { rejectUnauthorized: false }
    : undefined,
});
 
pool.getConnection()
  .then(c => { console.log("✅ MySQL connected"); c.release(); })
  .catch(e => console.error("❌ MySQL error:", e.message));
 
module.exports = pool;
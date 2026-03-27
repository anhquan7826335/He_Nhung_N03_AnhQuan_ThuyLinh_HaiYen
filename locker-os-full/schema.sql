CREATE DATABASE IF NOT EXISTS locker_os CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE locker_os;

CREATE TABLE IF NOT EXISTS users (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(150) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,
  role       ENUM('admin','shipper') NOT NULL DEFAULT 'shipper',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS residents (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  room       VARCHAR(20)  NOT NULL,
  email      VARCHAR(150) NOT NULL UNIQUE,
  phone      VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lockers (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  locker_code VARCHAR(10) NOT NULL UNIQUE,
  status      ENUM('EMPTY','FULL','OPEN') NOT NULL DEFAULT 'EMPTY',
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  order_code   VARCHAR(30) NOT NULL UNIQUE,
  locker_id    INT NOT NULL,
  room         VARCHAR(20) NOT NULL,
  otp          VARCHAR(10) NOT NULL,
  otp_used     TINYINT(1) DEFAULT 0,
  status       ENUM('PENDING','COMPLETED','CANCELLED') DEFAULT 'PENDING',
  shipper_id   INT NOT NULL,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  FOREIGN KEY (locker_id)  REFERENCES lockers(id),
  FOREIGN KEY (shipper_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS logs (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  action      ENUM('DELIVERY','PICKUP','RESET') NOT NULL,
  locker_code VARCHAR(10) NOT NULL,
  room        VARCHAR(20) NOT NULL,
  user_name   VARCHAR(100) NOT NULL,
  method      VARCHAR(20) DEFAULT '—',
  status      VARCHAR(20) NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed 4 ngăn tủ
INSERT IGNORE INTO lockers (locker_code, status) VALUES
  ('L01','EMPTY'),('L02','EMPTY'),('L03','EMPTY'),('L04','EMPTY');

-- Admin mặc định (password: admin123)
INSERT IGNORE INTO users (name, email, password, role) VALUES
  ('Admin Hệ thống','admin@locker.vn','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh7y','admin');
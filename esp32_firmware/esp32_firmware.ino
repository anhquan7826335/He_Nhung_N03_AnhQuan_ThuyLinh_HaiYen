/*
 * LockerOS — ESP32 Firmware 
 * 1 ESP32 điều khiển 4 relay → 4 ngăn tủ L01-L04
 * L04 logic ngược với các tủ còn lại
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <Keypad.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// ── Cấu hình WiFi ─────────────────────────────────────────────────────────────
const char* WIFI_SSID     = "Anhh quan";
const char* WIFI_PASSWORD = "123444567";

// ── Địa chỉ server ────────────────────────────────────────────────────────────
#define SERVER_URL "http://172.20.10.3:5000/api"

// ── Relay pins ────────────────────────────────────────────────────────────────
const int  RELAY_PINS[5]        = { -1, 16, 17, 18, 19 }; // index 0 bỏ, 1-4 = L01-L04
const char* LOCKER_CODES[5]     = { "", "L01", "L02", "L03", "L04" };

// Logic từng relay: true = ACTIVE_LOW (LOW=mở), false = ACTIVE_HIGH (HIGH=mở)
// L04 (index 4) bị ngược nên set false
const bool RELAY_ACTIVE_LOW[5] = { true, true, true, true, false };

// ── LCD I2C 16x2 ──────────────────────────────────────────────────────────────
#define LCD_ADDR 0x27
#define I2C_SDA 21
#define I2C_SCL 22

LiquidCrystal_I2C lcd(LCD_ADDR, 16, 2);

// ── Keypad 4x4 ────────────────────────────────────────────────────────────────
const byte KP_ROWS = 4;
const byte KP_COLS = 4;
char keys[KP_ROWS][KP_COLS] = {
  { '1','2','3','A' },
  { '4','5','6','B' },
  { '7','8','9','C' },
  { '*','0','#','D' },
};
byte rowPins[KP_ROWS] = { 13, 12, 14, 27 };
byte colPins[KP_COLS] = { 26, 25, 33, 32 };
Keypad keypad = Keypad(makeKeymap(keys), rowPins, colPins, KP_ROWS, KP_COLS);

String        otpBuffer     = "";
int           pollIndex     = 1;
unsigned long lastPoll      = 0;
const long    POLL_INTERVAL = 500;

// ─────────────────────────────────────────────────────────────────────────────
// LCD helpers

void lcdShow(String line1, String line2 = "") {
  lcd.clear();
  lcd.setCursor(0, 0); lcd.print(line1.substring(0, 16));
  if (line2.length() > 0) { lcd.setCursor(0, 1); lcd.print(line2.substring(0, 16)); }
}

void lcdTemp(String line1, String line2, int seconds) {
  lcdShow(line1, line2);
  delay(seconds * 1000);
  lcdIdle();
}

void lcdIdle() {
  lcdShow("Nhap OTP:", "_ _ _ _ _ _  #gui");
}

void lcdUpdateOTP() {
  lcd.setCursor(0, 0); lcd.print("Nhap OTP:       ");
  lcd.setCursor(0, 1);
  String display = "";
  for (int i = 0; i < 6; i++) {
    display += (i < (int)otpBuffer.length()) ? "*" : "_";
    if (i < 5) display += " ";
  }
  lcd.print(display + "  ");
}

// ─────────────────────────────────────────────────────────────────────────────
// Relay: mỗi ngăn có logic riêng

void relayOpen(int locker_id) {
  int pin = RELAY_PINS[locker_id];
  // ACTIVE_LOW=true  → mở bằng LOW
  // ACTIVE_LOW=false → mở bằng HIGH
  digitalWrite(pin, RELAY_ACTIVE_LOW[locker_id] ? LOW : HIGH);
}

void relayClose(int locker_id) {
  int pin = RELAY_PINS[locker_id];
  digitalWrite(pin, RELAY_ACTIVE_LOW[locker_id] ? HIGH : LOW);
}

void openLocker(int locker_id, long duration_ms, String reason) {
  if (locker_id < 1 || locker_id > 4) {
    Serial.println("Invalid locker_id: " + String(locker_id));
    return;
  }

  int    pin  = RELAY_PINS[locker_id];
  String code = String(LOCKER_CODES[locker_id]);

  Serial.println("Opening " + code + " (GPIO" + pin + ") activeLow=" + String(RELAY_ACTIVE_LOW[locker_id]) + " - " + reason + " - " + duration_ms + "ms");
  lcdShow("MO TU: " + code, reason == "DELIVERY" ? "Bo hang vao!" : "Lay hang ra!");

  relayOpen(locker_id);
  delay(duration_ms);
  relayClose(locker_id);

  Serial.println("Locked: " + code);
  lcdTemp("Da khoa lai!", code + " - Cam on!", 2);
}

// ─────────────────────────────────────────────────────────────────────────────

void setup() {
  Serial.begin(115200);
  Serial.println("ESP32 START");

  // Khởi tạo 4 relay — mặc định đóng (dựa theo logic từng ngăn)
  for (int i = 1; i <= 4; i++) {
    pinMode(RELAY_PINS[i], OUTPUT);
    relayClose(i); // đóng relay theo đúng logic từng ngăn
  }

  Wire.begin(I2C_SDA, I2C_SCL);
  lcd.init();
  lcd.backlight();
  lcdShow("LockerOS", "Khoi dong...");

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  lcdShow("Ket noi WiFi...", WIFI_SSID);
  Serial.print("Connecting WiFi");
  while (WiFi.status() != WL_CONNECTED) { delay(500); Serial.print("."); }
  Serial.println("\nWiFi: " + WiFi.localIP().toString());
  lcdTemp("WiFi OK!", WiFi.localIP().toString(), 2);

  Serial.println("Ready - L01 L02 L03(inv) L04");
  lcdIdle();
}

// ─────────────────────────────────────────────────────────────────────────────

void loop() {
  handleKeypad();
  pollServerCommand();
}

// ── Polling lần lượt từng ngăn ───────────────────────────────────────────────

void pollServerCommand() {
  if (millis() - lastPoll < POLL_INTERVAL) return;
  lastPoll = millis();
  if (WiFi.status() != WL_CONNECTED) return;

  String lockerCode = String(LOCKER_CODES[pollIndex]);
  HTTPClient http;
  http.begin(String(SERVER_URL) + "/locker-command/" + lockerCode);
  int httpCode = http.GET();

  if (httpCode == 200) {
    StaticJsonDocument<128> doc;
    if (!deserializeJson(doc, http.getString())) {
      String command = doc["command"] | "";
      if (command == "open") {
        long   duration = doc["duration_ms"] | 5000;
        String reason   = doc["reason"]      | "DELIVERY";
        int    lockerId = pollIndex;
        http.end();
        openLocker(lockerId, duration, reason);
        pollIndex = 1;
        lastPoll  = millis();
        return;
      }
    }
  }

  http.end();
  pollIndex++;
  if (pollIndex > 4) pollIndex = 1;
}

// ── Keypad: nhập OTP ─────────────────────────────────────────────────────────

void handleKeypad() {
  char key = keypad.getKey();
  if (!key) return;

  if (key >= '0' && key <= '9') {
    if (otpBuffer.length() < 6) {
      otpBuffer += key;
      lcdUpdateOTP();
    }
  } else if (key == '*') {
    if (otpBuffer.length() > 0) {
      otpBuffer.remove(otpBuffer.length() - 1);
      if (otpBuffer.length() == 0) lcdIdle();
      else lcdUpdateOTP();
    }
  } else if (key == '#') {
    if (otpBuffer.length() == 6) {
      lcdShow("Dang xac thuc...", "");
      StaticJsonDocument<64> body;
      body["otp"] = otpBuffer;
      String bodyStr;
      serializeJson(body, bodyStr);
      callVerify("/verify-otp", bodyStr);
      otpBuffer = "";
    } else {
      lcdTemp("Chua du 6 so!", "*=xoa  #=gui", 2);
    }
  }
}

// ── POST lên server xác thực OTP ─────────────────────────────────────────────

void callVerify(const char* endpoint, const String& body) {
  if (WiFi.status() != WL_CONNECTED) {
    lcdTemp("Loi WiFi!", "Kiem tra mang", 3);
    return;
  }

  HTTPClient http;
  http.begin(String(SERVER_URL) + endpoint);
  http.addHeader("Content-Type", "application/json");
  int httpCode = http.POST(body);

  Serial.println("HTTP " + String(httpCode));

  if (httpCode == 200) {
    String payload = http.getString();
    Serial.println("Response: " + payload);
    StaticJsonDocument<256> doc;
    if (!deserializeJson(doc, payload)) {
      bool   success  = doc["success"];
      int    lockerId = doc["locker_id"]        | 0;
      long   duration = doc["open_duration_ms"] | 5000;
      String msg      = doc["message"]          | "";

      if (success && lockerId >= 1 && lockerId <= 4) {
        http.end();
        openLocker(lockerId, duration, "PICKUP");
        return;
      } else {
        Serial.println("Denied: " + msg);
        lcdTemp("Xac thuc loi!", msg.substring(0, 16), 3);
      }
    }
  } else if (httpCode == 400) {
    lcdTemp("OTP sai!", "Thu lai", 3);
  } else {
    lcdTemp("Loi ket noi!", "HTTP: " + String(httpCode), 3);
  }

  http.end();
  lcdIdle();
}

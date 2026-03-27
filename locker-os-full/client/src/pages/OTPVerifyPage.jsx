import { useState, useEffect } from "react";
import { LockerCard } from "../components/UI";
import { esp32API, lockerAPI } from "../utils/api";
import { useSocket } from "../utils/socket";

export default function OTPVerifyPage() {
  const [lockers, setLockers] = useState([]);
  const [mode, setMode]       = useState("OTP");
  const [input, setInput]     = useState("");
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { lockerAPI.getAll().then(setLockers).catch(console.error); }, []);

  useSocket({
    locker_updated: ({ lockerId, status }) =>
      setLockers(p => p.map(l => l.id === lockerId ? { ...l, status } : l)),
  });

  const handleVerify = async () => {
    setLoading(true);
    try {
      const res = mode === "OTP"
        ? await esp32API.verifyOTP(input)
        : await esp32API.verifyRFID(input);
      setResult({ success: res.success, message: res.message });
    } catch (err) {
      setResult({ success: false, message: err.message });
    } finally { setLoading(false); }
  };

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#f1f5f9", margin: 0 }}>Xác thực nhận hàng</h2>
        <p style={{ color: "#64748b", marginTop: 4, fontSize: 13 }}>Mô phỏng thiết bị ESP32 · kết nối API thật</p>
      </div>
      <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
        <div style={{ background: "#080c12", border: "2px solid #1e293b", borderRadius: 20, padding: 28, width: 310, flexShrink: 0 }}>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div style={{ fontSize: 10, color: "#334155", fontFamily: "monospace", letterSpacing: "0.15em", marginBottom: 5 }}>ESP32 LOCKER CONTROLLER</div>
            <div style={{ display: "flex", justifyContent: "center", gap: 6, alignItems: "center" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 6px #4ade80" }} />
              <span style={{ fontSize: 11, color: "#4ade80", fontFamily: "monospace" }}>ONLINE</span>
            </div>
          </div>
          <div style={{ display: "flex", background: "#0d1117", borderRadius: 9, padding: 3, marginBottom: 20, border: "1px solid #1e293b" }}>
            {["OTP","RFID"].map(m => (
              <button key={m} onClick={() => { setMode(m); setResult(null); setInput(""); }} style={{ flex:1, padding:"9px 0", borderRadius:7, border:"none", background: mode===m?"#4f46e5":"transparent", color: mode===m?"#fff":"#64748b", cursor:"pointer", fontWeight:800, fontSize:13 }}>{m}</button>
            ))}
          </div>
          <div style={{ marginBottom: 8, fontSize: 12, color: "#64748b", textAlign: "center" }}>{mode==="OTP"?"Nhập mã OTP 6 chữ số":"Nhập UID thẻ RFID"}</div>
          <input value={input} onChange={e => { setInput(mode==="OTP"?e.target.value.replace(/\D/g,"").slice(0,6):e.target.value); setResult(null); }} maxLength={mode==="OTP"?6:12} placeholder={mode==="OTP"?"○  ○  ○  ○  ○  ○":"VD: A1B2C3D4"} style={{ width:"100%", background:"#161b22", border:"2px solid #334155", borderRadius:10, padding:"13px", color: mode==="OTP"?"#fbbf24":"#60a5fa", fontSize: mode==="OTP"?28:18, outline:"none", textAlign:"center", fontFamily:"monospace", letterSpacing: mode==="OTP"?"0.3em":"0.1em", boxSizing:"border-box" }} />
          <button onClick={handleVerify} disabled={loading||(mode==="OTP"?input.length!==6:!input)} style={{ width:"100%", marginTop:14, background:"#4f46e5", border:"none", color:"#fff", padding:"13px 0", borderRadius:9, cursor:"pointer", fontWeight:800, fontSize:15, opacity: loading||(mode==="OTP"?input.length!==6:!input)?0.5:1 }}>
            {loading?"⟳ Đang xác thực...":"✓ XÁC THỰC"}
          </button>
          {result && (
            <div style={{ marginTop:14, padding:16, borderRadius:10, background: result.success?"#0a1f0d":"#1f0a0a", border:`1px solid ${result.success?"#166534":"#7f1d1d"}`, textAlign:"center" }}>
              <div style={{ fontSize:28, marginBottom:8 }}>{result.success?"🔓":"🔒"}</div>
              <div style={{ color: result.success?"#4ade80":"#f87171", fontWeight:700, fontSize:13, whiteSpace:"pre-line" }}>{result.message}</div>
            </div>
          )}
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: "#64748b", margin: "0 0 12px", textTransform: "uppercase" }}>Trạng thái tủ (realtime)</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}>
            {lockers.map(l => <LockerCard key={l.id} locker={l} isAdmin={false} onReset={() => {}} />)}
          </div>
        </div>
      </div>
    </div>
  );
}

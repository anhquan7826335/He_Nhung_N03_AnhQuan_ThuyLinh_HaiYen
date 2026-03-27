import { useState, useEffect } from "react";
import { StatusBadge, Spinner } from "../components/UI";
import { lockerAPI, orderAPI } from "../utils/api";
import { useSocket } from "../utils/socket";

export default function ShipperPage({ currentUser }) {
  const [lockers, setLockers] = useState([]);
  const [orders,  setOrders]  = useState([]);
  const [form, setForm]       = useState({ room: "", locker_id: "" });
  const [doneOrder, setDone]  = useState(null);
  const [sending, setSending] = useState(false);
  const [step, setStep]       = useState(1);

  useEffect(() => {
    lockerAPI.getAll().then(setLockers).catch(console.error);
    orderAPI.getAll().then(setOrders).catch(console.error);
  }, []);

  useSocket({
    locker_updated: ({ lockerId, status }) =>
      setLockers(p => p.map(l => l.id === lockerId ? { ...l, status } : l)),
  });

  const available = lockers.filter(l => l.status === "EMPTY");

  const handleCreate = async () => {
    if (!form.room || !form.locker_id) return;
    setSending(true);
    try {
      const res = await orderAPI.create(parseInt(form.locker_id), form.room);
      setDone(res);
      setOrders(p => [{ ...res, status: "PENDING" }, ...p]);
      setLockers(p => p.map(l => l.id === parseInt(form.locker_id) ? { ...l, status: "FULL" } : l));
      setStep(2);
    } catch (err) { alert(err.message); }
    finally { setSending(false); }
  };

  if (step === 2 && doneOrder) return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: "#f1f5f9", margin: "0 0 24px" }}>Giao hàng thành công!</h2>
      <div style={{ background: "#0a1f0d", border: "1px solid #166534", borderRadius: 16, padding: 32, maxWidth: 460 }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 52, marginBottom: 10 }}>📦</div>
          <div style={{ color: "#4ade80", fontSize: 16, fontWeight: 700 }}>Hàng đã vào ngăn {doneOrder.locker_code}</div>
          <div style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>OTP đã gửi tới email <strong style={{ color: "#818cf8" }}>{currentUser.email}</strong></div>
        </div>
        <div style={{ background: "#0f1a2a", border: "1px solid #1e40af", borderRadius: 10, padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 18 }}>📧</span>
          <div style={{ fontSize: 12, color: "#60a5fa", fontWeight: 700 }}>Kiểm tra hộp thư của bạn để xem OTP</div>
        </div>
        <div style={{ background: "#0d1117", border: "1px solid #4ade80", borderRadius: 12, padding: 20, textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 8 }}>MÃ OTP</div>
          <div style={{ fontFamily: "monospace", fontSize: 44, fontWeight: 900, color: "#4ade80", letterSpacing: "0.25em" }}>{doneOrder.otp}</div>
          <div style={{ fontSize: 11, color: "#64748b", marginTop: 8 }}>Chỉ mất hiệu lực sau khi cư dân nhận hàng thành công</div>
        </div>
        {[["Ngăn tủ",doneOrder.locker_code],["Phòng",doneOrder.room],["Mã đơn",doneOrder.order_code]].map(([l,v]) => (
          <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:"1px solid #1e293b" }}>
            <span style={{ color:"#64748b", fontSize:13 }}>{l}</span>
            <span style={{ color:"#f1f5f9", fontFamily:"monospace", fontWeight:700 }}>{v}</span>
          </div>
        ))}
        <button onClick={() => { setStep(1); setForm({ room:"", locker_id:"" }); setDone(null); }} style={{ marginTop:20, width:"100%", background:"#4f46e5", border:"none", color:"#fff", padding:13, borderRadius:9, cursor:"pointer", fontWeight:800, fontSize:14 }}>+ Tạo đơn mới</button>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#f1f5f9", margin: 0 }}>Tạo đơn giao hàng</h2>
        <p style={{ color: "#64748b", marginTop: 4, fontSize: 13 }}>Xin chào, <strong style={{ color: "#f1f5f9" }}>{currentUser.name}</strong></p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 24 }}>
        <div style={{ background: "#0d1117", border: "1px solid #1e293b", borderRadius: 14, padding: 24 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: "#818cf8", margin: "0 0 20px", textTransform: "uppercase" }}>Thông tin đơn hàng</h3>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 7, fontWeight: 600 }}>Số phòng *</label>
            <input value={form.room} onChange={e => setForm(p => ({ ...p, room: e.target.value }))} placeholder="VD: 202" style={{ width:"100%", background:"#161b22", border:"1px solid #2d3748", borderRadius:8, padding:"11px 14px", color:"#f1f5f9", fontSize:18, outline:"none", boxSizing:"border-box", fontFamily:"monospace", letterSpacing:3 }} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 7, fontWeight: 600 }}>Chọn ngăn tủ *</label>
            <select value={form.locker_id} onChange={e => setForm(p => ({ ...p, locker_id: e.target.value }))} style={{ width:"100%", background:"#161b22", border:"1px solid #2d3748", borderRadius:8, padding:"11px 14px", color: form.locker_id?"#f1f5f9":"#64748b", fontSize:14, outline:"none", boxSizing:"border-box" }}>
              <option value="">-- Chọn ngăn trống --</option>
              {available.map(l => <option key={l.id} value={l.id}>Ngăn {l.locker_code}</option>)}
            </select>
            {available.length === 0 && <p style={{ color:"#f87171", fontSize:12, marginTop:6 }}>⚠ Tất cả ngăn đang có hàng</p>}
          </div>
          <button onClick={handleCreate} disabled={!form.room || !form.locker_id || sending} style={{ width:"100%", background: form.room && form.locker_id && !sending?"#4f46e5":"#1e293b", border:"none", color: form.room && form.locker_id && !sending?"#fff":"#475569", padding:"13px 0", borderRadius:9, cursor:"pointer", fontWeight:800, fontSize:15 }}>
            {sending ? "⟳ Đang gửi..." : "📤 Mở tủ & Gửi OTP"}
          </button>
        </div>
        <div>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: "#64748b", margin: "0 0 14px", textTransform: "uppercase" }}>Đơn hàng của bạn ({orders.length})</h3>
          {orders.length === 0
            ? <div style={{ color:"#475569", fontSize:13, padding:"40px 0", textAlign:"center" }}>Chưa có đơn hàng nào.</div>
            : orders.map(o => (
              <div key={o.id || o.order_id} style={{ background:"#0d1117", border:"1px solid #1e293b", borderRadius:10, padding:"14px 18px", display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                <div>
                  <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom:5 }}>
                    <span style={{ fontFamily:"monospace", color:"#818cf8", fontSize:12 }}>{o.order_code}</span>
                    <StatusBadge status={o.status} />
                  </div>
                  <div style={{ color:"#64748b", fontSize:12 }}>Phòng <strong style={{ color:"#f1f5f9" }}>{o.room}</strong> · Tủ <strong style={{ color:"#f1f5f9" }}>{o.locker_code}</strong></div>
                </div>
                {o.status === "PENDING" && o.otp && (
                  <div style={{ fontFamily:"monospace", fontSize:20, fontWeight:900, color:"#fbbf24", letterSpacing:3, background:"#1a150a", padding:"6px 14px", borderRadius:8, border:"1px solid #92400e" }}>{o.otp}</div>
                )}
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { StatusBadge, Spinner, ErrorMsg } from "../components/UI";
import { logAPI } from "../utils/api";

export default function HistoryPage() {
  const [logs, setLogs]       = useState([]);
  const [filter, setFilter]   = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    setLoading(true);
    logAPI.getAll(filter)
      .then(setLogs)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [filter]);

  if (error) return <ErrorMsg msg={error} />;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#f1f5f9", margin: 0 }}>Lịch sử giao nhận</h2>
          <p style={{ color: "#64748b", marginTop: 4, fontSize: 13 }}>{logs.length} hoạt động</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {[["ALL","Tất cả"],["DELIVERY","Giao hàng"],["PICKUP","Nhận hàng"]].map(([f,label]) => (
            <button key={f} onClick={() => setFilter(f)} style={{ background: filter===f?"#4f46e5":"#1e293b", border:`1px solid ${filter===f?"#4f46e5":"#334155"}`, color: filter===f?"#fff":"#94a3b8", padding:"7px 16px", borderRadius:8, cursor:"pointer", fontSize:12, fontWeight:700 }}>{label}</button>
          ))}
        </div>
      </div>
      {loading ? <Spinner /> : (
        <div style={{ background: "#0d1117", border: "1px solid #1e293b", borderRadius: 12, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr style={{ background: "#161b22" }}>
              {["Thời gian","Hành động","Ngăn tủ","Phòng","Người thực hiện","Phương thức","Trạng thái"].map(h => (
                <th key={h} style={{ padding:"12px 16px", textAlign:"left", fontSize:11, color:"#64748b", fontWeight:700 }}>{h.toUpperCase()}</th>
              ))}
            </tr></thead>
            <tbody>
              {logs.length === 0
                ? <tr><td colSpan={7} style={{ padding:30, textAlign:"center", color:"#475569" }}>Không có dữ liệu</td></tr>
                : logs.map((l,i) => (
                  <tr key={l.id} style={{ borderTop:"1px solid #1e293b", background: i%2?"#080c12":"transparent" }}>
                    <td style={{ padding:"13px 16px", fontFamily:"monospace", color:"#64748b", fontSize:12 }}>{new Date(l.created_at).toLocaleString("vi-VN")}</td>
                    <td style={{ padding:"13px 16px" }}><StatusBadge status={l.action} /></td>
                    <td style={{ padding:"13px 16px" }}><span style={{ fontFamily:"monospace", background:"#1e293b", color:"#818cf8", padding:"3px 10px", borderRadius:6, fontSize:13 }}>{l.locker_code}</span></td>
                    <td style={{ padding:"13px 16px", fontFamily:"monospace", color:"#f1f5f9", fontWeight:700 }}>{l.room}</td>
                    <td style={{ padding:"13px 16px", color:"#94a3b8", fontSize:13 }}>{l.user_name}</td>
                    <td style={{ padding:"13px 16px" }}>
                      {l.method && l.method !== "—"
                        ? <span style={{ background: l.method==="RFID"?"#0f1a2a":"#1a0f2a", color: l.method==="RFID"?"#60a5fa":"#c084fc", border:`1px solid ${l.method==="RFID"?"#1e40af":"#6b21a8"}`, padding:"2px 10px", borderRadius:20, fontSize:11, fontFamily:"monospace", fontWeight:700 }}>{l.method}</span>
                        : <span style={{ color:"#334155" }}>—</span>}
                    </td>
                    <td style={{ padding:"13px 16px" }}><StatusBadge status={l.status} /></td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

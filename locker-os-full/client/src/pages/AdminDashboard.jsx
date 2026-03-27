import { useState, useEffect } from "react";
import { LockerCard, Spinner, ErrorMsg } from "../components/UI";
import { lockerAPI } from "../utils/api";
import { useSocket } from "../utils/socket";

export default function AdminDashboard() {
  const [lockers, setLockers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  const fetchLockers = async () => {
    try {
      const data = await lockerAPI.getAll();
      setLockers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLockers(); }, []);

  // Lắng nghe cập nhật real-time từ socket
  useSocket({
    locker_updated: ({ lockerId, status }) => {
      setLockers(p => p.map(l => l.id === lockerId ? { ...l, status } : l));
    },
  });

  const handleReset = async (id) => {
    try {
      await lockerAPI.reset(id);
      setLockers(p => p.map(l => l.id === id ? { ...l, status: "EMPTY" } : l));
    } catch (err) {
      alert(err.message);
    }
  };

  const empty = lockers.filter(l => l.status === "EMPTY").length;
  const full  = lockers.filter(l => l.status === "FULL").length;

  if (loading) return <Spinner />;
  if (error)   return <ErrorMsg msg={error} />;

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#f1f5f9", margin: 0 }}>Tổng quan hệ thống</h2>
        <p style={{ color: "#64748b", marginTop: 4, fontSize: 13 }}>4 ngăn tủ — Chung cư Sunrise · Realtime</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 32 }}>
        {[
          { label: "Tổng ngăn tủ", value: lockers.length, color: "#818cf8" },
          { label: "Đang trống",   value: empty,           color: "#4ade80" },
          { label: "Có hàng",      value: full,            color: "#fb923c" },
        ].map((s, i) => (
          <div key={i} style={{ background: "#0d1117", border: "1px solid #1e293b", borderRadius: 14, padding: "22px 24px", borderTop: `3px solid ${s.color}` }}>
            <div style={{ fontSize: 40, fontWeight: 900, color: s.color, fontFamily: "monospace" }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 5, fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <h3 style={{ fontSize: 13, fontWeight: 700, color: "#94a3b8", marginBottom: 14, letterSpacing: "0.06em", textTransform: "uppercase" }}>Trạng thái ngăn tủ</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
        {lockers.map(l => <LockerCard key={l.id} locker={l} isAdmin={true} onReset={handleReset} />)}
      </div>
    </div>
  );
}

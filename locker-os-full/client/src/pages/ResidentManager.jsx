import { useState, useEffect } from "react";
import { Spinner, ErrorMsg } from "../components/UI";
import { residentAPI } from "../utils/api";

export default function ResidentManager() {
  const [residents, setResidents] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [showAdd, setShowAdd]     = useState(false);
  const [form, setForm]           = useState({ name: "", room: "", email: "", phone: "" });
  const [saving, setSaving]       = useState(false);
  const [formErr, setFormErr]     = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const iStyle = {
    width: "100%", background: "#161b22", border: "1px solid #2d3748",
    borderRadius: 7, padding: "9px 12px", color: "#f1f5f9",
    fontSize: 13, outline: "none", boxSizing: "border-box",
  };

  const fetchResidents = async () => {
    try {
      const data = await residentAPI.getAll();
      setResidents(data);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchResidents(); }, []);

  const resetForm = () => {
    setShowAdd(false);
    setForm({ name: "", room: "", email: "", phone: "" });
    setFormErr("");
    setSuccessMsg("");
  };

  const handleSave = async () => {
    setFormErr(""); setSuccessMsg("");
    if (!form.name || !form.room || !form.email) {
      setFormErr("Vui lòng điền đầy đủ Họ tên, Phòng và Email."); return;
    }
    const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailReg.test(form.email)) {
      setFormErr("Email không hợp lệ."); return;
    }
    setSaving(true);
    try {
      await residentAPI.create(form);
      setSuccessMsg(`✓ Đã thêm thành công! Email xác nhận đã gửi tới ${form.email}`);
      await fetchResidents();
      setForm({ name: "", room: "", email: "", phone: "" });
      // Tắt form sau 2.5 giây
      setTimeout(() => { setShowAdd(false); setSuccessMsg(""); }, 2500);
    } catch (err) { setFormErr(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Xóa cư dân này?")) return;
    try {
      await residentAPI.remove(id);
      setResidents(p => p.filter(r => r.id !== id));
    } catch (err) { alert(err.message); }
  };

  if (loading) return <Spinner />;
  if (error)   return <ErrorMsg msg={error} />;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#f1f5f9", margin: 0 }}>Quản lý cư dân</h2>
          <p style={{ color: "#64748b", marginTop: 4, fontSize: 13 }}>{residents.length} cư dân đăng ký · OTP gửi qua Gmail</p>
        </div>
        <button onClick={() => { resetForm(); setShowAdd(true); }}
          style={{ background: "#4f46e5", border: "none", color: "#fff", padding: "10px 20px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 13 }}>
          + Thêm cư dân
        </button>
      </div>

      {/* Form thêm cư dân */}
      {showAdd && (
        <div style={{ background: "#0d1117", border: "1px solid #4f46e5", borderRadius: 14, padding: 24, marginBottom: 20 }}>
          <h4 style={{ fontSize: 12, fontWeight: 700, color: "#818cf8", margin: "0 0 18px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Thêm cư dân mới
          </h4>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div>
              <label style={{ fontSize: 11, color: "#64748b", display: "block", marginBottom: 5, fontWeight: 600 }}>Họ & Tên *</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Nguyễn Văn A" style={iStyle} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "#64748b", display: "block", marginBottom: 5, fontWeight: 600 }}>Số phòng *</label>
              <input value={form.room} onChange={e => setForm(p => ({ ...p, room: e.target.value }))} placeholder="VD: 202" style={iStyle} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "#64748b", display: "block", marginBottom: 5, fontWeight: 600 }}>Gmail *</label>
              <div style={{ position: "relative" }}>
                <input value={form.email} type="email" onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="cudan@gmail.com" style={iStyle} />
              </div>
              <div style={{ fontSize: 11, color: "#475569", marginTop: 4 }}>
                📧 Email xác nhận + OTP giao hàng sẽ gửi tới địa chỉ này
              </div>
            </div>
            <div>
              <label style={{ fontSize: 11, color: "#64748b", display: "block", marginBottom: 5, fontWeight: 600 }}>Điện thoại</label>
              <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="0901234567" style={iStyle} />
            </div>
          </div>

          {formErr   && <div style={{ background: "#1f0a0a", border: "1px solid #7f1d1d", borderRadius: 8, padding: "10px 14px", color: "#f87171", fontSize: 13, marginBottom: 14 }}>⚠ {formErr}</div>}
          {successMsg && <div style={{ background: "#0a1f0d", border: "1px solid #166534", borderRadius: 8, padding: "10px 14px", color: "#4ade80", fontSize: 13, marginBottom: 14 }}>{successMsg}</div>}

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={handleSave} disabled={saving}
              style={{ background: saving ? "#1e293b" : "#4f46e5", border: "none", color: saving ? "#475569" : "#fff", padding: "10px 24px", borderRadius: 8, cursor: saving ? "not-allowed" : "pointer", fontWeight: 700, fontSize: 13 }}>
              {saving ? "⟳ Đang lưu..." : "Lưu & Gửi email xác nhận"}
            </button>
            <button onClick={resetForm}
              style={{ background: "#1e293b", border: "1px solid #334155", color: "#94a3b8", padding: "10px 20px", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>
              Hủy
            </button>
          </div>
        </div>
      )}

      {/* Bảng danh sách */}
      <div style={{ background: "#0d1117", border: "1px solid #1e293b", borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#161b22" }}>
              {["Họ & Tên","Phòng","Gmail","Điện thoại",""].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, color: "#64748b", fontWeight: 700, letterSpacing: "0.08em" }}>
                  {h.toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {residents.length === 0
              ? <tr><td colSpan={5} style={{ padding: 30, textAlign: "center", color: "#475569", fontSize: 13 }}>Chưa có cư dân nào</td></tr>
              : residents.map((r, i) => (
                <tr key={r.id} style={{ borderTop: "1px solid #1e293b", background: i % 2 ? "#080c12" : "transparent" }}>
                  <td style={{ padding: "13px 16px", color: "#f1f5f9", fontWeight: 600 }}>{r.name}</td>
                  <td style={{ padding: "13px 16px" }}>
                    <span style={{ fontFamily: "monospace", background: "#1e293b", color: "#818cf8", padding: "3px 10px", borderRadius: 6, fontSize: 13 }}>{r.room}</span>
                  </td>
                  <td style={{ padding: "13px 16px", color: "#60a5fa", fontSize: 13 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span>📧</span> {r.email}
                    </span>
                  </td>
                  <td style={{ padding: "13px 16px", color: "#94a3b8", fontSize: 13 }}>{r.phone || "—"}</td>
                  <td style={{ padding: "13px 16px" }}>
                    <button onClick={() => handleDelete(r.id)}
                      style={{ background: "#2a0f0f", border: "1px solid #7f1d1d", color: "#f87171", padding: "5px 12px", borderRadius: 6, cursor: "pointer", fontSize: 12 }}>
                      Xóa
                    </button>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}
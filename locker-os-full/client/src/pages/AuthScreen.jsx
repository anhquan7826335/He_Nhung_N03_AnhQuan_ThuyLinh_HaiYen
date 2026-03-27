import { useState } from "react";
import { Icon } from "../components/UI";
import { ic } from "../utils/constants";
import { authAPI } from "../utils/api";

export default function AuthScreen({ onLogin }) {
  const [tab, setTab]     = useState("login");
  const [form, setForm]   = useState({ email: "", password: "", name: "", role: "shipper", confirmPassword: "" });
  const [showPw, setShowPw]   = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const iStyle = { width: "100%", background: "#161b22", border: "1px solid #2d3748", borderRadius: 9, padding: "11px 14px", color: "#f1f5f9", fontSize: 14, outline: "none", boxSizing: "border-box" };

  const handleLogin = async () => {
    setError(""); setLoading(true);
    try {
      const data = await authAPI.login(form.email, form.password);
      localStorage.setItem("locker_token", data.token);
      onLogin(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setError(""); setSuccess("");
    if (form.password !== form.confirmPassword) { setError("Mật khẩu xác nhận không khớp."); return; }
    if (form.password.length < 6) { setError("Mật khẩu ít nhất 6 ký tự."); return; }
    setLoading(true);
    try {
      await authAPI.register({ name: form.name, email: form.email, password: form.password, role: form.role });
      setSuccess("Đăng ký thành công! Hãy đăng nhập.");
      setTab("login");
      setForm(p => ({ ...p, password: "", confirmPassword: "", name: "" }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#060910", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <div style={{ position: "fixed", top: "8%", left: "4%", width: 320, height: 320, background: "#4f46e520", borderRadius: "50%", filter: "blur(90px)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: "8%", right: "4%", width: 260, height: 260, background: "#0ea5e920", borderRadius: "50%", filter: "blur(90px)", pointerEvents: "none" }} />

      <div style={{ width: 420, position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 58, height: 58, background: "#4f46e5", borderRadius: 16, marginBottom: 14, boxShadow: "0 0 32px #4f46e566", fontSize: 26 }}>▣</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#f1f5f9", letterSpacing: "-0.02em" }}>LockerOS</div>
          <div style={{ fontSize: 12, color: "#475569", marginTop: 4, fontFamily: "monospace" }}>Hệ thống quản lý tủ locker chung cư</div>
        </div>

        <div style={{ background: "#0d1117", border: "1px solid #1e293b", borderRadius: 18, padding: 32, boxShadow: "0 24px 64px #00000066" }}>
          <div style={{ display: "flex", background: "#080c12", borderRadius: 10, padding: 4, marginBottom: 26, border: "1px solid #1e293b" }}>
            {[["login","Đăng nhập"],["register","Đăng ký"]].map(([t, label]) => (
              <button key={t} onClick={() => { setTab(t); setError(""); setSuccess(""); }} style={{ flex: 1, padding: "9px 0", borderRadius: 8, border: "none", background: tab === t ? "#4f46e5" : "transparent", color: tab === t ? "#fff" : "#64748b", cursor: "pointer", fontWeight: 700, fontSize: 13 }}>{label}</button>
            ))}
          </div>

          {tab === "login" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 6, fontWeight: 600 }}>Email</label>
                <input value={form.email} type="email" onChange={e => { setForm(p => ({ ...p, email: e.target.value })); setError(""); }} placeholder="email@example.com" style={iStyle} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 6, fontWeight: 600 }}>Mật khẩu</label>
                <div style={{ position: "relative" }}>
                  <input value={form.password} type={showPw ? "text" : "password"} onChange={e => { setForm(p => ({ ...p, password: e.target.value })); setError(""); }} placeholder="Nhập mật khẩu" style={{ ...iStyle, paddingRight: 42 }} />
                  <button onClick={() => setShowPw(p => !p)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#475569", padding: 0 }}>
                    <Icon d={showPw ? ic.eyeoff : ic.eye} size={16} />
                  </button>
                </div>
              </div>
              {error   && <div style={{ background: "#1f0a0a", border: "1px solid #7f1d1d", borderRadius: 8, padding: "10px 14px", color: "#f87171", fontSize: 13 }}>⚠ {error}</div>}
              {success && <div style={{ background: "#0a1f0d", border: "1px solid #166534", borderRadius: 8, padding: "10px 14px", color: "#4ade80", fontSize: 13 }}>✓ {success}</div>}
              <button onClick={handleLogin} disabled={loading} style={{ width: "100%", background: "#4f46e5", border: "none", color: "#fff", padding: "13px 0", borderRadius: 10, cursor: "pointer", fontWeight: 800, fontSize: 15, opacity: loading ? 0.7 : 1 }}>
                {loading ? "⟳ Đang đăng nhập..." : "Đăng nhập →"}
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[["name","Họ & Tên *","text"],["email","Email *","email"]].map(([k,label,type]) => (
                <div key={k}>
                  <label style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 6, fontWeight: 600 }}>{label}</label>
                  <input value={form[k]} type={type} onChange={e => { setForm(p => ({ ...p, [k]: e.target.value })); setError(""); }} placeholder={label} style={iStyle} />
                </div>
              ))}
              <div>
                <label style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 6, fontWeight: 600 }}>Vai trò *</label>
                <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} style={{ ...iStyle, cursor: "pointer" }}>
                  <option value="shipper">🚚 Shipper — Giao hàng</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 6, fontWeight: 600 }}>Mật khẩu *</label>
                <div style={{ position: "relative" }}>
                  <input value={form.password} type={showPw ? "text" : "password"} onChange={e => { setForm(p => ({ ...p, password: e.target.value })); setError(""); }} placeholder="Tối thiểu 6 ký tự" style={{ ...iStyle, paddingRight: 42 }} />
                  <button onClick={() => setShowPw(p => !p)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#475569", padding: 0 }}>
                    <Icon d={showPw ? ic.eyeoff : ic.eye} size={16} />
                  </button>
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 6, fontWeight: 600 }}>Xác nhận mật khẩu *</label>
                <input value={form.confirmPassword} type="password" onChange={e => { setForm(p => ({ ...p, confirmPassword: e.target.value })); setError(""); }} placeholder="Nhập lại mật khẩu" style={iStyle} />
              </div>
              {error && <div style={{ background: "#1f0a0a", border: "1px solid #7f1d1d", borderRadius: 8, padding: "10px 14px", color: "#f87171", fontSize: 13 }}>⚠ {error}</div>}
              <button onClick={handleRegister} disabled={loading} style={{ width: "100%", background: "#0ea5e9", border: "none", color: "#fff", padding: "13px 0", borderRadius: 10, cursor: "pointer", fontWeight: 800, fontSize: 15, opacity: loading ? 0.7 : 1 }}>
                {loading ? "⟳ Đang tạo tài khoản..." : "Tạo tài khoản →"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { authAPI } from "./utils/api";

import Sidebar          from "./components/Sidebar";
import ResidentManager  from "./pages/ResidentManager";
import AuthScreen       from "./pages/AuthScreen";
import AdminDashboard   from "./pages/AdminDashboard";
import HistoryPage      from "./pages/HistoryPage";
import ShipperPage      from "./pages/ShipperPage";
import OTPVerifyPage    from "./pages/OTPVerifyPage";
import { Spinner }      from "./components/UI";

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [page, setPage]               = useState("dashboard");
  const [checking, setChecking]       = useState(true); // kiểm tra token khi load

  // Tự động đăng nhập nếu còn token hợp lệ
  useEffect(() => {
    const token = localStorage.getItem("locker_token");
    if (!token) { setChecking(false); return; }
    authAPI.me()
      .then(user => { setCurrentUser(user); setPage(user.role === "admin" ? "dashboard" : "shipper"); })
      .catch(() => localStorage.removeItem("locker_token"))
      .finally(() => setChecking(false));
  }, []);

  const handleLogin = (user) => {
    setCurrentUser(user);
    setPage(user.role === "admin" ? "dashboard" : "shipper");
  };

  const handleLogout = () => {
    localStorage.removeItem("locker_token");
    setCurrentUser(null);
    setPage("dashboard");
  };

  if (checking) return (
    <div style={{ minHeight: "100vh", background: "#060910", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Spinner />
    </div>
  );

  if (!currentUser) return <AuthScreen onLogin={handleLogin} />;

  const isAdmin = currentUser.role === "admin";

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#060910", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <Sidebar currentUser={currentUser} page={page} setPage={setPage} onLogout={handleLogout} />

      <div style={{ flex: 1, padding: 32, overflowY: "auto" }}>
        {page === "dashboard" && isAdmin  && <AdminDashboard />}
        {page === "residents" && isAdmin  && <ResidentManager />}
        {page === "history"               && <HistoryPage />}
        {page === "shipper"  && !isAdmin  && <ShipperPage currentUser={currentUser} />}
        {page === "orders"   && !isAdmin  && <ShipperPage currentUser={currentUser} />}
        {page === "verify"                && <OTPVerifyPage />}
      </div>
    </div>
  );
}
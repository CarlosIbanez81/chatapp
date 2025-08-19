import React, { useEffect } from "react";
import "./SideNav.css";

export default function SideNav({ onLogout }) {
  useEffect(() => {
    document.body.classList.add("has-sidebar");
    return () => document.body.classList.remove("has-sidebar");
  }, []);

  function handleLogout() {
    if (typeof onLogout === "function") {
      try { onLogout(); return; } catch (e) { /* fall back below */ }
    }
    localStorage.removeItem("jwtToken");
    window.location.reload();
  }

  return (
    <aside className="side-nav" aria-label="Sidebar">
      <div className="brand">ChatApp</div>
      <div>
        <button className="logout" onClick={handleLogout}>Logout</button>
      </div>
    </aside>
  );
}
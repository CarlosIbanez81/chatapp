import React, { useEffect } from "react";
import "./SideNav.css";
// Sidomeny komponent
export default function SideNav({ onLogout }) {
  useEffect(() => {
    // Lägg till klass för sidomenyn
    document.body.classList.add("has-sidebar");
    return () => document.body.classList.remove("has-sidebar");
  }, []);
  // Funktion som hanterar utloggning
  function handleLogout() {
    // Rensa CSRF-token
    localStorage.removeItem("csrfToken");

    try {
      // anropa om den finns; optional chaining gör kontrollen onödig
      onLogout?.();
      return;
    } catch (e) {
      console.error("onLogout failed:", e);
      // fortsätt till fallback nedan
    }

    localStorage.removeItem("jwtToken");
    window.location.reload();
  }
  // Rendera sidomenyn
  return (
    <aside className="side-nav" aria-label="Sidebar">
      <div className="brand">ChatApp</div>
      <div>
        <button className="logout" onClick={handleLogout}>Logout</button>
      </div>
    </aside>
  );
}
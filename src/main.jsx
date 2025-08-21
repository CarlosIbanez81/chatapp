import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

async function ensureCsrf() {
  try {
    const saved = localStorage.getItem("csrfToken");
    if (saved) return;
    const res = await fetch("https://chatify-api.up.railway.app/csrf", { method: "PATCH" });
    if (!res.ok) {
      console.warn("CSRF endpoint responded", res.status);
      return;
    }
    const data = await res.json().catch(() => null);
    if (data?.csrfToken) localStorage.setItem("csrfToken", data.csrfToken);
  } catch (e) {
    console.error("CSRF fetch error:", e);
  }
}

// start fetching CSRF but don't wait for it — mount app immediately
ensureCsrf().catch((e) => console.error("ensureCsrf failed:", e));

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

import React, { useEffect, useState } from "react";
import decodeJwt from "./decodeJwt"; 

export default function TokenInfo() {
  const [payload, setPayload] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("jwtToken") || sessionStorage.getItem("jwtToken");
    if (!token) {
      setPayload(null);
      return;
    }

    const decoded = decodeJwt(token);
    if (decoded) {
      setPayload(decoded);
    } else {
      setPayload({ error: "Invalid token or decode failed" });
    }
  }, []);

  return (
    <div style={{ fontSize: 12, whiteSpace: "pre-wrap" }}>
      <strong>Token payload:</strong>
      <div>{payload ? JSON.stringify(payload, null, 2) : "No token found"}</div>
    </div>
  );
}

// simple, safe JWT payload decoder (no JSX here)
export default function decodeJwt(token) {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const padding = "=".repeat((4 - (base64Url.length % 4)) % 4);
    const base64 = (base64Url + padding).replace(/-/g, "+").replace(/_/g, "/");
    const raw = atob(base64);
    const json = decodeURIComponent(
      raw
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
}

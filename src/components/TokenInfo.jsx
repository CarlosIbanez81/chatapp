import React, { useEffect, useState } from "react";
import decodeJwt from "../utils/jwtdecoder";

export default function TokenInfo() {
  const [payload, setPayload] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("jwtToken") || sessionStorage.getItem("jwtToken");
    if (!token) { setPayload(null); return; }
    try {
      const decodedJwt = JSON.parse(atob(token.split(".")[1])); // your one-liner
      setPayload(decodedJwt);
    } catch (e) {
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
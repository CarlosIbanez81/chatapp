import React, { useEffect, useState } from "react";
import decodeJwt from "../utils/jwtdecoder";

export default function TokenInfo() {
  const [payload, setPayload] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("jwtToken") || sessionStorage.getItem("jwtToken");
    if (!token) { setPayload(null); return; }
    try {
      const decodedJwt = JSON.parse(atob(token.split(".")[1])); // från lärarens exempel
      setPayload(decodedJwt); //sparar decodad JWT
    } catch (e) {
      setPayload({ error: "Ogiltig token" });
    }
  }, []);

 /* return (
    <div style={{ fontSize: 12, whiteSpace: "pre-wrap" }}>
      <strong>Token payload:</strong>
      <div>{payload ? JSON.stringify(payload, null, 2) : "No token found"}</div>
    </div>
  );*/
}
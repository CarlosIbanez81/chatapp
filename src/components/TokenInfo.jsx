import React, { useEffect, useState } from "react";
import decodeJwt from "../utils/jwtdecoder";

export default function TokenInfo() {
  const [decodedJwt, setDecodedJwt] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("jwtToken") || sessionStorage.getItem("jwtToken");
    if (!token) {
      setDecodedJwt(null);
      return;
    }

    try {
      // try the simple one-liner first (per your request)
      const payload = JSON.parse(atob(token.split(".")[1]));
      setDecodedJwt(payload);
    } catch (e) {
      // fallback to the safer decoder if the one-liner fails
      setDecodedJwt(decodeJwt(token));
    }
  }, []);

  return (
    <div style={{ fontSize: 12, whiteSpace: "pre-wrap" }}>
      <strong>Token payload:</strong>
      <div>{decodedJwt ? JSON.stringify(decodedJwt, null, 2) : "No token found"}</div>
    </div>
  );
}
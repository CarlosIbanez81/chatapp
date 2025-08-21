import React, { useState } from "react";
import Messages from "./Messages";
import Register from "./Register";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [jwtToken, setJwtToken] = useState(localStorage.getItem("jwtToken"));
  const [showRegister, setShowRegister] = useState(false); // <-- toggle between login/register

  function handleLogin(e) {
    e.preventDefault();

    const csrf = localStorage.getItem("csrfToken") || "";

    fetch("https://chatify-api.up.railway.app/auth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, csrfToken: csrf }),
    })
      .then((res) => res.json().then((data) => ({ status: res.status, data })))
      .then(({ status, data }) => {
        if (status >= 200 && status < 300 && data.token) {
          localStorage.setItem("jwtToken", data.token);
          setJwtToken(data.token);
          alert("Lyckad inloggning");
        } else {
          alert(data?.message || "Inloggning misslyckades");
        }
      })
      .catch((err) => {
        console.log("Login error:", err);
        alert("Inloggning misslyckades");
      });
  }

  if (jwtToken) return <Messages token={jwtToken} />;

  if (showRegister) {
    return <Register onBack={() => setShowRegister(false)} />;
  }

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        /><br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        /><br />
        <button type="submit">Login</button>
        <button
          type="button"
          onClick={() => setShowRegister(true)}
          style={{ marginLeft: 8 }}
        >
          Register
        </button>
      </form>
    </div>
  );
}

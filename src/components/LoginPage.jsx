import React, { useState } from "react";
import Messages from "./Messages";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [jwtToken, setJwtToken] = useState(localStorage.getItem("jwtToken"));




  function handleLogin(e) {
    e.preventDefault();

    const csrf = localStorage.getItem("csrfToken") || "";

    fetch("https://chatify-api.up.railway.app/auth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: username, password: password, csrfToken: csrf })
    })
      .then(function(res) {
        return res.json().then((data) => ({ status: res.status, data }));
      })
      .then(function({ status, data }) {
        if (status >= 200 && status < 300 && data.token) {
          localStorage.setItem("jwtToken", data.token);
          setJwtToken(data.token);
          alert("Lyckad inloggning");
        } else {
          alert(data?.message || "Inloggning misslyckades");
        }
      })
      .catch(function(err) {
        console.log("Login error:", err);
        alert("Inloggning misslyckades");
      });
  }

  if (jwtToken) {
    return <Messages token={jwtToken} />;
  }

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={function(e) { setUsername(e.target.value); }}
        /><br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={function(e) { setPassword(e.target.value); }}
        /><br />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
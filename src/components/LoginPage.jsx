import React, { useState } from "react";
import Messages from "./Messages";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  function handleLogin(e) {
    e.preventDefault();

    fetch("https://chatify-api.up.railway.app/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username: username, password: password })
    })
      .then(function(res) {
        return res.json();
      })
      .then(function(data) {
        alert(data.message);

        // If login successful, switch to Messages
        if (data.message.toLowerCase().includes("success")) {
          setLoggedIn(true);
        }
      })
      .catch(function(err) {
        console.log("Login error:", err);
        alert("Login failed");
      });
  }

  if (loggedIn) {
    return <Messages />;
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

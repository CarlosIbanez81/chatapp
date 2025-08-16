import React, { useState } from "react";
import LoginPage from "./components/LoginPage";
import Register from "./components/Register"

export default function App() {
  const [page, setPage] = useState("");

  if (page === "login") {
    return <LoginPage />;
  }

  if (page === "register") {
    return <Register />;
  }

  return (
    <div>
      <h1>Welcome to Chatify</h1>
      <button onClick={() => setPage("login")}>Login</button>
      <button onClick={() => setPage("register")}>Register</button>
    </div>
  );
}

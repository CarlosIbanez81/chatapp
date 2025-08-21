import React, { useState } from "react";

export default function Register({ onBack }) {
  const [form, setForm] = useState({
    username: "",
    password: "",
    email: "",
    avatar: ""
  });

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    const avatarCode = Number(form.avatar);
    if (!Number.isInteger(avatarCode) || avatarCode < 0 || avatarCode > 70) {
      alert("Avatar måste vara ett heltal mellan 0 och 70.");
      return;
    }

    const csrfToken = localStorage.getItem("csrfToken") || "";

    fetch("https://chatify-api.up.railway.app/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: form.username,
        password: form.password,
        email: form.email,
        avatar: form.avatar,
        csrfToken
      })
    })
      .then(async (res) => {
        const data = await res.json().catch(() => null);
        if (res.ok) {
          alert(data?.message || "Registration successful");
          onBack(); // 👈 instead of window.location.href
        } else {
          alert(data?.message || "Register failed");
        }
      })
      .catch((err) => {
        console.error("Register error:", err);
        alert("Register failed");
      });
  }

  return (
    <div>
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        <input
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
        /><br />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
        /><br />
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        /><br />
        <input
          name="avatar"
          placeholder="Avatar nr. 0-70"
          value={form.avatar}
          onChange={handleChange}
        /><br />
        <button type="submit">Register</button>
      </form>

      <br />
      {/* 👇 new Login button */}
      <button onClick={onBack}>Back to Login</button>
    </div>
  );
}

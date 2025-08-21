import React, { useState } from "react";

export default function Register() {
  const [form, setForm] = useState({
    username: "",
    password: "",
    email: "",
    avatar: ""
  });

  function handleChange(e) {
    setForm(function (prev) {
      return { ...prev, [e.target.name]: e.target.value };
    });
  }

  function handleSubmit(e) {
    e.preventDefault();

    var avatarCode = Number(form.avatar);
    if (!Number.isInteger(avatarCode) || avatarCode < 0 || avatarCode > 70) {
      alert("Avatar måste vara ett heltal mellan 0 och 70.");
      return;
    }

    // Läs CSRF-token direkt från localStorage (ingen fetch här)
    const csrfToken = localStorage.getItem("csrfToken") || "";

    fetch("https://chatify-api.up.railway.app/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: form.username,
        password: form.password,
        email: form.email,
        avatar: form.avatar,
        csrfToken: csrfToken
      })
    })
      .then(async function (res) {
        const data = await res.json().catch(() => null);
        if (res.ok) {
          alert(data?.message || "Registration successful");
          window.location.href = "/login";
        } else {
          alert(data?.message || "Register failed");
        }
      })
      .catch(function (err) {
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
        />
        <br />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
        />
        <br />
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />
        <br />
        <input
          name="avatar"
          placeholder="Avatar nr. 0-70"
          value={form.avatar}
          onChange={handleChange}
        />
        <br />
        <button type="submit">Register</button>
      </form>
    </div>
  );
}


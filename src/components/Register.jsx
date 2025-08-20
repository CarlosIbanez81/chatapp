import React, { useEffect, useState } from "react";

export default function RegisterForm() {
  const [csrfToken, setCsrfToken] = useState("");
  const [form, setForm] = useState({
    username: "",
    password: "",
    email: "",
    avatar: ""
  });

  useEffect(function() {
    const saved = localStorage.getItem("csrfToken");
    if (saved) {
      setCsrfToken(saved);
      return;
    }

    fetch("https://chatify-api.up.railway.app/csrf", { method: "PATCH" })
      .then(function(res) {
        return res.json();
      })
      .then(function(data) {
        console.log("Fetched CSRF token:", data.csrfToken);
        setCsrfToken(data.csrfToken);
        // persist so other components can reuse it
        localStorage.setItem("csrfToken", data.csrfToken);
      })
      .catch(function(err) {
        console.error("CSRF fetch error:", err);
      });
  }, []);

  function handleChange(e) {
    let newForm = {
      username: form.username,
      password: form.password,
      email: form.email,
      avatar: form.avatar
    };
    newForm[e.target.name] = e.target.value;
    setForm(newForm);
  }

  function handleSubmit(e) {
    e.preventDefault();

        // Kolla om avatar är en siffra 0-255
    var avatarCode = Number(form.avatar);
    if (!Number.isInteger(avatarCode) || avatarCode < 0 || avatarCode > 255) {
      alert("Avatar måste vara ett heltal mellan 0 och 255.");
      return;
    }

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
 .then(function(res) {
        // read raw text so we can safely parse or fallback
        return res.text().then((text) => ({ ok: res.ok, status: res.status, text }));
      })
      .then(function({ ok, status, text }) {
        let data = null;
        try { data = text ? JSON.parse(text) : null; } catch (e) { data = text; }

        if (ok) {
          const successMsg = (data && data.message) ? data.message : "Registration successful";
          alert(successMsg);
          window.location.href = "/login";
        } else {
          // show server message if present, otherwise clear fallback
          const errMsg = (data && data.message) ? data.message : "Register failed";
          alert(errMsg);
        }
      })
      .catch(function(err) {
        console.error("Register error:", err);
        alert("Register failed");
      });
  }

  return (
    <div>
      <h1>Register</h1>
      {csrfToken === "" ? <p>Loading CSRF token...</p> : null}
      {csrfToken !== "" ?
        <form onSubmit={handleSubmit}>
          <input
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
          />
          <br></br>
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
          />
          <br></br>
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
          />
          <br></br>
          <input
            name="avatar"
            placeholder="Avatar nr. 0-70"
            value={form.avatar}
            onChange={handleChange}
          />
          
          <br></br>
          <button type="submit">Register</button>
          
        </form>
      : null}
    </div>
  );
}


import React, { useEffect, useState } from "react";

export default function RegisterForm() {
  const [csrfToken, setCsrfToken] = useState("");
  const [form, setForm] = useState({
    username: "",
    password: "",
    email: "",
    avatar: "none"
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
        console.log("Full response object:", res);
        return res.json();
      })
      .then(function(data) {
        console.log("Register response:", data);
        alert(data.message);
      })
      .catch(function(err) {
        console.error("Register error:", err);
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
          <button type="submit">Register</button>
        </form>
      : null}
    </div>
  );
}


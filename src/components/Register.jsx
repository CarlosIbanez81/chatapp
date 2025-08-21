import React, { useState, useRef } from "react";
import { showToast /*, showConfirm */ } from "./feedback";

export default function Register({ onBack }) {
  const [form, setForm] = useState({
    username: "",
    password: "",
    email: "",
    avatar: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const fetchControllerRef = useRef(null);
  const successNavTimeoutRef = useRef(null);

  // Robust navigation to login
  function goLogin() {
    // Cancel any pending success redirect timeout
    if (successNavTimeoutRef.current) {
      clearTimeout(successNavTimeoutRef.current);
      successNavTimeoutRef.current = null;
    }
    // Abort in-flight registration fetch
    if (fetchControllerRef.current) {
      try { fetchControllerRef.current.abort(); } catch {}
      fetchControllerRef.current = null;
    }
    // Ensure form can be used again if user returns later
    setSubmitting(false);
    if (typeof onBack === "function") {
      try { onBack(); return; } catch {}
    }
    const target = "/login";
    // SPA-style attempt
    window.history.pushState({}, "", target);
    window.dispatchEvent(new Event("locationchange"));
    window.dispatchEvent(new PopStateEvent("popstate"));
    // If the app does not react, hard redirect as fallback
    setTimeout(() => {
      if (window.location.pathname !== target) {
        window.location.assign(target);
      }
    }, 60);
  }

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return; // prevent double submission
    setSubmitting(true);
    // Prepare abort controller for this request
    fetchControllerRef.current = new AbortController();

    const avatarCode = Number(form.avatar);
    if (!Number.isInteger(avatarCode) || avatarCode < 0 || avatarCode > 70) {
      showToast("Avatar måste vara ett heltal mellan 0 och 70.", "warning");
      setSubmitting(false);
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
      }),
      signal: fetchControllerRef.current.signal
    })
      .then(async (res) => {
        const data = await res.json().catch(() => null);
        if (res.ok) {
          showToast(data?.message || "Registration successful", "success");
          // Allow toast to be seen briefly, then navigate
          successNavTimeoutRef.current = setTimeout(() => {
            successNavTimeoutRef.current = null;
            goLogin();
          }, 900);
        } else {
          showToast(data?.message || "Register failed", "error");
        }
      })
      .catch((err) => {
        console.error("Register error:", err);
        if (err?.name === "AbortError") {
          // Navigation / user cancelled: suppress error toast
          return;
        }
        showToast("Register failed", "error");
      })
      .finally(() => {
        // Clear controller after completion (unless already aborted via goLogin)
        fetchControllerRef.current = null;
        setSubmitting(false);
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
        <button type="submit" disabled={submitting}>
          {submitting ? "Registering..." : "Register"}
        </button>
      </form>
      <br />
      {/* Back button uses robust handler */}
      <button onClick={goLogin}>Back to Login</button>
    </div>
  );
}

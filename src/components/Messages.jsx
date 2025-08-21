import React, { useEffect, useState } from "react";
import { getMessages, createMessage } from "../services/api";
import SideNav from "./SideNav";
import TokenInfo from "./TokenInfo";
import "./Messages.css";
import decodeJwt from "../utils/jwtdecoder";

export default function Messages({ token: propToken }) {
  // State att spara meddelande och nytt meddelande 
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");

  // --- mock chat kept locally ---
  const [fakeChat, setFakeChat] = useState([
    { id: "f1", text: "Tja tja, hur mår du?", username: "Johnny", avatar: "https://i.pravatar.cc/100?img=14", createdAt: new Date().toISOString() },
    { id: "f2", text: "Hallå!! Svara då!!", username: "Johnny", avatar: "https://i.pravatar.cc/100?img=14", createdAt: new Date().toISOString() },
    { id: "f3", text: "Sover du eller?! 😴", username: "Johnny", avatar: "https://i.pravatar.cc/100?img=14", createdAt: new Date().toISOString() },
  ]);
  // --- end mock chat ---

  // Enkel inline-avkodning — ingen useEffect eller extra state behövs
  const t = propToken || localStorage.getItem("jwtToken") || sessionStorage.getItem("jwtToken");
  const payload = t ? decodeJwt(t) : null;
  const username = payload ? (payload.username || payload.user || payload.email || String(payload.id || "")) : null;
  const avatar = payload ? (payload.avatar || payload.avatarUrl || "") : "";

  useEffect(() => {
    // hämtar JWT Token och consolloggar
    // use prop token first, fallback to localStorage
    var token = propToken || localStorage.getItem("jwtToken");
    console.log("Messages component mounted. token =", token);

    // OM ingen token
    if (!token) {
      console.log("No token found, not fetching messages.");
      setMessages([]);
      return;
    }

    // Hämta meddelanden
    getMessages(token)
      .then(function (data) {
        console.log("getMessages returned:", data);

        // OM data i array
        if (Array.isArray(data)) {
          setMessages(data);
          return;
        }

        setMessages([]);
      })
      .catch(function (err) {
        console.error("Fel med att hämta meddelanden.", err);

        // HÅller koll på error.status
        var status = null;
        if (err && err.response && err.response.status) {
          status = err.response.status;
        } else if (err && err.status) {
          status = err.status;
        }

        setMessages([]);
      });
  }, [propToken]);

  // Funktion som ska hantera att skicka ett nytt meddelande
  function handleSend() {
    // rekommendation att inte göra något ifall tomt eller om bara mellanrum matats in
    if (!newMsg || newMsg.trim() === "") {
      return;
    }

    // token från localStorage och meddelande om ingen token
    const token = propToken || localStorage.getItem("jwtToken");
    if (!token) {
      alert("Ingen autentisering. Vänligen logga in.");
      return;
    }

    // vill bara se i loggen om token och meddelande finns
    console.log("Sending message:", { content: newMsg, tokenPresent: !!token });

    // Skapa meddelande
    createMessage(newMsg, token)
      .then(function (msg) {
        setMessages(function (prev) {
          var base = Array.isArray(prev) ? prev : [];
          return base.concat(msg);
        });
        setNewMsg("");
      })
      // Hantera och visa felmeddelande 
      .catch(function (err) {
        console.error("Error sending message:", err);
        var messageToShow = "Misslyckades med att skicka meddelande";
        if (err && err.message) {
          messageToShow = err.message;
        }
        alert(messageToShow);
      });
  }

  // Minimal logout: ska ta bort token och ladda om sidan för att visa inloggningssidan
  function handleLogout() {
    localStorage.removeItem("jwtToken");
    window.location.reload();
  }

  function formatTime(ts) {
    try {
      var d = ts ? new Date(ts) : new Date();
      return d.toLocaleString();
    } catch (e) {
      return "";
    }
  }

  // --- delete by message id using API endpoint (Railway) ---
  async function handleDelete(id) {
    if (!id) {
      alert("Message has no id and cannot be deleted.");
      return;
    }
    if (!window.confirm("Delete this message?")) return;

    const token = propToken || localStorage.getItem("jwtToken");
    if (!token) {
      alert("No token available. Please login.");
      return;
    }

    try {
      const res = await fetch(`https://chatify-api.up.railway.app/messages/${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Server returned ${res.status}`);
      }

      // remove from UI state
      setMessages((prev) => {
        if (!Array.isArray(prev)) return prev;
        return prev.filter((m) => !(m && (String(m.id) === String(id))));
      });

      // optional success feedback
      // alert("Message deleted");
    } catch (err) {
      console.error("Failed to delete message:", err);
      alert("Failed to delete message. See console for details.");
    }
  }
  // --- end delete helper ---

  // --- delete helper for fake chat (local only) ---
  function handleDeleteFake(id) {
    if (!id) return;
    const item = fakeChat.find((m) => m.id === id);
    const name = item && item.username ? item.username : "Unknown";
    if (!window.confirm(`Delete ${name}'s message?`)) return;
    setFakeChat((prev) => (Array.isArray(prev) ? prev.filter((m) => String(m.id) !== String(id)) : prev));
  }
  // --- end delete helper ---

  // Rendera meddelanden och input för nytt meddelande
  return (
    <div>
      <div style={{ margin: "8px 0" }}>
        <TokenInfo />
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h2>
          Messages from {`${username}`} - {"\u00A0\u00A0\u00A0\u00A0"}
          {avatar ? <img src={`https://i.pravatar.cc/90?img=${avatar}`} /> : "No avatar"}
        </h2>

        <SideNav onLogout={handleLogout} />
      </div>

      {/* messages left, mock chat on the right */}
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        {/* mock messages — same markup/styles as real messages */}
        <aside style={{ width: 320 }}>
          <div style={{ marginBottom: 8, fontWeight: 700 }}>Mock conversations</div>
          <div className="messages">
            {fakeChat.map(function (c) {
              return (
                <div className={"message"} key={c.id}>
                  <div className="meta">
                    <span className="user">{c.username}</span>
                    <span className="time">{formatTime(c.createdAt)}</span>

                    {/* local delete for mock */}
                    <button
                      type="button"
                      className="delete-btn"
                      onClick={function () { handleDeleteFake(c.id); }}
                      aria-label="Delete fake message"
                    >
                      Delete
                    </button>
                  </div>
                  <div className="body">{c.text}</div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* real messages */}
        <div style={{ flex: 1 }}>
          <div className="messages">
            {messages.map(function (m, i) {
              var key = (m && (m.id || m._id)) ? (m.id || m._id) : i;
              var text = (m && (m.content || m.text || m.message)) ? (m.content || m.text || m.message) : JSON.stringify(m);

              // determine sender name/alias — prefer explicit name fields, then userId as alias,
              // finally fall back to the logged-in username (from token)
              var user =
                (m && typeof m.user === "string" && m.user) ||
                (m && m.user && (m.user.name || m.user.username)) ||
                (m && m.username) ||
                (m && m.from) ||
                (m && m.userId ? `${username}` : null) ||
                username ||
                "Anonymous";

              var time = (m && (m.createdAt || m.created_at || m.ts)) ? formatTime(m.createdAt || m.created_at || m.ts) : "";
              var own = (m && m.fromMe) ? "own" : "";

              return (
                <div className={"message " + own} key={key}>
                  <div className="meta">
                    <span className="user">{user}</span>
                    <span className="time">{time}</span>

                    {/* Delete button — calls Railway API and removes by id */}
                    <button
                      type="button"
                      className="delete-btn"
                      onClick={function () { handleDelete(m && (m.id || m._id) ? (m.id || m._id) : null); }}
                      aria-label="Delete message"
                      disabled={!(m && (m.id || m._id))}
                    >
                      Delete
                    </button>
                  </div>
                  <div className="body">{text}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="message-input">
        <input
          type="text"
          value={newMsg}
          placeholder="Type a message"
          onChange={function (e) {
            setNewMsg(e.target.value);
          }}
        />
        <button onClick={handleSend} disabled={!newMsg.trim()}>Send</button>
      </div>
    </div>
  );
}

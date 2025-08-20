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

  // --- add mock chat state (kept as useState) ---
  const [fakeChat, setFakeChat] = useState([
    {
      id: "f1",
      text: "Tja tja, hur mår du?",
      avatar: "https://i.pravatar.cc/100?img=14",
      username: "Johnny",
      conversationId: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: "f2",
      text: "Hallå!! Svara då!!",
      avatar: "https://i.pravatar.cc/100?img=14",
      username: "Johnny",
      conversationId: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: "f3",
      text: "Sover du eller?! 😴",
      avatar: "https://i.pravatar.cc/100?img=14",
      username: "Johnny",
      conversationId: null,
      createdAt: new Date().toISOString(),
    },

    {
      id: "f4",
      text: "Du måste vara däckad!!",
      avatar: "https://i.pravatar.cc/100?img=14",
      username: "Johnny",
      conversationId: null,
      createdAt: new Date().toISOString(),
    },
  ]);
  // --- end mock chat state ---

  // Enkel inline-avkodning — ingen useEffect eller extra state behövs
  // explicit token resolution (no `||`)
  let t = propToken;
  if (!t) {
    t = localStorage.getItem("jwtToken");
  }
  if (!t) {
    t = sessionStorage.getItem("jwtToken");
  }
  const payload = t ? decodeJwt(t) : null;

  // explicit username extraction (no `||`)
  let username = null;
  if (payload) {
    if (payload.username) username = payload.username;
    else if (payload.user) username = payload.user;
  }

  const avatar = payload ? payload.avatar : "";

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

        // kollar om data är arrays
        if (data && Array.isArray(data.messages)) {
          setMessages(data.messages);
          return;
        }

        // Check if data.data is an array
        if (data && Array.isArray(data.data)) {
          setMessages(data.data);
          return;
        }

        // Fallback for unknown response shape
        console.log("Okänd svarstruktur, nollställer");
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

  // --- delete helper (re-add) ---
  async function handleDelete(id) {
    if (!id) {
      alert("Message has no id and cannot be deleted.");
      return;
    }
    if (!window.confirm("Delete this message?")) return;

    const token = propToken || localStorage.getItem("jwtToken");
    if (!token) {
      alert("Not authenticated");
      return;
    }

    try {
      const res = await fetch(`https://chatify-api.up.railway.app/messages/${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token },
      });
      if (!res.ok) throw new Error("Delete failed");
      setMessages((prev) => (Array.isArray(prev) ? prev.filter((m) => String(m.id) !== String(id)) : prev));
    } catch (err) {
      console.error(err);
      alert("Failed to delete message");
    }
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
              {avatar ? <img src={`https://i.pravatar.cc/90?img=${avatar}`}  /> : "No avatar"}
          </h2>

       <SideNav onLogout={handleLogout} />
      </div>

      {/* show fake chat on the left, then user's messages on the right */}
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        <aside style={{ width: 260, background: "#fafafa", border: "1px solid #eee", padding: 10, borderRadius: 6 }}>
          <strong style={{ display: "block", marginBottom: 8 }}>Conversations</strong>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
            {fakeChat.map(function (c) {
              return (
                <li key={c.id} style={{ padding: 0 }}>
                  {/* same markup/styles as real messages so mock looks identical */}
                  <div className="message" style={{ maxWidth: "100%", alignSelf: "flex-start", marginRight: 0 }}>
                    <div className="meta" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <img src={c.avatar} alt={c.username} style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }} />
                        <span className="user" style={{ fontWeight: 600 }}>{c.username}</span>
                      </div>
                      <span className="time">{formatTime(c.createdAt)}</span>
                    </div>
                    <div className="body">{c.text}</div>
                  </div>
                </li>
              );
            })}
          </ul>
        </aside>

        <div style={{ flex: 1 }}>
          <div className="messages">
            {messages.map(function (m, i) {
              var key = m.id ? m.id : i;
              var text = m.text;
              var user = username;
              var time = m.createdAt ? formatTime(m.createdAt) : "";
              var className = "message" + (m.fromMe ? " own" : "");

              return (
                <div className={className} key={key}>
                  <div className="meta">
                    <span className="user">{user}</span>
                    <span className="time">{time}</span>

                    <button
                      type="button"
                      className="delete-btn"
                      onClick={() => handleDelete(m.id)}
                      disabled={!m.id}
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

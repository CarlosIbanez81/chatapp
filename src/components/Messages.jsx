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

  // mockade chattet
  const [fakeChat, setFakeChat] = useState([
    { id: "f1", text: "Tja tja, hur mår du?", username: "Johnny", avatar: "https://i.pravatar.cc/100?img=14", createdAt: new Date().toISOString() },
    { id: "f2", text: "Hallå!! Svara då!!", username: "Johnny", avatar: "https://i.pravatar.cc/100?img=14", createdAt: new Date().toISOString() },
    { id: "f3", text: "Sover du eller?! 😴", username: "Johnny", avatar: "https://i.pravatar.cc/100?img=14", createdAt: new Date().toISOString() },
  ]);


  // enklare token-resolving (ingen nullish coalescing)
  const t = propToken || localStorage.getItem("jwtToken");
  const payload = t ? decodeJwt(t) : null;
  const username = payload ? payload.user : "Unknown";
  const avatar = payload ? payload.avatar : "";

  useEffect(() => {
    // kolla prop token först, fallback till localStorage.
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
      // Om inte
          .catch(function (err) {
        console.error("Fel med att hämta meddelanden.", err);
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
    console.log("Skickar meddelande:", { content: newMsg, tokenPresent: !!token });

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

  // Minimal logout: ska ta bort token och ladda om sidan för att visa inloggningssidan. 
  function handleLogout() {
    localStorage.removeItem("jwtToken");
    //window.location.reload();  - funkade också
    //navigate("/login"); - funkade också
    window.location.href = "/login";
  }

  function formatTime(ts) {
    try {
      var d = ts ? new Date(ts) : new Date();
      return d.toLocaleString();
    } catch (e) {
      return "";
    }
  }

  // radera meddelande genom att använda API-anrop
  async function handleDelete(id) {
    if (!id) {
      alert("Meddelande kunde inte tas bort.");
      return;
    }

    if (!window.confirm("Radera detta meddelande?")) return;
    const token = propToken || localStorage.getItem("jwtToken");

    if (!token) {
      alert("Ingen token tillgänglig. Vänligen logga in.");
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

      // radera meddelande från UI
      setMessages((prev) => {
        //Anropar React state-settern för att returnera ny state
        if (!Array.isArray(prev)) return prev;
        //om inte en array , lämna state oförändrad -  undvika fel.
        return prev.filter((m) => !(m && (String(m.id) === String(id))));
        //returnerar en ny array som innehåller alla nya element 
      });

      // en catch rekommenderas alltid, fast jag ser inte riktigt nyttan här
    } catch (err) {
      console.error("Failed to delete message:", err);
      alert("Meddelandet gick inte att radera. Se konsolen.");
    }
  }
  

  // --- radera meddelande (lokalt) ---
  function handleDeleteFake(id) {
    if (!id) return;
    const name = fakeChat.find((m) => m.id === id)?.username ?? "Unknown";
    if (!window.confirm(`Radera ${name}'s meddelande?`)) return;
    setFakeChat((prev) => (Array.isArray(prev) ? prev.filter((m) => String(m.id) !== String(id)) : prev));
  }
  

  // Rendera meddelanden och input för nytt meddelande
  return (
    <div>
      <div style={{ margin: "8px 0" }}>
        <TokenInfo />
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h2>
          Meddelanden från {`${username}`} (till höger) - {"\u00A0\u00A0\u00A0\u00A0"}
          {avatar ? <img src={`https://i.pravatar.cc/90?img=${avatar}`} alt="avatar" /> : "No avatar"}
        </h2>

        <SideNav onLogout={handleLogout} />
      </div>

      {/* mockchat till höger*/}
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        {/* mock ska ha samma style som users */}
        <aside style={{ width: 320 }}>
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

        {/* user meddelanden */}
        <div style={{ flex: 1 }}>
          <div className="messages">
            {messages.map(function (m, i) {
              // förenklade fallbacks (ingen ??)
              var key = (m && (m.id || m._id)) ? (m.id || m._id) : i;
              var text = (m && (m.text || m.content)) ? (m.text || m.content) : "";

              // användarnamn (enkelt fallback utan optional chaining)
              var user = "Anonymous";
              if (m) {
                if (typeof m.user === "string") user = m.user;
                else if (m.user && (m.user.name || m.user.username)) user = m.user.name || m.user.username;
                else if (m.username) user = m.username;
                else if (m.from) user = m.from;
                else user = username || "Anonymous";
              }

              var time = m && (m.createdAt || m.created_at || m.ts) ? formatTime(m.createdAt || m.created_at || m.ts) : "";
              var own = m && m.fromMe ? "own" : "";

              return (
                <div className={"message " + own} key={key}>
                  <div className="meta">
                    <span className="user">{user}</span>
                    <span className="time">{time}</span>

                    {/* Delete knapp som tar bort meddelandet lokalt */}
                    <button
                      type="button"
                      className="delete-btn"
                      onClick={function () { handleDelete(m && (m.id || m._id) ? (m.id || m._id) : null); }}
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

import React, { useEffect, useState } from "react";
import { getMessages, createMessage } from "../services/api";
import SideNav from "./SideNav";
import TokenInfo from "./TokenInfo";

export default function Messages({ token: propToken }) {
  // State att spara meddelande och nytt meddelande 
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");

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

  // Rendera meddelanden och input för nytt meddelande
  return (
       <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h2>Messages</h2>
        
        <SideNav />
      </div>
      <TokenInfo />
      <ul>
          {messages.map(function (m, i) {
       
          var key = (m && m.id) ? m.id : i;
          var content = (m && m.content) ? m.content : JSON.stringify(m);
          return <li key={key}>{content}</li>;
        })}
      </ul>
      <input
        type="text"
        value={newMsg}
        placeholder="Type a message"
        onChange={function (e) {
          setNewMsg(e.target.value);
        }}
      />
      <button onClick={handleSend}>Send</button>
    </div>
  );
}

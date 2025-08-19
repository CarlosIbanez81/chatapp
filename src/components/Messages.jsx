import React, { useEffect, useState } from "react";
import { getMessages, createMessage } from "../services/api";

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
        console.log("Unknown response shape, setting empty messages.");
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
    // rekommendation att inte göra något ifall tomt
    if (!newMsg || newMsg.trim() === "") {
      return;
    }

    // token från localStorage och meddelande om ingen token
     const token = propToken || localStorage.getItem("jwtToken");
    if (!token) {
      alert("Not authenticated. Please log in.");
      return;
    }

    // debug: confirm token presence and payload
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
      // Hantera fel
      .catch(function (err) {
        console.error("Error sending message:", err);
        var messageToShow = "Failed to send message";
        if (err && err.message) {
          messageToShow = err.message;
        }
        alert(messageToShow);
      });
  }
  // Rendera meddelanden och input för nytt meddelande
  return (
    <div>
      <h2>Messages</h2>
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

import React, { useEffect, useState } from "react";
import { getMessages, createMessage } from "../services/api";

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");

  useEffect(function() {
    getMessages()
      .then(function(data) {
        setMessages(data);
      })
      .catch(function(err) {
        console.log("Error fetching messages:", err);
      });
  }, []);

  function handleSend() {
    if (newMsg.trim() === "") return;

    createMessage(newMsg)
      .then(function(msg) {
        setMessages(messages.concat(msg));
        setNewMsg("");
      })
      .catch(function(err) {
        console.log("Error sending message:", err);
        alert(err.message);
      });
  }

  return (
    <div>
      <h2>Messages</h2>
      <ul>
        {messages.map(function(m, i) {
          return <li key={i}>{m.content}</li>;
        })}
      </ul>
      <input
        type="text"
        value={newMsg}
        placeholder="Type a message"
        onChange={function(e) { setNewMsg(e.target.value); }}
      />
      <button onClick={handleSend}>Send</button>
    </div>
  );
}

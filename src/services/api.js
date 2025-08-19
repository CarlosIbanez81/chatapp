const BASE_URL = "https://chatify-api.up.railway.app";

// Hämta alla meddelanden
export async function getMessages(token) {
  const res = await fetch("https://chatify-api.up.railway.app/messages", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });

  let body = null;
  try { body = await res.json(); } catch (e) { /* no json body */ }

  if (!res.ok) {
    const err = new Error(body?.message || `Request failed with status ${res.status}`);
    err.status = res.status;
    err.body = body;
    throw err;
  }

  return body;
}

// Skapa nytt meddelande
export async function createMessage(content, token) {
  if (!token) {
    const err = new Error("No token, access denied");
    err.status = 401;
    throw err;
  }

  // send 'text' as the API appears to expect
  const payload = { text: content };
  console.log("createMessage: sending payload =", payload, "tokenPresent =", !!token);

  const res = await fetch(`${BASE_URL}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  const text = await res.text().catch(() => null);
  let body = null;
  try { body = text ? JSON.parse(text) : null; } catch (e) { body = text; }

  console.log("createMessage: response status =", res.status, "body =", body);

  if (!res.ok) {
    const serverMsg =
      body && typeof body === "object" && body.message
        ? body.message
        : typeof body === "string" && body
        ? body
        : null;
    const err = new Error(serverMsg || `Request failed with status ${res.status}`);
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return (body && body.latestMessage) ? body.latestMessage : body;
}
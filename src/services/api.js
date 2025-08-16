const BASE_URL = "https://chatify-api.up.railway.app";

// Fetch all messages
export async function getMessages() {
  const res = await fetch(`${BASE_URL}/messages`, { credentials: "include" });
  return res.json();
}

// Create a new message
export async function createMessage(content) {
  const res = await fetch(`${BASE_URL}/messages`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ content })
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to create message");
  }

  return res.json();
}

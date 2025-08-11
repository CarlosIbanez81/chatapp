const BASE_URL = "https://chatify-api.up.railway.app";

// Alla meddelanden
export async function getMessages() {
  const res = await fetch(`${BASE_URL}/messages`, { credentials: "include" });
  return res.json();
}



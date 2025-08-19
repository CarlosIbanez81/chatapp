// Enkel och lättförståelig API-hjälpare för nybörjare

const BASE_URL = "https://chatify-api.up.railway.app";

// Hämta alla meddelanden
export async function getMessages(token) {
  // Bygg headers
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers.Authorization = "Bearer " + token;
  }

  // Skicka request
  const res = await fetch(`${BASE_URL}/messages`, {
    method: "GET",
    headers: headers
  });

  // Försök läsa JSON-svar, annars null
  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    data = null;
  }

  // Om status inte är OK, skapa ett enkelt felmeddelande
  if (!res.ok) {
    const msg = (data && data.message) ? data.message : `Request failed with status ${res.status}`;
    throw new Error(msg);
  }

  // Returnera det parsade svaret
  return data;
}

// Skapa ett nytt meddelande
export async function createMessage(content, token) {
  if (!token) {
    throw new Error("No token, access denied");
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: "Bearer " + token
  };

  // API verkar förvänta sig fältet 'text'
  const payload = { text: content };

  const res = await fetch(`${BASE_URL}/messages`, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(payload)
  });

  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    data = null;
  }

  if (!res.ok) {
    const msg = (data && data.message) ? data.message : `Request failed with status ${res.status}`;
    throw new Error(msg);
  }

  // Om API returnerar latestMessage, returnera det objektet; annars returnera hela svaret
  return (data && data.latestMessage) ? data.latestMessage : data;
}
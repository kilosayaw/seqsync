// client/src/services/notationService.js
const API_BASE_URL = 'http://localhost:3001/api';

export const fetchNotationsAPI = async () => {
  const res = await fetch(`${API_BASE_URL}/notations`);
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return res.json();
};

export const submitNotationAPI = async (notationPayload) => {
  const response = await fetch(`${API_BASE_URL}/notations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(notationPayload),
  });
  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};
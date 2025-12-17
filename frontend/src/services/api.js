// API configuration for production
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const testBackend = async () => {
  try {
    const response = await fetch(`${API_URL}/api/test`);
    return await response.json();
  } catch (error) {
    console.error('Backend connection failed:', error);
    return { success: false, message: 'Cannot connect to backend' };
  }
};

export const registerUser = async (userData) => {
  const response = await fetch(`${API_URL}/api/users/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  return await response.json();
};
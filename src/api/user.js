import axios from 'axios';

const API_URL = 'http://localhost:3000/api/v1/users';

export const loginUser = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Login failed. Please try again.';
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/`, userData);
    return response.data; 
  } catch (error) {
    throw error.response?.data?.message || 'Registration failed. Please try again.';
  }
};


export const fetchUserData = async (userId, token) => {
    try {
      const response = await axios.get(`${API_URL}/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Error fetching user data';
    }
};

export const depositCryptoApi = async (userAddress, selectedCrypto, amount, txHash, selectedChain) => {
  try {
    const response = await fetch(`${API_BASE_URL}/deposit-crypto`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userAddress, crypto: selectedCrypto, amount, txHash, chain: selectedChain }),
    });

    const data = await response.json();
    return data.status === "success" ? { success: true } : { success: false, message: data.message };
  } catch (error) {
    console.error("Error in depositCryptoAPI:", error);
    return { success: false, message: "Transaction failed. Please try again." };
  }
};
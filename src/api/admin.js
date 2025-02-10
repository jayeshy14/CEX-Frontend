import axios from 'axios';

const API_URL = 'http://localhost:3000/api/v1/admin';

export const addCrypto = async (newCrypto, token) => {
  try {
    const response = await axios.post(`${API_URL}/add-crypto`, newCrypto, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Error adding cryptocurrency';
  }
};

export const removeCrypto = async (symbol, token) => {
  try {
    const response = await axios.delete(`${API_URL}/remove-crypto/${symbol}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Error removing cryptocurrency';
  }
};
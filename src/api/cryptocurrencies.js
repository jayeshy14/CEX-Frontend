import axios from 'axios';

const API_URL = 'http://localhost:3000/api/v1/cryptocurrencies';

export const fetchCryptocurrencies = async () => {
  try {
    const response = await axios.get(`${API_URL}/`);
    return response.data; 
  } catch (error) {
    throw error.response?.data?.message || 'Error fetching cryptocurrencies';
  }
};

export const fetchCryptocurrency = async (selectedCrypto) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${selectedCrypto}`);
    const data = await response.json();

    if (!data || !data.chains) {
      throw new Error("Invalid cryptocurrency selected.");
    }

    return data;
  } catch (error) {
    console.error("Error fetching cryptocurrency details:", error);
    return null;
  }
};
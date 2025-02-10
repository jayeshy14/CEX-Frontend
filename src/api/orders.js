import axios from "axios";

const API_URL = "http://localhost:3000/api/v1/orders";

export const fetchOrderBook = async (cryptoA, cryptoB) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${cryptoA}/${cryptoB}`);
    return response.data.data.orderBook;
  } catch (error) {
    throw error.response?.data?.message || "Error fetching order book";
  }
};

export const placeOrder = async ({ orderType, orderMode, userId, cryptoA, cryptoB, amount, price }) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/place`, {
      type: orderType,
      order_type: orderMode,
      user_id: userId,
      cryptocurrency_id_A: cryptoA,
      cryptocurrency_id_B: cryptoB,
      amount: parseFloat(amount),
      price: orderMode === "limit" ? parseFloat(price) : null,
    });

    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Error placing order";
  }
};

export const cancelOrder = async (orderId) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/cancel`, { orderId });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Error canceling order";
  }
};
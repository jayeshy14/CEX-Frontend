import axiosInstance from './axios';
import type { AxiosError } from 'axios';

interface PlaceOrderArgs {
  orderType: 'buy' | 'sell';
  orderMode: 'limit' | 'market';
  cryptoA: string;
  cryptoB: string;
  amount: string | number;
  price: string | number;
}

const extractMessage = (error: unknown, fallback: string): string => {
  const err = error as AxiosError<{ message?: string }>;
  return err?.response?.data?.message ?? fallback;
};

export const fetchOrderBook = async (cryptoA: string, cryptoB: string): Promise<unknown> => {
  try {
    const response = await axiosInstance.get<{ data: { orderBook: unknown } }>(
      `/orders/${cryptoA}/${cryptoB}`
    );
    return response.data.data.orderBook;
  } catch (error) {
    throw extractMessage(error, 'Error fetching order book');
  }
};

export const placeOrder = async ({
  orderType,
  orderMode,
  cryptoA,
  cryptoB,
  amount,
  price,
}: PlaceOrderArgs): Promise<unknown> => {
  try {
    const response = await axiosInstance.post('/orders/place', {
      type: orderType,
      order_type: orderMode,
      cryptocurrency_id_A: cryptoA,
      cryptocurrency_id_B: cryptoB,
      amount: parseFloat(String(amount)),
      price: orderMode === 'limit' ? parseFloat(String(price)) : null,
    });
    return response.data;
  } catch (error) {
    throw extractMessage(error, 'Error placing order');
  }
};

export const cancelOrder = async (orderId: string): Promise<unknown> => {
  try {
    const response = await axiosInstance.post('/orders/cancel', { orderId });
    return response.data;
  } catch (error) {
    throw extractMessage(error, 'Error canceling order');
  }
};

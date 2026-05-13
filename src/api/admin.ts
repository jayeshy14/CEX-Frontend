import axiosInstance from './axios';
import type { AxiosError } from 'axios';

interface NewCrypto {
  name: string;
  symbol: string;
  address: string;
  liquidity: string;
}

const extractMessage = (error: unknown, fallback: string): string => {
  const err = error as AxiosError<{ message?: string }>;
  return err?.response?.data?.message ?? fallback;
};

export const addCrypto = async (newCrypto: NewCrypto, _token?: string): Promise<unknown> => {
  try {
    const response = await axiosInstance.post('/admin/add-crypto', newCrypto);
    return response.data;
  } catch (error) {
    throw extractMessage(error, 'Error adding cryptocurrency');
  }
};

export const removeCrypto = async (symbol: string, _token?: string): Promise<unknown> => {
  try {
    const response = await axiosInstance.delete(`/admin/remove-crypto/${symbol}`);
    return response.data;
  } catch (error) {
    throw extractMessage(error, 'Error removing cryptocurrency');
  }
};

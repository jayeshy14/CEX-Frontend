import axiosInstance from './axios';
import type { AxiosError } from 'axios';
import type { CryptoData } from '../types/api';

const extractMessage = (error: unknown, fallback: string): string => {
  const err = error as AxiosError<{ message?: string }>;
  return err?.response?.data?.message ?? fallback;
};

export const fetchCryptocurrencies = async (): Promise<unknown> => {
  try {
    const response = await axiosInstance.get('/cryptocurrencies/');
    return response.data;
  } catch (error) {
    throw extractMessage(error, 'Error fetching cryptocurrencies');
  }
};

export const fetchCryptocurrency = async (
  selectedCrypto: string
): Promise<CryptoData | null> => {
  try {
    const response = await axiosInstance.get<CryptoData>(`/cryptocurrencies/${selectedCrypto}`);
    const data = response.data;

    if (!data || !data.chains) {
      throw new Error('Invalid cryptocurrency selected.');
    }

    return data;
  } catch (error) {
    console.error('Error fetching cryptocurrency details:', error);
    return null;
  }
};

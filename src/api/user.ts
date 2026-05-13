import axiosInstance from './axios';
import type { AxiosError } from 'axios';

interface LoginResponse {
  token: string;
  userId: string;
  role?: string;
  status?: string;
  message?: string;
}

interface RegisterPayload {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface DepositResult {
  success: boolean;
  message?: string;
}

const extractMessage = (error: unknown, fallback: string): string => {
  const err = error as AxiosError<{ message?: string }>;
  return err?.response?.data?.message ?? fallback;
};

export const loginUser = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await axiosInstance.post<LoginResponse>('/users/login', { email, password });
    return response.data;
  } catch (error) {
    throw extractMessage(error, 'Login failed. Please try again.');
  }
};

export const registerUser = async (userData: RegisterPayload): Promise<unknown> => {
  try {
    const response = await axiosInstance.post('/users/', userData);
    return response.data;
  } catch (error) {
    throw extractMessage(error, 'Registration failed. Please try again.');
  }
};

export const fetchUserData = async (userId: string, _token?: string): Promise<unknown> => {
  try {
    const response = await axiosInstance.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    throw extractMessage(error, 'Error fetching user data');
  }
};

export const fetchMyWallet = async (): Promise<unknown> => {
  try {
    const response = await axiosInstance.get('/wallets/me');
    return response.data;
  } catch (error) {
    throw extractMessage(error, 'Error fetching wallet');
  }
};

export const fetchMyOrders = async (): Promise<unknown> => {
  try {
    const response = await axiosInstance.get('/orders/my');
    return response.data;
  } catch (error) {
    throw extractMessage(error, 'Error fetching orders');
  }
};

export const depositCryptoApi = async (
  userAddress: string | undefined,
  selectedCrypto: string,
  amount: string,
  txHash: string,
  selectedChain: string
): Promise<DepositResult> => {
  try {
    const response = await axiosInstance.post<{ status: string; message?: string }>(
      '/users/deposit-crypto',
      {
        userAddress,
        crypto: selectedCrypto,
        amount,
        txHash,
        chain: selectedChain,
      }
    );
    const data = response.data;
    return data.status === 'success'
      ? { success: true }
      : { success: false, message: data.message };
  } catch (error) {
    console.error('Error in depositCryptoAPI:', error);
    return { success: false, message: 'Transaction failed. Please try again.' };
  }
};

export interface ApiResponse<T> {
  status: 'success' | 'fail' | 'error';
  data?: T;
  message?: string;
}

export interface UserData {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
}

export interface WalletData {
  _id: string;
  user_id: string;
  usd_balance: number;
  balances: Record<string, number>;
  chains: Array<{ chain: string; address: string }>;
}

export interface OrderData {
  _id: string;
  type: 'buy' | 'sell';
  order_type: 'limit' | 'market';
  amount: number;
  price: number | null;
  status: 'open' | 'filled' | 'canceled';
  cryptocurrency_id_A: string;
  cryptocurrency_id_B: string;
  created_at: string;
}

export interface CryptoData {
  _id: string;
  name: string;
  symbol: string;
  current_price: number;
  total_supply: number;
  decimals: number;
  chains: Array<{
    chain_name: string;
    wallet_address: string;
    contract_address: string;
    supply: number;
  }>;
}

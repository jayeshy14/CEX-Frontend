import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const TradingChart = () => {
  const navigate = useNavigate();
  useEffect(() => { navigate('/token/ETH/USDT', { replace: true }); }, [navigate]);
  return null;
};

export default TradingChart;

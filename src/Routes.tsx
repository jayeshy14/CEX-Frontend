import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import HomePage from './pages/HomePage';
import CryptocurrenciesPage from './pages/CryptocurrenciesPage';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import UserDashboard from './pages/UserDashboard';
import AdminPanel from './pages/AdminPanel';
import DepositPage from './pages/DepositPage';
import WithdrawPage from './pages/WithdrawPage';
import TokenPage from './pages/TokenPage';
import TradingChart from './pages/TradingChart';

const AppRoutes = () => (
  <Routes>
    {/* Public pages with header + footer */}
    <Route path="/" element={<Layout><HomePage /></Layout>} />
    <Route path="/cryptocurrencies" element={<Layout><CryptocurrenciesPage /></Layout>} />
    <Route path="/deposit" element={<Layout><DepositPage /></Layout>} />
    <Route path="/withdraw" element={<Layout><WithdrawPage /></Layout>} />

    {/* Auth pages — full-screen, no chrome */}
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/reset-password/:token" element={<ResetPassword />} />

    {/* Trading page — header only, no footer (fills viewport) */}
    <Route path="/token/:symbolA/:symbolB" element={
      <div className="flex flex-col min-h-screen bg-bg">
        <Header />
        <TokenPage />
      </div>
    } />

    {/* Legacy chart route — redirects to ETH/USDT */}
    <Route path="/chart" element={<TradingChart />} />

    {/* Protected — own full-page layouts */}
    <Route path="/user-dashboard" element={<ProtectedRoute element={<UserDashboard />} />} />
    <Route path="/admin" element={<AdminRoute element={<AdminPanel />} />} />
  </Routes>
);

export default AppRoutes;

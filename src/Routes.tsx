import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import CryptocurrenciesPage from "./pages/CryptocurrenciesPage";
import UserDashboard from "./pages/UserDashboard";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import AdminPanel from "./pages/AdminPanel";
import Footer from "./components/Footer";
import Header from "./components/Header";
import ProtectedRoute from "./components/ProtectedRoute";
import DepositPage from "./pages/DepositPage";
import WithdrawPage from "./pages/WithdrawPage";
import TokenPage from "./pages/TokenPage";
import TradingChart from "./pages/TradingChart";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

const AppRoutes = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <>
            <Header />
            <HomePage />
            <Footer />
          </>
        }
      />
      <Route
        path="/cryptocurrencies"
        element={
          <>
            <Header />
            <CryptocurrenciesPage />
            <Footer />
          </>
        }
      />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected routes */}
      <Route
        path="/user-dashboard"
        element={<ProtectedRoute element={<UserDashboard />} />}
      />
      <Route path="/admin" element={<AdminPanel />} />
      <Route path="/deposit" element={<DepositPage />} />
      <Route path="/withdraw" element={<WithdrawPage />} />
      <Route path="/chart" element={<TradingChart />} />
      <Route path="/token" element={<TokenPage />} />

      {/* Forgot Password route */}
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
    </Routes>
  );
};

export default AppRoutes;

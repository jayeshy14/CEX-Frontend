import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import CryptocurrenciesPage from "./pages/CryptocurrenciesPage";
import UserDashboard from "./pages/UserDashboard";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import AdminPanel from "./pages/AdminPanel";
import Header from "./components/Header";
import ProtectedRoute from "./components/ProtectedRoute";
import Footer from "./components/Footer";
import DepositPage from "./pages/DepositPage";
import WithdrawPage from "./pages/WIthdrawPage";
import TokenPage from "./pages/TokenPage";
import SolanaContext from "./context/SolanaContext";
import TradingChart from "./pages/TradingChart";

const App = () => {
  return (
    <SolanaContext>
      <Router>
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
          <Route
            path="/login"
            element={
              <>
                <LoginPage />
              </>
            }
          />
          <Route
            path="/register"
            element={
              <>
                <RegisterPage />
              </>
            }
          />

          {/* Protected routes */}
          <Route
            path="/user-dashboard"
            element={
              <>
                <ProtectedRoute element={<UserDashboard />} />
              </>
            }
          />
          <Route
            path="/admin"
            element={
              <>
                {/* <ProtectedRoute element={<AdminPanel />} /> */}
                <AdminPanel/>
              </>
            }
          />
          <Route
            path="/deposit"
              element={<DepositPage />} 
          />
          <Route
            path="/withdraw"
            element={
              <WithdrawPage/>
            }
          />
          <Route
            path="/chart"
            element={
              <TradingChart/>
            }
          />
          <Route path="/token"
          element={<TokenPage/>}
          ></Route>
        </Routes>

      </Router>
    </SolanaContext>
  );
};

export default App;

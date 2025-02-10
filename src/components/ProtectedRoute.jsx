// src/components/ProtectedRoute.js
import React, { useContext } from "react";
import { Navigate } from "react-router-dom";  // Import Navigate instead of Redirect
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = ({ element, ...rest }) => {
  const { isAuthenticated } = useContext(AuthContext);

  return isAuthenticated ? element : <Navigate to="/login" />;  // Use Navigate instead of Redirect
};

export default ProtectedRoute;

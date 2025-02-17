import { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { AuthContext } from "../context/AuthContext";
import { loginUser, responseGoogle } from "../api/user";

const LoginPage = () => {
  const { isAuthenticated, login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/user-dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await loginUser(email, password);
      login(data.token, data.userId);
      navigate("/user-dashboard");
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="p-8 rounded-lg shadow-lg w-full max-w-md bg-gray-800">
        <h2 className="text-3xl text-yellow-400 font-bold mb-6 text-center">
          Login
        </h2>

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label
              className="block text-gray-300 text-sm font-medium mb-1"
              htmlFor="email"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:ring focus:ring-yellow-500 focus:outline-none"
              value={email}
              placeholder="example@ex.com"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label
              className="block text-gray-300 text-sm font-medium mb-1"
              htmlFor="password"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:ring focus:ring-yellow-500 focus:outline-none"
              value={password}
              placeholder="Enter password"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

          {/* Login Button */}
          <div className="text-center">
            <button
              type="submit"
              className="w-full text-white bg-gradient-to-br from-yellow-500 to-yellow-600 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-yellow-500 font-medium rounded-lg text-sm px-5 py-2.5 text-center mb-4"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>

          {/* Forgot Password Button */}
          <div className="text-center">
          <Link to="/forgot-password">
  <button
    className="w-full text-yellow-400 bg-transparent hover:text-white font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-all duration-300 mb-4"
  >
    Forgot Password?
  </button>
</Link>
          </div>
        </form>

        {/* OR Divider */}
        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-gray-600"></div>
          <span className="px-3 text-gray-400 text-sm">OR</span>
          <div className="flex-grow border-t border-gray-600"></div>
        </div>

        {/* Google Login */}
        <div className="flex justify-center">
          <GoogleOAuthProvider clientId="184896989056-m5v6e2tdli5efmsh8jgkhd17qjjfe6et.apps.googleusercontent.com">
            <GoogleLogin
              onSuccess={async (response) => {
                const result = await responseGoogle(response);
                if (result?.token) {
                  login(result.token, result.userId);
                  navigate("/user-dashboard");
                }
              }}
              onError={() => setError("Google login failed. Try again.")}
              theme="filled_blue"
              shape="pill"
            />
          </GoogleOAuthProvider>
        </div>

        {/* Register Link */}
        <div className="text-center mt-4">
          <p className="text-white">
            New user?{" "}
            <Link to="/register" className="text-yellow-400 ml-1">
              Register here!
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

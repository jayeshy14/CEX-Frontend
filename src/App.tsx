import { BrowserRouter as Router } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SolanaContext from "./context/SolanaContext";
import AppRoutes from "./Routes";

const App = () => {
  return (
    <SolanaContext>
      <Router>
        <AppRoutes />
        <ToastContainer position="bottom-right" autoClose={4000} theme="dark" />
      </Router>
    </SolanaContext>
  );
};

export default App;

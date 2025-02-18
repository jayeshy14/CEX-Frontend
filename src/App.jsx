// App.js
import { BrowserRouter as Router } from "react-router-dom";
import SolanaContext from "./context/SolanaContext";
import AppRoutes from "./Routes"; // Import the routes

const App = () => {
  return (
    <SolanaContext>
      <Router>
        <AppRoutes />  {/* Use the routes here */}
      </Router>
    </SolanaContext>
  );
};

export default App;

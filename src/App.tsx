import { BrowserRouter as Router } from "react-router-dom";
import SolanaContext from "./context/SolanaContext";
import AppRoutes from "./Routes";

const App = () => {
  return (
    <SolanaContext>
      <Router>
        <AppRoutes />
      </Router>
    </SolanaContext>
  );
};

export default App;

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MapPage from './pages/MapPage';
import { AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
function App() {
  const token = localStorage.getItem('token');

  return (
    <AnimatePresence mode="wait">
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={token ? <Navigate to="/dashboard" /> : <Login />}
          />
          <Route path="/map" element={<MapPage />} />
          <Route
            path="/dashboard"
            element={token ? <Dashboard /> : <Navigate to="/" />}
          />
        </Routes>
      </BrowserRouter>
    </AnimatePresence>
  );
}

export default App;

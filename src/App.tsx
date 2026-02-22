import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainApp from "./pages/MainApp";
import RootLayout from "./pages/RootLayout";
import NewDocument from "./pages/NewDocument";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<RootLayout />}>
                <Route index element={<MainApp />} />
                <Route path="new" element={<NewDocument />} />
              </Route>
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App

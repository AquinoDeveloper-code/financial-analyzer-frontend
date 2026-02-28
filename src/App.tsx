import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainApp from "./pages/MainApp";
import RootLayout from "./pages/RootLayout";
import NewDocument from "./pages/NewDocument";
import GoalsDashboard from "./pages/GoalsDashboard";
import GoalDetails from "./pages/GoalDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Community from "./pages/Community";
import MarketIntelligence from "./pages/MarketIntelligence";
import ForexIntelligence from "./pages/ForexIntelligence";
import AdminDashboard from "./pages/AdminDashboard";
import Reconciliation from "./pages/Reconciliation";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { ProcessingProvider } from "./context/ProcessingContext";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={
                 <ProcessingProvider>
                    <RootLayout />
                 </ProcessingProvider>
              }>
                <Route index element={<MainApp />} />
                <Route path="new" element={<NewDocument />} />
                <Route path="goals" element={<GoalsDashboard />} />
                <Route path="goals/:id" element={<GoalDetails />} />
                <Route path="profile" element={<Profile />} />
                <Route path="community" element={<Community />} />
                <Route path="market" element={<MarketIntelligence apiUrl="http://localhost:8000/api/v1" />} />
                <Route path="forex" element={<ForexIntelligence apiUrl="http://localhost:8000/api/v1" />} />
                <Route path="admin" element={<AdminDashboard />} />
                <Route path="reconciliation" element={<Reconciliation />} />
              </Route>
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App

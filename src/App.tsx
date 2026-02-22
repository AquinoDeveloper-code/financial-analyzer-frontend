import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainApp from "./pages/MainApp";
import RootLayout from "./pages/RootLayout";
import NewDocument from "./pages/NewDocument";
import { ThemeProvider } from "./context/ThemeContext";

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<RootLayout />}>
            <Route index element={<MainApp />} />
            <Route path="new" element={<NewDocument />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App

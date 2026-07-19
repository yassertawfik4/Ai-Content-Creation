import { Routes, Route } from "react-router-dom";
import { LoginPage, RegisterPage } from "@/features/auth";
import { LandingPage } from "@/features/landing";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
    </Routes>
  );
}

export default App;

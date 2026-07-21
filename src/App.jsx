import { Routes, Route } from "react-router-dom";
import { LoginPage, RegisterPage } from "@/features/auth";
import { LandingPage } from "@/features/landing";
import { GeneratePage } from "@/features/generate";
import { ConnectorsPage } from "@/features/connectors/pages/ConnectorsPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/generate" element={<GeneratePage />} />
      <Route path="/connectors" element={<ConnectorsPage />} />
    </Routes>
  );
}

export default App;

import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { GuestRoute, ProtectedRoute } from "@/components/ProtectedRoute";
import { LoadingScreen } from "@/components/LoadingScreen";

const LandingPage = lazy(() =>
  import("@/features/landing/pages/LandingPage").then((module) => ({ default: module.LandingPage })),
);
const LoginPage = lazy(() =>
  import("@/features/auth/pages/LoginPage").then((module) => ({ default: module.LoginPage })),
);
const RegisterPage = lazy(() =>
  import("@/features/auth/pages/RegisterPage").then((module) => ({ default: module.RegisterPage })),
);
const VerifyEmailPage = lazy(() =>
  import("@/features/auth/pages/VerifyEmailPage").then((module) => ({ default: module.VerifyEmailPage })),
);
const OtpLoginPage = lazy(() =>
  import("@/features/auth/pages/OtpLoginPage").then((module) => ({ default: module.OtpLoginPage })),
);
const GeneratePage = lazy(() =>
  import("@/features/generate/pages/GeneratePage").then((module) => ({ default: module.GeneratePage })),
);
const ConnectorsPage = lazy(() =>
  import("@/features/connectors/pages/ConnectorsPage").then((module) => ({ default: module.ConnectorsPage })),
);
const PublishingPage = lazy(() =>
  import("@/features/publishing/pages/PublishingPage").then((module) => ({ default: module.PublishingPage })),
);
const KnowledgePage = lazy(() =>
  import("@/features/knowledge/pages/KnowledgePage").then((module) => ({ default: module.KnowledgePage })),
);

function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
          <Route path="/verify-email" element={<GuestRoute><VerifyEmailPage /></GuestRoute>} />
          <Route path="/otp-login" element={<GuestRoute><OtpLoginPage /></GuestRoute>} />
          <Route path="/generate" element={<ProtectedRoute><GeneratePage /></ProtectedRoute>} />
          <Route path="/connectors" element={<ProtectedRoute><ConnectorsPage /></ProtectedRoute>} />
          <Route path="/publishing" element={<ProtectedRoute><PublishingPage /></ProtectedRoute>} />
          <Route path="/knowledge" element={<ProtectedRoute><KnowledgePage /></ProtectedRoute>} />
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}

export default App;

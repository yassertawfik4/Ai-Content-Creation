import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

const LandingPage = lazy(() =>
  import("@/features/landing/pages/LandingPage").then((module) => ({ default: module.LandingPage })),
);
const LoginPage = lazy(() =>
  import("@/features/auth/pages/LoginPage").then((module) => ({ default: module.LoginPage })),
);
const RegisterPage = lazy(() =>
  import("@/features/auth/pages/RegisterPage").then((module) => ({ default: module.RegisterPage })),
);
const GeneratePage = lazy(() =>
  import("@/features/generate/pages/GeneratePage").then((module) => ({ default: module.GeneratePage })),
);
const ConnectorsPage = lazy(() =>
  import("@/features/connectors/pages/ConnectorsPage").then((module) => ({ default: module.ConnectorsPage })),
);

function RouteFallback() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#fffaff]" role="status">
      <span className="size-7 animate-spin rounded-full border-2 border-[#d8cde0] border-t-[#4f378a]" />
      <span className="sr-only">Loading page</span>
    </div>
  );
}

function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/generate" element={<GeneratePage />} />
        <Route path="/connectors" element={<ConnectorsPage />} />
      </Routes>
    </Suspense>
  );
}

export default App;

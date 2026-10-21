import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate, useLocation } from "react-router-dom";
import DefaultLayout from "../layouts/DefaultLayout";
import AppShell from "../layouts/AppShell";
import HomePage from "../pages/HomePage";
import PlayListPage from "../pages/PlaylistPage";
import ListenPage from "../pages/ListenPage";
import LandingStub from "../pages/LandingStub";
import NotFound from "../pages/NotFound";
import { PageLoader } from "../components/Loader";
import { useAuth, AuthFlow } from "../contexts/AuthContext";

// Chỉ dev: lazy để không lọt vào bản build production
const DevUI = import.meta.env.DEV ? lazy(() => import("../pages/DevUI")) : null;

function FullLoader() {
  return (
    <div className="bg-cafe grid min-h-screen place-items-center">
      <PageLoader />
    </div>
  );
}

// Cần đăng nhập: chưa có thì về /login, nhớ chỗ cũ để quay lại (link chia sẻ /playlist/:id)
function RequireAuth() {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (user) return <Outlet />;
  if (loading) return <FullLoader />;
  return <Navigate to="/login" replace state={{ from: location }} />;
}

function GuestOnly() {
  const { user, loading } = useAuth();
  const from = useLocation().state?.from;
  if (user) return <Navigate to={from ? `${from.pathname}${from.search}${from.hash}` : "/listen"} replace />;
  if (loading) return <FullLoader />;
  return <Outlet />;
}

function V1Layout() {
  return (
    <DefaultLayout>
      <Outlet />
    </DefaultLayout>
  );
}

export default function AppRouter() {
  const { user } = useAuth();

  return (
    <Router>
      <Routes>
        {DevUI && (
          <Route
            path="/dev/ui"
            element={
              <Suspense fallback={<FullLoader />}>
                <DevUI />
              </Suspense>
            }
          />
        )}
        <Route path="/" element={<LandingStub />} />
        <Route element={<GuestOnly />}>
          <Route path="/login" element={<AuthFlow />} />
          <Route path="/register" element={<AuthFlow />} />
        </Route>
        <Route element={<RequireAuth />}>
          <Route
            path="/listen"
            element={
              <AppShell>
                <ListenPage />
              </AppShell>
            }
          />
          {/* shortcut: giao diện v1 giữ tạm tới GĐ4 (Thư viện, chi tiết playlist) */}
          <Route element={<V1Layout />}>
            <Route path="/v1" element={<HomePage user={user} />} />
            <Route path="/playlist/:id" element={<PlayListPage />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

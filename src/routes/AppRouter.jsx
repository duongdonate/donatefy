import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { getCurrentSong } from "../app/selectors";
import DefaultLayout from "../layouts/DefaultLayout";
import AppShell from "../layouts/AppShell";
import HomePage from "../pages/HomePage";
import PlayListPage from "../pages/PlaylistPage";
import NowPlaying from "../features/player/NowPlaying";
import NotFound from "../pages/NotFound";
import { PageLoader } from "../components/Loader";
import { useAuth } from "../contexts/AuthContext";

// Chỉ dev: lazy để không lọt vào bản build production
const DevUI = import.meta.env.DEV ? lazy(() => import("../pages/DevUI")) : null;
const LandingPage = lazy(() => import("../features/landing/LandingPage"));
const AuthPage = lazy(() => import("../features/auth/AuthPage"));
// Bộ phát chỉ tải khi vào trong quán: landing / đăng nhập không kéo theo react-player
const PlayerEngine = lazy(() => import("../features/player/PlayerEngine"));
const MusicPlayer = lazy(() => import("../components/MusicPlayer"));

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

// Nhạc chạy song song mọi trang trong app; Music Layer dính đáy
function PlayerLayout() {
  const { pathname } = useLocation();
  return (
    <Suspense fallback={<FullLoader />}>
      <PlayerEngine>
        <Outlet />
        {/* /listen đã là bản mở rộng của Music Layer */}
        {pathname !== "/listen" && <MusicPlayer />}
      </PlayerEngine>
    </Suspense>
  );
}

function V1Layout() {
  const hasSong = !!useSelector(getCurrentSong);
  return (
    // Chừa đáy cho Music Layer để thanh không che nội dung
    <div className={`h-screen ${hasSong ? "pb-28" : ""}`}>
      <DefaultLayout>
        <Outlet />
      </DefaultLayout>
    </div>
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
        <Route
          path="/"
          element={
            <Suspense fallback={<FullLoader />}>
              <LandingPage />
            </Suspense>
          }
        />
        <Route element={<GuestOnly />}>
          {["login", "register"].map((mode) => (
            <Route
              key={mode}
              path={`/${mode}`}
              element={
                <Suspense fallback={<FullLoader />}>
                  <AuthPage mode={mode} />
                </Suspense>
              }
            />
          ))}
        </Route>
        <Route element={<RequireAuth />}>
          <Route element={<PlayerLayout />}>
            <Route
              path="/listen"
              element={
                <AppShell>
                  <NowPlaying />
                </AppShell>
              }
            />
            {/* shortcut: giao diện v1 giữ tạm tới GĐ4 (Thư viện, chi tiết playlist) */}
            <Route element={<V1Layout />}>
              <Route path="/v1" element={<HomePage user={user} />} />
              <Route path="/playlist/:id" element={<PlayListPage />} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

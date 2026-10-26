import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate, useLocation, useParams } from "react-router-dom";
import AppShell from "../layouts/AppShell";
import LibraryPage from "../features/library/LibraryPage";
import PlaylistPage from "../features/playlist/PlaylistPage";
import NowPlaying from "../features/player/NowPlaying";
import NotFound from "../pages/NotFound";
// Music Layer tải sẵn (nhẹ, không kéo react-player): lazy riêng làm cả trang nháy loader khi rời /listen
import MusicLayer from "../features/player/MusicLayer/MusicLayer";
import { PageLoader } from "../components/Loader";
import { useAuth } from "../contexts/AuthContext";

// Chỉ dev: lazy để không lọt vào bản build production
const DevUI = import.meta.env.DEV ? lazy(() => import("../pages/DevUI")) : null;
const LandingPage = lazy(() => import("../features/landing/LandingPage"));
const AuthPage = lazy(() => import("../features/auth/AuthPage"));
// Bộ phát chỉ tải khi vào trong quán: landing / đăng nhập không kéo theo react-player
const PlayerEngine = lazy(() => import("../features/player/PlayerEngine"));


function FullLoader() {
  const { waking } = useAuth();
  return (
    <div className="bg-cafe grid min-h-screen place-items-center">
      <div className="flex flex-col items-center gap-4">
        <PageLoader />
        {waking && <p className="text-sm opacity-70">Quán đang mở cửa, chờ xíu nha…</p>}
      </div>
    </div>
  );
}

// Cần đăng nhập: chưa có thì về /login, nhớ chỗ cũ để quay lại (link chia sẻ /playlists/:id)
function RequireAuth() {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (user) return <Outlet />;
  if (loading) return <FullLoader />;
  return <Navigate to="/login" replace state={{ from: location }} />;
}

function OldPlaylist() {
  const { id } = useParams();
  return <Navigate to={`/playlists/${id}`} replace />;
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
        {pathname !== "/listen" && <MusicLayer />}
      </PlayerEngine>
    </Suspense>
  );
}

export default function AppRouter() {
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
            <Route path="/playlists" element={<AppShell><LibraryPage /></AppShell>} />
            <Route path="/playlists/:id" element={<AppShell><PlaylistPage /></AppShell>} />
            {/* Link cũ vẫn dùng được */}
            <Route path="/library" element={<Navigate to="/playlists" replace />} />
            <Route path="/playlist/:id" element={<OldPlaylist />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

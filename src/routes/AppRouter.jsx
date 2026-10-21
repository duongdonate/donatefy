import React, { lazy, Suspense, useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
  Navigate,
} from "react-router-dom";
import DefaultLayout from "../layouts/DefaultLayout";
import HomePage from "../pages/HomePage";
import PlayListPage from "../pages/PlaylistPage";
import { useAuth, AuthFlow } from "../contexts/AuthContext";

// Chỉ dev: lazy để không lọt vào bản build production
const DevUI = import.meta.env.DEV ? lazy(() => import("../pages/DevUI")) : null;

function PublicRouter() {
  const { user } = useAuth();
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    if (user) {
      const timer = setTimeout(() => {
        setRedirect(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [user]);

  if (redirect) {
    return <Navigate to="/" replace />;
  }

  return <AuthFlow />;
}

function PrivateRouter() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <DefaultLayoutWrapper />;
}

function DefaultLayoutWrapper() {
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
              <Suspense>
                <DevUI />
              </Suspense>
            }
          />
        )}
        <Route path="/login" element={<PublicRouter />}></Route>
        <Route element={<PrivateRouter />}>
          <Route path="/" element={<HomePage user={user} />} />
          <Route path="/playlist/:id" element={<PlayListPage />} />
        </Route>
        <Route path="*" element={<PrivateRouter />} />
      </Routes>
    </Router>
  );
}

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
} from "react-router-dom";
import DefaultLayout from "../layouts/DefaultLayout";
import HomePage from "../pages/HomePage";
import PlayListPage from "../pages/PlaylistPage";
import { currentSong, mockSongs } from "../mock";

function LayoutWrapper() {
  return (
    <DefaultLayout>
      <Outlet />
    </DefaultLayout>
  );
}

export default function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route element={<LayoutWrapper />}>
          <Route
            path="/"
            element={<HomePage songs={mockSongs} currentSong={currentSong} />}
          />
          <Route path="/playlist/:id" element={<PlayListPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

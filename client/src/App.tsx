import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import RequireEditor from "./auth/RequireEditor";

// Public pages — loaded eagerly (the common path).
import Home from "./pages/Home";
import Gremien from "./pages/Gremien";
import Eventkalender from "./pages/Eventkalender";
import Baracke from "./pages/Baracke";
import Sport from "./pages/Sport";
import Kontakt from "./pages/Kontakt";
import Barrierefreiheit from "./pages/Barrierefreiheit";
import Impressum from "./pages/Impressum";
import Datenschutz from "./pages/Datenschutz";
import NotFound from "./pages/NotFound";
import Asta from "./pages/gremien/Asta";
import Stupa from "./pages/gremien/Stupa";
import Fachschaften from "./pages/gremien/Fachschaften";

// Auth + admin pages — code-split (lazy). Anonymous visitors never download
// these chunks; they load on demand when the route is visited.
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Profile = lazy(() => import("./pages/Profile"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminEvents = lazy(() => import("./pages/admin/AdminEvents"));
const NewEvent = lazy(() => import("./pages/admin/NewEvent"));
const EditEvent = lazy(() => import("./pages/admin/EditEvent"));
const AdminProtocols = lazy(() => import("./pages/admin/AdminProtocols"));
const NewProtocol = lazy(() => import("./pages/admin/NewProtocol"));
const EditProtocol = lazy(() => import("./pages/admin/EditProtocol"));
const AdminGremien = lazy(() => import("./pages/admin/gremien/AdminGremien"));
const AdminGremiumPage = lazy(
  () => import("./pages/admin/gremien/AdminGremiumPage"),
);

function PageFallback() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <p className="text-gray-500">Lädt…</p>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/gremien" element={<Gremien />} />
        <Route path="/gremien/asta" element={<Asta />} />
        <Route path="/gremien/stupa" element={<Stupa />} />
        <Route path="/gremien/fachschaften" element={<Fachschaften />} />
        <Route path="/eventkalender" element={<Eventkalender />} />
        <Route path="/baracke" element={<Baracke />} />
        <Route path="/sport" element={<Sport />} />
        <Route path="/kontakt" element={<Kontakt />} />
        <Route path="/barrierefreiheit" element={<Barrierefreiheit />} />
        <Route path="/impressum" element={<Impressum />} />
        <Route path="/datenschutz" element={<Datenschutz />} />

        {/* Lazy routes share one Suspense fallback. */}
        <Route
          path="/login"
          element={
            <Suspense fallback={<PageFallback />}>
              <Login />
            </Suspense>
          }
        />
        <Route
          path="/signup"
          element={
            <Suspense fallback={<PageFallback />}>
              <Signup />
            </Suspense>
          }
        />
        <Route
          path="/profile"
          element={
            <Suspense fallback={<PageFallback />}>
              <Profile />
            </Suspense>
          }
        />
        <Route
          path="/admin"
          element={
            <RequireEditor>
              <Suspense fallback={<PageFallback />}>
                <AdminDashboard />
              </Suspense>
            </RequireEditor>
          }
        />
        <Route
          path="/admin/events"
          element={
            <RequireEditor>
              <Suspense fallback={<PageFallback />}>
                <AdminEvents />
              </Suspense>
            </RequireEditor>
          }
        />
        <Route
          path="/admin/events/new"
          element={
            <RequireEditor>
              <Suspense fallback={<PageFallback />}>
                <NewEvent />
              </Suspense>
            </RequireEditor>
          }
        />
        <Route
          path="/admin/events/:id/edit"
          element={
            <RequireEditor>
              <Suspense fallback={<PageFallback />}>
                <EditEvent />
              </Suspense>
            </RequireEditor>
          }
        />
        <Route
          path="/admin/protocols"
          element={
            <RequireEditor>
              <Suspense fallback={<PageFallback />}>
                <AdminProtocols />
              </Suspense>
            </RequireEditor>
          }
        />
        <Route
          path="/admin/protocols/new"
          element={
            <RequireEditor>
              <Suspense fallback={<PageFallback />}>
                <NewProtocol />
              </Suspense>
            </RequireEditor>
          }
        />
        <Route
          path="/admin/protocols/:id/edit"
          element={
            <RequireEditor>
              <Suspense fallback={<PageFallback />}>
                <EditProtocol />
              </Suspense>
            </RequireEditor>
          }
        />
        <Route
          path="/admin/gremien"
          element={
            <RequireEditor>
              <Suspense fallback={<PageFallback />}>
                <AdminGremien />
              </Suspense>
            </RequireEditor>
          }
        >
          {/* Default to ASTA when no slug specified. */}
          <Route index element={<Navigate to="/admin/gremien/asta" replace />} />
          <Route path=":slug" element={<AdminGremiumPage />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;

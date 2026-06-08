import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Gremien from "./pages/Gremien";
import Eventkalender from "./pages/Eventkalender";
import Baracke from "./pages/Baracke";
import Sport from "./pages/Sport";
import Kontakt from "./pages/Kontakt";
import Barrierefreiheit from "./pages/Barrierefreiheit";
import Impressum from "./pages/Impressum";
import NotFound from "./pages/NotFound";
import Asta from "./pages/gremien/Asta";
import Stupa from "./pages/gremien/Stupa";
import Fachschaften from "./pages/gremien/Fachschaften";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminEvents from "./pages/admin/AdminEvents";
import NewEvent from "./pages/admin/NewEvent";
import EditEvent from "./pages/admin/EditEvent";
import AdminProtocols from "./pages/admin/AdminProtocols";
import NewProtocol from "./pages/admin/NewProtocol";
import EditProtocol from "./pages/admin/EditProtocol";
import AdminGremien from "./pages/admin/gremien/AdminGremien";
import AdminGremiumPage from "./pages/admin/gremien/AdminGremiumPage";
import RequireEditor from "./auth/RequireEditor";
import { Navigate } from "react-router-dom";

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
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={<Profile />} />
        <Route
          path="/admin"
          element={
            <RequireEditor>
              <AdminDashboard />
            </RequireEditor>
          }
        />
        <Route
          path="/admin/events"
          element={
            <RequireEditor>
              <AdminEvents />
            </RequireEditor>
          }
        />
        <Route
          path="/admin/events/new"
          element={
            <RequireEditor>
              <NewEvent />
            </RequireEditor>
          }
        />
        <Route
          path="/admin/events/:id/edit"
          element={
            <RequireEditor>
              <EditEvent />
            </RequireEditor>
          }
        />
        <Route
          path="/admin/protocols"
          element={
            <RequireEditor>
              <AdminProtocols />
            </RequireEditor>
          }
        />
        <Route
          path="/admin/protocols/new"
          element={
            <RequireEditor>
              <NewProtocol />
            </RequireEditor>
          }
        />
        <Route
          path="/admin/protocols/:id/edit"
          element={
            <RequireEditor>
              <EditProtocol />
            </RequireEditor>
          }
        />
        <Route
          path="/admin/gremien"
          element={
            <RequireEditor>
              <AdminGremien />
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

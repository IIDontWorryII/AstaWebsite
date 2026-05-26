import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Gremien from "./pages/Gremien";
import Eventkalender from "./pages/Eventkalender";
import Baracke from "./pages/Baracke";
import Sport from "./pages/Sport";
import Kontakt from "./pages/Kontakt";
import NotFound from "./pages/NotFound";
import Asta from "./pages/gremien/Asta";
import Stupa from "./pages/gremien/Stupa";
import Fachschaften from "./pages/gremien/Fachschaften";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import AdminEvents from "./pages/admin/AdminEvents";
import NewEvent from "./pages/admin/NewEvent";
import EditEvent from "./pages/admin/EditEvent";
import RequireEditor from "./auth/RequireEditor";

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
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={<Profile />} />
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
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;

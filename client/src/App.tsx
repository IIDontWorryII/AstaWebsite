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
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;

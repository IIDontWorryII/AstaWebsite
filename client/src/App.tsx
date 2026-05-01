import Header from "./components/Header";
import Hero from "./components/Hero";
import EventsSection from "./components/EventsSection";
import Footer from "./components/Footer";

function App() {
  return (
    <div>
      <Header />
      <main>
        <Hero />
        <EventsSection />
      </main>
      <Footer />
    </div>
  );
}

export default App;

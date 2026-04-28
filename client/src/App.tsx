import Header from "./components/Header";
import Hero from "./components/Hero";

function App() {
  return (
    <div>
      <Header />
      <Hero />
      <main
        style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}
      ></main>
    </div>
  );
}

export default App;

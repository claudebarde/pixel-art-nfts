import React from "react";
import "./App.scss";
import Header from "./components/Header/Header";

function App() {
  return (
    <div className="grid">
      <Header />
      <aside>Left column</aside>
      <main>
        <div>Body</div>
      </main>
      <footer>Footer</footer>
    </div>
  );
}

export default App;

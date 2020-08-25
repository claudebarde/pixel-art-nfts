import React from "react";
import "./App.scss";
import Header from "./components/Header/Header";
import LeftColumn from "./components/LeftColumn/LeftColumn";

function App() {
  return (
    <div className="grid">
      <Header />
      <LeftColumn />
      <main>
        <div>Body</div>
      </main>
      <footer>Footer</footer>
    </div>
  );
}

export default App;

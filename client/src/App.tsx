import React, { useContext } from "react";
import "./App.scss";
import Header from "./components/Header/Header";
import LeftColumn from "./components/LeftColumn/LeftColumn";
import { Context, View } from "./Context";
import Canvas from "./components/Body/Canvas/Canvas";
import Market from "./components/Body/Market/Market";

function App() {
  const { view } = useContext(Context);

  return (
    <div className="grid">
      <Header />
      {view === View.CANVAS ? <Canvas /> : <Market />}
      <footer>Footer</footer>
    </div>
  );
}

export default App;

import React, { useContext } from "react";
import "./App.scss";
import Header from "./components/Header/Header";
import { Context } from "./Context";
import { View } from "./types";
import Canvas from "./components/Body/Canvas/Canvas";
import Market from "./components/Body/Market/Market";
import Footer from "./components/Footer/Footer";

function App() {
  const { view } = useContext(Context);

  return (
    <div className="grid">
      <Header />
      {view === View.CANVAS ? <Canvas /> : <Market />}
      <Footer />
    </div>
  );
}

export default App;

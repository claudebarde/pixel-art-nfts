import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import "./App.scss";
import Header from "./components/Header/Header";
import Home from "./components/Body/Home/Home";
import Canvas from "./components/Body/Canvas/Canvas";
import Market from "./components/Body/Market/Market";
import User from "./components/Body/User/User";
import Footer from "./components/Footer/Footer";

function App() {
  return (
    <div className="grid">
      <Router>
        <Header />
        <Switch>
          <Route path="/market/:token_id?">
            <Market />
          </Route>
          <Route path="/profile/:address">
            <User />
          </Route>
          <Route path="/draw">
            <Canvas />
          </Route>
          <Route path="/">
            <Home />
          </Route>
        </Switch>
      </Router>
      <Footer />
    </div>
  );
}

export default App;

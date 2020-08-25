import React, { useState } from "react";

export const Context = React.createContext();

export enum View {
  CANVAS = "canvas",
  MARKET = "market"
}

export const Provider: React.FC = props => {
  const [view, setView] = useState(View.CANVAS);

  const state = {
    view,
    setView
  };

  return (
    <Context.Provider value={{ ...state }}>{props.children}</Context.Provider>
  );
};

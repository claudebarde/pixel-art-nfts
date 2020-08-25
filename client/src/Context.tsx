import React, { useState } from "react";

export const Context = React.createContext();

export enum View {
  CANVAS = "canvas",
  MARKET = "market"
}

export enum GridSize {
  Small = 1,
  Medium = 2,
  Large = 3
}

export const Provider: React.FC = props => {
  const [view, setView] = useState(View.CANVAS);
  const [gridSize, setGridSize] = useState(GridSize.Small);

  const state = {
    view,
    setView,
    gridSize,
    setGridSize
  };

  return (
    <Context.Provider value={{ ...state }}>{props.children}</Context.Provider>
  );
};

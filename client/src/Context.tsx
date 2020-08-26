import React, { useState, useEffect } from "react";
import { Tezos } from "@taquito/taquito";

export enum View {
  CANVAS = "canvas",
  MARKET = "market"
}

export enum GridSize {
  Small = 1,
  Medium = 2,
  Large = 3
}

type State = {
  view: View;
  setView: React.Dispatch<React.SetStateAction<View>> | undefined;
  gridSize: GridSize;
  setGridSize: React.Dispatch<React.SetStateAction<GridSize>> | undefined;
};

export const Context = React.createContext({
  view: View.CANVAS,
  setView: undefined as State["setView"],
  gridSize: GridSize.Small,
  setGridSize: undefined as State["setGridSize"]
});

export const Provider: React.FC = props => {
  const [view, setView] = useState(View.CANVAS);
  const [gridSize, setGridSize] = useState(GridSize.Small);

  useEffect(() => {
    //console.log(process.env.NODE_ENV);
    //Tezos.setRpcProvider("https://localhost")
  }, []);

  const state: State = {
    view,
    setView,
    gridSize,
    setGridSize
  };

  return (
    <Context.Provider value={{ ...state }}>{props.children}</Context.Provider>
  );
};

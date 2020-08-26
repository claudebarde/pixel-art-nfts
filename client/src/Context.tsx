import React, { useState, useEffect } from "react";
import { Tezos, TezosToolkit } from "@taquito/taquito";

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
  setView: React.Dispatch<React.SetStateAction<View>>;
  gridSize: GridSize;
  setGridSize: React.Dispatch<React.SetStateAction<GridSize>>;
  Tezos: TezosToolkit;
  userAddress: string;
  setUserAddress: React.Dispatch<React.SetStateAction<string>>;
  network: string;
};

export const Context = React.createContext<Partial<State>>({});

export const Provider: React.FC = props => {
  const [view, setView] = useState(View.CANVAS);
  const [gridSize, setGridSize] = useState(GridSize.Small);
  const [userAddress, setUserAddress] = useState<string>("");

  const state: State = {
    view,
    setView,
    gridSize,
    setGridSize,
    Tezos,
    userAddress,
    setUserAddress,
    network:
      process.env.NODE_ENV === "development"
        ? "http://localhost:8732"
        : "https://carthagenet.smartpy.io"
  };

  useEffect(() => {
    Tezos.setRpcProvider(state.network);
  }, []);

  return (
    <Context.Provider value={{ ...state }}>{props.children}</Context.Provider>
  );
};

import React, { useState, useEffect } from "react";
import {
  Tezos,
  TezosToolkit,
  ContractAbstraction,
  Wallet
} from "@taquito/taquito";
import config from "./config";

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
  contract: ContractAbstraction<Wallet> | undefined;
};

export const Context = React.createContext<Partial<State>>({});

const network =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8732"
    : "https://carthagenet.smartpy.io";

export const Provider: React.FC = props => {
  const [view, setView] = useState(View.CANVAS);
  const [gridSize, setGridSize] = useState(GridSize.Small);
  const [userAddress, setUserAddress] = useState<string>("");
  const [contract, setContract] = useState<ContractAbstraction<Wallet>>();

  const state: State = {
    view,
    setView,
    gridSize,
    setGridSize,
    Tezos,
    userAddress,
    setUserAddress,
    network,
    contract
  };

  useEffect(() => {
    (async () => {
      Tezos.setRpcProvider(state.network);
      // creates contract instance
      const newInstance: ContractAbstraction<Wallet> = await Tezos.wallet.at(
        config.CONTRACT
      );
      setContract(newInstance);
    })();
  }, []);

  return (
    <Context.Provider value={{ ...state }}>{props.children}</Context.Provider>
  );
};

import React, { useState, useEffect } from "react";
import { Tezos, ContractAbstraction, Wallet } from "@taquito/taquito";
import config from "./config";
import { Storage, State, View, GridSize, CartItem } from "./types";

export const Context = React.createContext<Partial<State>>({});

export const Provider: React.FC = props => {
  const [view, setView] = useState(View.MARKET);
  const [gridSize, setGridSize] = useState(GridSize.Small);
  const [userAddress, setUserAddress] = useState<string>("");
  const [contract, setContract] = useState<ContractAbstraction<Wallet>>();
  const [storage, setStorage] = useState<Storage | undefined>();
  const [cart, setCart] = useState<CartItem[]>([]);

  const state: State = {
    view,
    setView,
    gridSize,
    setGridSize,
    Tezos,
    userAddress,
    setUserAddress,
    network: config.NETWORK[config.ENV],
    contract,
    storage,
    setStorage,
    cart,
    setCart
  };

  useEffect(() => {
    (async () => {
      Tezos.setRpcProvider(state.network);
      // creates contract instance
      const newInstance: ContractAbstraction<Wallet> = await Tezos.wallet.at(
        config.CONTRACT[config.ENV]
      );
      setContract(newInstance);
      const newStorage: Storage = await newInstance.storage();
      setStorage(newStorage);
    })();
  }, []);

  return (
    <Context.Provider value={{ ...state }}>{props.children}</Context.Provider>
  );
};

import React, { useState, useEffect, useMemo } from "react";
import { Tezos, ContractAbstraction, Wallet } from "@taquito/taquito";
import config from "./config";
import {
  Storage,
  State,
  View,
  GridSize,
  CartItem,
  ArtworkListElement
} from "./types";
import {
  connectWithBeacon,
  connectWithThanos
} from "./components/Modals/walletConnection";
import BigNumber from "bignumber.js";
import firebase from "firebase";
import firebaseConfig from "./firebase-config";

export const Context = React.createContext<Partial<State>>({});

export const Provider: React.FC = props => {
  const [view, setView] = useState(View.MARKET);
  const [gridSize, setGridSize] = useState(GridSize.Small);
  const [userAddress, setUserAddress] = useState<string>("");
  const [contract, setContract] = useState<ContractAbstraction<Wallet>>();
  const [storage, setStorage] = useState<Storage>();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [userBalance, setUserBalance] = useState<number>(0);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [_firebase, setFirebase] = useState(firebase);
  const [tokens, setTokens] = useState<ArtworkListElement[]>([]);
  const [artworkList, setArtworkList] = useState<ArtworkListElement[]>([]);
  const [entries, setEntries] = useState<any[] | undefined>();

  const refreshStorage = async () => {
    if (contract) {
      const newStorage: Storage = await contract.storage();
      setStorage(newStorage);
    }
  };

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
    refreshStorage,
    cart,
    setCart,
    userBalance,
    setUserBalance,
    walletModalOpen,
    setWalletModalOpen,
    firebase: _firebase,
    tokens,
    setTokens,
    artworkList,
    setArtworkList,
    entries,
    setEntries
  };

  useEffect(() => {
    firebase.initializeApp(firebaseConfig);
    setFirebase(firebase);

    (async () => {
      Tezos.setRpcProvider(state.network);
      // creates contract instance
      try {
        const newInstance: ContractAbstraction<Wallet> = await Tezos.wallet.at(
          config.CONTRACT[config.ENV]
        );
        setContract(newInstance);
        const newStorage: Storage = await newInstance.storage();
        setStorage(newStorage);
      } catch (error) {
        console.error(error);
      }

      // checks if users connected their wallet before
      if (window.localStorage) {
        const connectedWallet = window.localStorage.getItem("connected-wallet");
        if (connectedWallet) {
          const wallet = JSON.parse(connectedWallet);
          if (wallet.walletType === "beacon") {
            const pkh = await connectWithBeacon(Tezos, state.network);
            if (pkh) {
              setUserAddress(pkh);
              let balance: number | BigNumber = 0;
              balance = await Tezos.tz.getBalance(pkh);
              setUserBalance(balance.toNumber());
            }
          } else if (wallet.walletType === "thanos") {
            const pkh = await connectWithThanos(Tezos, state.network);
            if (pkh) {
              setUserAddress(pkh);
              let balance: number | BigNumber = 0;
              balance = await Tezos.tz.getBalance(pkh);
              setUserBalance(balance.toNumber());
            }
          }
        }
      }
    })();
  }, []);

  return (
    <Context.Provider value={{ ...state }}>{props.children}</Context.Provider>
  );
};

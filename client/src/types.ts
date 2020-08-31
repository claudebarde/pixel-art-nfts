import { MichelsonMap, MichelsonMapKey } from "@taquito/michelson-encoder";
import {
  BigMapAbstraction,
  TezosToolkit,
  ContractAbstraction,
  Wallet
} from "@taquito/taquito";
import BigNumber from "bignumber.js";
import React from "react";

export interface IPFSObject {
  canvas: string[][];
  size: number;
  author: string;
  name: string;
  artistName?: string;
}

export interface TokenMetadata {
  token_id: string;
  symbol: string;
  name: string;
  decimals: number;
  price: BigNumber | number;
  market: boolean;
  artistName: string;
  extras: MichelsonMap<MichelsonMapKey, any>;
}

export interface ArtworkListElement {
  ipfsHash: string;
  canvas: string[][];
  name: string;
  author: string;
  timestamp: number;
  price: number;
  artistName: string;
  size: number;
  hash: string;
}

export enum View {
  CANVAS = "canvas",
  MARKET = "market",
  PROFILE = "profile"
}

export enum GridSize {
  Small = 1,
  Medium = 2,
  Large = 3
}

export interface Storage {
  admin: string;
  ledger: BigMapAbstraction;
  market_fee: BigNumber;
  operators: BigMapAbstraction;
  revenues: BigMapAbstraction;
  token_metadata: BigMapAbstraction;
}

export interface State {
  view: View;
  setView: React.Dispatch<React.SetStateAction<View>>;
  gridSize: GridSize;
  setGridSize: React.Dispatch<React.SetStateAction<GridSize>>;
  Tezos: TezosToolkit;
  userAddress: string;
  setUserAddress: React.Dispatch<React.SetStateAction<string>>;
  network: string;
  contract: ContractAbstraction<Wallet> | undefined;
  storage: Storage | undefined;
  setStorage: React.Dispatch<React.SetStateAction<Storage | undefined>>;
  cart: string[];
  setCart: React.Dispatch<React.SetStateAction<string[]>>;
}

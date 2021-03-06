import { MichelsonMap, MichelsonMapKey } from "@taquito/michelson-encoder";
import {
  BigMapAbstraction,
  TezosToolkit,
  ContractAbstraction,
  Wallet
} from "@taquito/taquito";
import BigNumber from "bignumber.js";
import React, { ReactNode } from "react";
import { ToastType } from "./components/Toast/Toast";

export type Canvas = string[][];

export interface IPFSObject {
  canvas: Canvas;
  size: number;
  author: string;
  name: string;
  url: string;
  artistName?: string;
}

export interface IPFSResponse {
  artistName: string;
  author: string;
  canvas: Canvas;
  createdOn: number;
  hash: string;
  name: string;
  size: number;
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
  canvas: Canvas;
  name: string;
  author: string;
  timestamp: number;
  price: number;
  artistName: string;
  size: number;
  hash: string;
  seller: string;
  market: boolean;
  extras?: any;
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

export enum CursorType {
  PEN = "pixel_pen",
  PICKER = "pixel_picker"
}

export interface Storage {
  admin: string;
  ledger: BigMapAbstraction;
  market_fee: BigNumber;
  operators: BigMapAbstraction;
  revenues: BigMapAbstraction;
  token_metadata: BigMapAbstraction;
}

export interface CartItem {
  ipfsHash: string;
  seller: string;
  canvas: Canvas;
  price: number;
  size: GridSize;
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
  refreshStorage: () => void;
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  userBalance: number;
  setUserBalance: React.Dispatch<React.SetStateAction<number>>;
  walletModalOpen: boolean;
  setWalletModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  firebase: any;
  tokens: ArtworkListElement[];
  setTokens: React.Dispatch<React.SetStateAction<ArtworkListElement[]>>;
  artworkList: ArtworkListElement[];
  setArtworkList: React.Dispatch<React.SetStateAction<ArtworkListElement[]>>;
  entries: any[] | undefined;
  setEntries: React.Dispatch<React.SetStateAction<any[] | undefined>>;
}

export interface CardProps {
  artwork: ArtworkListElement;
  i: number;
  styles: any;
  view: View;
  userAddress?: string;
  address?: string;
  location?: string;
  token_id?: string;
  confirmTransfer?: (ipfsHash: string) => any;
  burnTokenModal?: () => any;
  openArtworkPopup?: (artwork: ArtworkListElement) => any;
  setToastType: React.Dispatch<React.SetStateAction<ToastType>>;
  setToastText: React.Dispatch<React.SetStateAction<ReactNode>>;
  cardDisplay: string;
}

export interface CardFooterProps {
  artwork: ArtworkListElement;
  styles: any;
  address: string | undefined;
  userAddress: string | undefined;
  setToastType: any;
  setToastText: any;
  isOwnerConnected: boolean | undefined;
  setFlippedCard: any;
  setTransferRecipient: any;
  display: string;
}

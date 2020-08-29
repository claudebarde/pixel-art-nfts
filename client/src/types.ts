import { MichelsonMap, MichelsonMapKey } from "@taquito/michelson-encoder";

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
  price: number;
  market: boolean;
  artistName: string;
  extras: MichelsonMap<MichelsonMapKey, any>;
}

export interface ArtworkListElement {
  canvas: string[][];
  name: string;
  author: string;
  timestamp: number;
  price: number;
}

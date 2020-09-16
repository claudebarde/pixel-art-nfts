import { TezosToolkit } from "@taquito/taquito";
import { BeaconWallet } from "@taquito/beacon-wallet";
import { ThanosWallet } from "@thanos-wallet/dapp";
import { NetworkType } from "@airgap/beacon-sdk";
import config from "../../config";

export const connectWithBeacon = async (
  Tezos: TezosToolkit,
  network: string
) => {
  try {
    if (!Tezos) throw new Error("Undefined Tezos");

    const wallet = new BeaconWallet({
      name: "Pixel Art NFTs",
      eventHandlers: {
        P2P_LISTEN_FOR_CHANNEL_OPEN: {
          handler: async data => {
            console.log("Listening to P2P channel:", data);
          }
        },
        P2P_CHANNEL_CONNECT_SUCCESS: {
          handler: async data => {
            console.log("Channel connected:", data);
          }
        },
        PERMISSION_REQUEST_SENT: {
          handler: async data => {
            console.log("Permission request sent:", data);
          }
        },
        PERMISSION_REQUEST_SUCCESS: {
          handler: async data => {
            console.log("Wallet is connected:", data);
          }
        },
        OPERATION_REQUEST_SENT: {
          handler: async data => {
            console.log("Request broadcast:", data);
          }
        },
        OPERATION_REQUEST_SUCCESS: {
          handler: async data => {
            console.log("Request broadcast success:", data);
          }
        }
      }
    });
    Tezos.setWalletProvider(wallet);
    await wallet.requestPermissions({
      network: {
        type:
          config.ENV === "dev"
            ? NetworkType.CUSTOM
            : config.ENV === "carthagenet"
            ? NetworkType.CARTHAGENET
            : NetworkType.MAINNET,
        rpcUrl: network
      }
    });
    //await wallet.client.removeAllPeers();
    //await wallet.client.removeAllAccounts();
    // gets user's address
    const keyHash = await wallet.getPKH();

    console.log("Public key:", keyHash);

    if (window.localStorage) {
      window.localStorage.setItem(
        "connected-wallet",
        JSON.stringify({
          address: keyHash,
          connectedAt: Date.now(),
          walletType: "beacon"
        })
      );
    }

    return keyHash;
  } catch (error) {
    console.log(error);
  }
};

export const connectWithThanos = async (
  Tezos: TezosToolkit,
  network: string
) => {
  if (ThanosWallet.isAvailable()) {
    const wallet = new ThanosWallet("Pixel Art NFTs");
    // forces permission if no data found in local storage
    const forcePermission =
      window.localStorage && !window.localStorage.getItem("connected-wallet");
    // connects wallet
    await wallet.connect(network === "dev" ? "sandbox" : "carthagenet", {
      forcePermission
    });
    Tezos.setWalletProvider(wallet);

    const keyHash = await wallet.getPKH();

    console.log("Public key:", keyHash);

    if (window.localStorage) {
      window.localStorage.setItem(
        "connected-wallet",
        JSON.stringify({
          address: keyHash,
          connectedAt: Date.now(),
          walletType: "thanos"
        })
      );
    }

    return keyHash;
  }
};

export const disconnectThanos = (setUserAddress, setUserBalance, Tezos) => {
  setUserAddress("");
  setUserBalance(0);
  Tezos.setWalletProvider(undefined);
  if (window.localStorage) window.localStorage.removeItem("connected-wallet");
};

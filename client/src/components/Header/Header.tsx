import React, { useContext, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LedgerSigner, DerivationType } from "@taquito/ledger-signer";
import TransportU2F from "@ledgerhq/hw-transport-u2f";
import { BeaconWallet } from "@taquito/beacon-wallet";
import { TezBridgeWallet } from "@taquito/tezbridge-wallet";
import { NetworkType } from "@airgap/beacon-sdk";
import styles from "./header.module.scss";
import { Context } from "../../Context";
import config from "../../config";
import ztext from "./ztext-custom";
import {
  State as ModalState,
  ModalProps,
  ModalType,
  Modal
} from "../Modal/Modal";

const titleColors = [
  "red",
  "yellow",
  "green",
  "blue",
  "turquoise",
  "grey",
  "orange"
];

const Header: React.FC = () => {
  const {
    Tezos,
    userAddress,
    setUserAddress,
    network,
    cart,
    setCart,
    contract,
    setStorage
  } = useContext(Context);
  const title = useRef(null);
  const [zTextTitle] = useState(
    [
      "P",
      "I",
      "X",
      "E",
      "L",
      "&nbsp;",
      "A",
      "R",
      "T",
      "&nbsp;",
      "N",
      "F",
      "T",
      "s"
    ]
      .map(char => {
        const color =
          titleColors[Math.floor(Math.random() * titleColors.length)];
        return `<span data-z class=${color}>${char}</span>`;
      })
      .join("")
  );
  const location = useLocation();
  const [modalState, setModalState] = useState<ModalProps>({
    state: ModalState.CLOSED,
    type: ModalType.CLOSED,
    header: "",
    body: "",
    confirm: undefined,
    close: undefined
  });

  const connectTezBridge = async () => {
    if (!Tezos || !setUserAddress)
      throw new Error("Undefined Tezos or setUserAddress");

    const wallet = new TezBridgeWallet();
    Tezos.setWalletProvider(wallet);
    const keyHash = await wallet.getPKH();
    setUserAddress(keyHash);
  };

  const connectWallet = async () => {
    try {
      if (!Tezos || !setUserAddress)
        throw new Error("Undefined Tezos or setUserAddress");

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
      setUserAddress(keyHash);

      console.log("Public key:", keyHash);
    } catch (error) {
      console.log(error);
    }
  };

  const connectLedger = async () => {
    try {
      if (Tezos && setUserAddress) {
        const transport = await TransportU2F.create();
        const ledgerSigner = new LedgerSigner(
          transport,
          "44'/1729'/0'/0'",
          true,
          DerivationType.tz1
        );

        Tezos.setProvider({ signer: ledgerSigner });

        //Get the public key and the public key hash from the Ledger
        const keyHash = await Tezos.signer.publicKeyHash();
        setUserAddress(keyHash);

        console.log("Public key:", keyHash);
      } else {
        throw new Error("Undefined Tezos or setPublicKeyHash");
      }
    } catch (error) {
      console.log("Error!", error);
    }
  };

  const confirmBuy = async (cart, setCart) => {
    const tokens = cart?.map(item => item.ipfsHash);
    const price = cart?.map(item => item.price).reduce((a, b) => a + b);
    // starts transaction
    try {
      const op = await contract?.methods
        .buy_tokens(tokens)
        .send({ amount: price, mutez: true });
      await op?.confirmation();
      // empties the cart
      if (setCart && setStorage) {
        setCart([]);
        // refreshes the storage
        setStorage(await contract?.storage());
      }
    } catch (error) {
      console.log(error);
    } finally {
      // closes the modal
      setModalState({
        state: ModalState.CLOSED,
        type: ModalType.CLOSED,
        header: "",
        body: "",
        confirm: undefined,
        close: undefined
      });
    }
  };

  useEffect(() => {
    if (ztext) {
      ztext(title.current, "[data-z]", {
        depth: "1rem",
        direction: "both",
        event: "pointer",
        eventRotation: "40deg",
        eventDirection: "default",
        fade: false,
        layers: 10,
        perspective: "500px",
        z: true
      });
    }
  }, []);

  return (
    <header>
      <div className={styles.nav}></div>
      <div className="title">
        <h1 ref={title} dangerouslySetInnerHTML={{ __html: zTextTitle }}></h1>
      </div>
      <div className={styles.nav}>
        <Link to="/">
          <i
            className="fas fa-palette fa-lg"
            style={
              location.pathname === "/"
                ? { color: "#4fd1c5" }
                : { color: "black" }
            }
          ></i>
        </Link>
        <Link to="/market">
          <i
            className="fas fa-store fa-lg"
            style={
              location.pathname === "/market"
                ? { color: "#4fd1c5" }
                : { color: "black" }
            }
          ></i>
        </Link>
        <div className={styles.wallet_button}>
          {userAddress ? (
            <Link to={`/profile/${userAddress}`}>
              <i
                className="fas fa-user-check fa-lg"
                style={
                  location.pathname.includes("/profile")
                    ? { color: "#4fd1c5" }
                    : { color: "black" }
                }
              ></i>
            </Link>
          ) : (
            <>
              <i className="fas fa-wallet fa-lg"></i>
              <div className={styles.wallet_tooltip_container}>
                <div className={styles.wallet_tooltip}>
                  <div>Choose your wallet</div>
                  <p onClick={connectWallet}>
                    <i className="fas fa-network-wired"></i> Beacon
                  </p>
                  <p onClick={connectLedger}>
                    <i className="fab fa-usb"></i> Nano Ledger
                  </p>
                  <p onClick={connectTezBridge}>
                    <i className="fab fa-dev"></i> TezBridge
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
        {userAddress && (
          <div
            onClick={() =>
              setModalState({
                state: ModalState.OPEN,
                type: ModalType.CONFIRM_CART,
                header: "Confirm purchases",
                body: "",
                confirm: confirmBuy,
                close: () => {
                  setModalState({
                    state: ModalState.CLOSED,
                    type: ModalType.CLOSED,
                    header: "",
                    body: "",
                    confirm: undefined,
                    close: undefined
                  });
                }
              })
            }
          >
            <i
              className={`fas ${
                cart && cart.length > 0 ? "fa-cart-plus" : "fa-shopping-cart"
              } fa-lg`}
            ></i>
          </div>
        )}
      </div>
      <Modal {...modalState} />
    </header>
  );
};

export default Header;

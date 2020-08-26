import React, { useContext } from "react";
import { LedgerSigner, DerivationType } from "@taquito/ledger-signer";
import TransportU2F from "@ledgerhq/hw-transport-u2f";
import { BeaconWallet } from "@taquito/beacon-wallet";
import { NetworkType } from "@airgap/beacon-sdk";
import styles from "./header.module.scss";
import line1 from "./templates/template-line-1";
import line2 from "./templates/template-line-2";
import line3 from "./templates/template-line-3";
import line4 from "./templates/template-line-4";
import line5 from "./templates/template-line-5";
import { Context, View } from "../../Context";

const Header: React.FC = () => {
  const {
    view,
    setView,
    Tezos,
    userAddress,
    setUserAddress,
    network
  } = useContext(Context);

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
              //setBeaconConnection(BeaconConnection.LISTENING);
              //setPublicToken(data.publicKey);
            }
          },
          P2P_CHANNEL_CONNECT_SUCCESS: {
            handler: async data => {
              console.log("Channel connected:", data);
              //setBeaconConnection(BeaconConnection.CONNECTED);
            }
          },
          PERMISSION_REQUEST_SENT: {
            handler: async data => {
              console.log("Permission request sent:", data);
              //setBeaconConnection(BeaconConnection.PERMISSION_REQUEST_SENT);
            }
          },
          PERMISSION_REQUEST_SUCCESS: {
            handler: async data => {
              console.log("Wallet is connected:", data);
              //setBeaconConnection(BeaconConnection.PERMISSION_REQUEST_SUCCESS);
            }
          }
        }
      });
      Tezos.setWalletProvider(wallet);
      await wallet.requestPermissions({
        network: {
          type: NetworkType.CARTHAGENET,
          rpcUrl: network
        }
      });
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

  return (
    <header>
      <div></div>
      <div className={styles.grid}>
        {Array(76)
          .fill("0")
          .map((pos, i) => (
            <div key={"pixel-" + i} className={styles.pixel}></div>
          ))}
        {line1.map((pos, i) => {
          if (pos === "0") {
            return <div key={"pixel-" + i} className={styles.pixel}></div>;
          } else {
            return (
              <div
                className={styles.pixel}
                key={"pixel-" + i}
                style={{ backgroundColor: pos }}
              ></div>
            );
          }
        })}
        {line2.map((pos, i) => {
          if (pos === "0") {
            return <div key={"pixel-" + i} className={styles.pixel}></div>;
          } else {
            return (
              <div
                className={styles.pixel}
                key={"pixel-" + i}
                style={{ backgroundColor: pos }}
              ></div>
            );
          }
        })}
        {line3.map((pos, i) => {
          if (pos === "0") {
            return <div key={"pixel-" + i} className={styles.pixel}></div>;
          } else {
            return (
              <div
                className={styles.pixel}
                key={"pixel-" + i}
                style={{ backgroundColor: pos }}
              ></div>
            );
          }
        })}
        {line4.map((pos, i) => {
          if (pos === "0") {
            return <div key={"pixel-" + i} className={styles.pixel}></div>;
          } else {
            return (
              <div
                className={styles.pixel}
                key={"pixel-" + i}
                style={{ backgroundColor: pos }}
              ></div>
            );
          }
        })}
        {line5.map((pos, i) => {
          if (pos === "0") {
            return <div key={"pixel-" + i} className={styles.pixel}></div>;
          } else {
            return (
              <div
                className={styles.pixel}
                key={"pixel-" + i}
                style={{ backgroundColor: pos }}
              ></div>
            );
          }
        })}
        {Array(76)
          .fill("0")
          .map((pos, i) => (
            <div key={"pixel-" + i} className={styles.pixel}></div>
          ))}
      </div>
      <div className={styles.nav}>
        <div
          onClick={() => {
            if (setView) setView(View.CANVAS);
          }}
        >
          <i
            className="fas fa-palette fa-lg"
            style={
              view === View.CANVAS ? { color: "#4fd1c5" } : { color: "black" }
            }
          ></i>
        </div>
        <div
          onClick={() => {
            if (setView) setView(View.MARKET);
          }}
        >
          <i
            className="fas fa-store fa-lg"
            style={
              view === View.MARKET ? { color: "#4fd1c5" } : { color: "black" }
            }
          ></i>
        </div>
        <div className={styles.wallet_button}>
          {userAddress ? (
            <i className="fas fa-user-check fa-lg"></i>
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
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

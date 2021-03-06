import React, { useState, useContext, useEffect } from "react";
import styles from "./walletmodal.module.scss";
import { Context } from "../../Context";
import { LedgerSigner, DerivationType } from "@taquito/ledger-signer";
import TransportU2F from "@ledgerhq/hw-transport-u2f";
import { TezBridgeWallet } from "@taquito/tezbridge-wallet";
import BigNumber from "bignumber.js";
import { connectWithBeacon, connectWithThanos } from "./walletConnection";

enum WalletType {
  LEDGER,
  BEACON,
  TEZBRIDGE,
  THANOS
}

const WalletModal: React.FC<{ close: any }> = ({ close }) => {
  const { setUserAddress, setUserBalance, Tezos, network } = useContext(
    Context
  );
  const [walletType, setWalletType] = useState<WalletType>();
  const [derivationPath, setDerivationPath] = useState<string>(
    "44'/1729'/0'/0'"
  );
  const [derivationType, setDerivationType] = useState<DerivationType>(
    DerivationType.ED25519
  );
  const [addressFromLedger, setAddressFromLedger] = useState("");
  const [ledgerSigner, setLedgerSigner] = useState<LedgerSigner>();

  const getUserBalance = async (address): Promise<void> => {
    if (!Tezos || !setUserBalance) return;

    try {
      let balance = await Tezos.tz.getBalance(address);
      setUserBalance(balance.toNumber());
    } catch (error) {
      console.log(error);
    }
  };

  const confirm = async () => {
    if (!Tezos || !setUserAddress) return;

    if (walletType === WalletType.BEACON) {
      // Beacon wallet
      const pkh = await connectWithBeacon(Tezos, network as string);
      if (pkh) {
        setUserAddress(pkh);
        getUserBalance(pkh);
      }
      close(false);
    } else if (walletType === WalletType.THANOS) {
      // Beacon wallet
      const pkh = await connectWithThanos(Tezos, network as string);
      if (pkh) {
        setUserAddress(pkh);
        getUserBalance(pkh);
      }
      close(false);
    } else if (walletType === WalletType.LEDGER) {
      // Ledger wallet
      if (setUserAddress) {
        setUserAddress(addressFromLedger);
        getUserBalance(addressFromLedger);
        Tezos?.setSignerProvider(ledgerSigner);

        if (window.localStorage) {
          window.localStorage.setItem(
            "connected-wallet",
            JSON.stringify({
              address: addressFromLedger,
              connectedAt: Date.now(),
              walletType: "ledger"
            })
          );
        }
      }
      close(false);
    } else if (walletType === WalletType.TEZBRIDGE) {
      // TezBridge wallet
      if (!Tezos || !setUserAddress)
        throw new Error("Undefined Tezos or setUserAddress");

      const wallet = new TezBridgeWallet();
      Tezos.setWalletProvider(wallet);
      const keyHash = await wallet.getPKH();
      setUserAddress(keyHash);
      getUserBalance(keyHash);

      if (window.localStorage) {
        window.localStorage.setItem(
          "connected-wallet",
          JSON.stringify({
            address: keyHash,
            connectedAt: Date.now(),
            walletType: "tezbridge"
          })
        );
      }

      close(false);
    }
  };

  useEffect(() => {
    if (walletType === WalletType.LEDGER) {
      (async () => {
        try {
          if (Tezos && setUserAddress) {
            setAddressFromLedger("");
            const transport = await TransportU2F.create();
            const signer = new LedgerSigner(
              transport,
              derivationPath,
              true,
              derivationType
            );
            const pkh = await signer.publicKeyHash();
            if (pkh) {
              setAddressFromLedger(pkh);
              setLedgerSigner(signer);
            }
          } else {
            throw new Error("Undefined Tezos or setPublicKeyHash");
          }
        } catch (error) {
          console.log("Error!", error);
        }
      })();
    }
  }, [walletType, derivationPath, derivationType]);

  return (
    <div className={styles.modal_container}>
      <div className={styles.modal}>
        <div className={styles.modal__header}>Connect your wallet</div>
        <div className={styles.modal__body}>
          <div className={styles.modal__body_p}>
            <label
              className={styles.modal__wallet_option}
              onClick={() => setWalletType(WalletType.BEACON)}
            >
              <span className="fa-stack">
                <i className="far fa-square fa-stack-1x"></i>
                {walletType === WalletType.BEACON && (
                  <i
                    className="fas fa-check fa-stack-1x"
                    style={{
                      fontSize: "1.5rem",
                      marginLeft: "1px",
                      marginTop: "-4px",
                      color: "#48bb78"
                    }}
                  ></i>
                )}
              </span>
              <input type="checkbox" /> Beacon
            </label>
          </div>
          <div className={styles.modal__body_p}>
            <label
              className={styles.modal__wallet_option}
              onClick={() => setWalletType(WalletType.THANOS)}
            >
              <span className="fa-stack">
                <i className="far fa-square fa-stack-1x"></i>
                {walletType === WalletType.THANOS && (
                  <i
                    className="fas fa-check fa-stack-1x"
                    style={{
                      fontSize: "1.5rem",
                      marginLeft: "1px",
                      marginTop: "-4px",
                      color: "#48bb78"
                    }}
                  ></i>
                )}
              </span>
              <input type="checkbox" /> Thanos
            </label>
          </div>
          {process.env.NODE_ENV === "development" && (
            <div className={styles.modal__body_p}>
              <label
                className={styles.modal__wallet_option}
                onClick={() => setWalletType(WalletType.TEZBRIDGE)}
              >
                <span className="fa-stack">
                  <i className="far fa-square fa-stack-1x"></i>
                  {walletType === WalletType.TEZBRIDGE && (
                    <i
                      className="fas fa-check fa-stack-1x"
                      style={{
                        fontSize: "1.5rem",
                        marginLeft: "1px",
                        marginTop: "-4px",
                        color: "#48bb78"
                      }}
                    ></i>
                  )}
                </span>
                <input type="checkbox" /> TezBridge
              </label>
            </div>
          )}
          <div className={styles.modal__body_p}>
            <label
              className={styles.modal__wallet_option}
              onClick={() => setWalletType(WalletType.LEDGER)}
            >
              <span className="fa-stack">
                <i className="far fa-square fa-stack-1x"></i>
                {walletType === WalletType.LEDGER && (
                  <i
                    className="fas fa-check fa-stack-1x"
                    style={{
                      fontSize: "1.5rem",
                      marginLeft: "1px",
                      marginTop: "-4px",
                      color: "#48bb78"
                    }}
                  ></i>
                )}
              </span>
              <input type="checkbox" /> Nano Ledger
            </label>
          </div>
          {walletType === WalletType.LEDGER && (
            <div className={`${styles.ledger_options} ${styles.slide_up}`}>
              <p>Derivation path:</p>
              <p>
                <select
                  className={styles.modal__select}
                  onChange={e => setDerivationPath(e.target.value)}
                >
                  <option value="44'/1729'/0'/0'">44'/1729'/0'/0'</option>
                  <option value="44'/1729'/0'">44'/1729'/0'</option>
                </select>
              </p>
              <p>Address type:</p>
              <div>
                <label>
                  <input
                    type="radio"
                    value={DerivationType.ED25519}
                    checked={derivationType === DerivationType.ED25519}
                    onChange={e => setDerivationType(DerivationType.ED25519)}
                  />{" "}
                  ED25519
                </label>
                <label>
                  <input
                    type="radio"
                    value={DerivationType.P256}
                    checked={derivationType === DerivationType.P256}
                    onChange={e => setDerivationType(DerivationType.P256)}
                  />{" "}
                  P256
                </label>
                <label>
                  <input
                    type="radio"
                    value={DerivationType.SECP256K1}
                    checked={derivationType === DerivationType.SECP256K1}
                    onChange={e => setDerivationType(DerivationType.SECP256K1)}
                  />{" "}
                  SECP256K1
                </label>
              </div>
              <p>Your address:</p>
              <p>
                {addressFromLedger
                  ? addressFromLedger
                  : "Please confirm your address on your device"}
              </p>
            </div>
          )}
        </div>
        <div className={styles.modal__buttons}>
          <button
            className={`button ${
              walletType === undefined ? "disabled" : "info"
            }`}
            disabled={walletType === undefined}
            onClick={confirm}
          >
            Confirm
          </button>
          <button className="button error" onClick={() => close(false)}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default WalletModal;

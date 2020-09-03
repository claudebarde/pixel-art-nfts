import React, { useState, useContext, useEffect } from "react";
import styles from "./modal.module.scss";
import { Context } from "../../Context";
import { TokenMetadata, GridSize } from "../../types";
import { validateAddress } from "@taquito/utils";
import { LedgerSigner, DerivationType } from "@taquito/ledger-signer";
import TransportU2F from "@ledgerhq/hw-transport-u2f";

export enum State {
  OPEN,
  CLOSED
}

export enum ModalType {
  CLOSED,
  EMPTY_CANVAS,
  CONFIRM_NEW_TOKEN,
  CONFIRM_CART,
  CONFIRM_TRANSFER,
  CONNECT_LEDGER
}

export type ModalProps = {
  state: State;
  type: ModalType;
  header: string;
  body: string;
  close: any;
  confirm: any;
};

export const Modal: React.FC<ModalProps> = ({
  state,
  type,
  header,
  body,
  close,
  confirm
}) => {
  const {
    userAddress,
    cart,
    storage,
    setCart,
    Tezos,
    setUserAddress
  } = useContext(Context);
  const [artName, setArtName] = useState("masterpiece");
  const [price, setPrice] = useState("3");
  const [artistName, setArtistName] = useState("Claude B.");
  const [availableOnMarket, setAvailableOnMarket] = useState(true);
  const [confirmBuy, setConfirmBuy] = useState(false);
  const [transferRecipient, setTransferRecipient] = useState<string>("");
  const [loadingTransfer, setLoadingTransfer] = useState(false);
  const [derivationPath, setDerivationPath] = useState<string>(
    "44'/1729'/0'/0'"
  );
  const [derivationType, setDerivationType] = useState<DerivationType>(
    DerivationType.tz1
  );
  const [addressFromLedger, setAddressFromLedger] = useState("");
  const [ledgerSigner, setLedgerSigner] = useState<LedgerSigner>();

  useEffect(() => {
    if (type === ModalType.CONNECT_LEDGER) {
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
  }, [type, derivationPath, derivationType]);

  if (state === State.CLOSED) {
    return null;
  } else {
    return (
      <div className={styles.modal_container}>
        <div className={styles.modal}>
          <div className={styles.modal__header}>{header}</div>
          {/* EMPTY CANVAS */}
          {type === ModalType.EMPTY_CANVAS && (
            <>
              <div className={styles.modal__body}>{body}</div>
              <div className={styles.modal__buttons}>
                <button
                  className="button info"
                  onClick={() => {
                    confirm();
                    close();
                  }}
                >
                  Confirm
                </button>
                <button className="button error" onClick={close}>
                  Close
                </button>
              </div>
            </>
          )}
          {/* CONFIRM NEW TOKEN */}
          {type === ModalType.CONFIRM_NEW_TOKEN && (
            <>
              <div className={styles.modal__body}>
                <div>
                  <p>
                    You are about to save your pixel art to the blockchain!
                    After this step, it won't be possible to edit it or delete
                    it.
                  </p>
                  <p>
                    Please fill in the information below to complete the
                    tokenization process:
                  </p>
                </div>
                <br />
                <div className="form">
                  <div className="form__row">
                    <div>
                      <i className="fas fa-key"></i> Connected as:&nbsp;
                    </div>
                    <div>
                      {userAddress?.slice(0, 10) +
                        "..." +
                        userAddress?.slice(-10)}
                    </div>
                  </div>
                  <div className="form__row">
                    <div>
                      <i className="far fa-image"></i> Give a name to your
                      artwork:&nbsp;
                    </div>
                    <div>
                      <input
                        type="text"
                        value={artName}
                        onChange={event => setArtName(event.target.value)}
                      />
                    </div>
                  </div>
                  <div className="form__row">
                    <div>
                      <i className="fas fa-user"></i> Display your name:&nbsp;
                    </div>
                    <div>
                      <input
                        type="text"
                        value={artistName}
                        onChange={event => setArtistName(event.target.value)}
                      />
                    </div>
                  </div>
                  <div className="form__row">
                    <div>
                      <i className="fas fa-money-bill-wave"></i> Set your price
                      in XTZ:&nbsp;
                    </div>
                    <div>
                      <input
                        type="text"
                        value={price}
                        onChange={event => setPrice(event.target.value)}
                      />
                    </div>
                  </div>
                  <div className="form__row">
                    <div>
                      <i className="fas fa-store"></i> Make it available in the
                      marketplace:&nbsp;
                    </div>
                    <div>
                      <input
                        type="checkbox"
                        checked={availableOnMarket}
                        onChange={() =>
                          setAvailableOnMarket(!availableOnMarket)
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.modal__buttons}>
                <button
                  className={`button ${
                    artName &&
                    price &&
                    !isNaN(+price) &&
                    artistName &&
                    userAddress
                      ? "info"
                      : "disabled"
                  }`}
                  onClick={() => {
                    confirm({
                      price: parseInt(price) * 1000000,
                      artistName,
                      name: artName,
                      market: availableOnMarket,
                      symbol: "PXNFT"
                    } as Omit<TokenMetadata, "token_id, decimals, extras">);
                    close();
                  }}
                >
                  Confirm
                </button>
                <button className="button error" onClick={close}>
                  Close
                </button>
              </div>
            </>
          )}
          {/* CONFIRM CART */}
          {type === ModalType.CONFIRM_CART && (
            <>
              <div className={styles.modal__body}>
                {cart && cart.length > 0 ? (
                  <>
                    <div className={styles.cartItems}>
                      {storage &&
                        cart.map((item, index) => (
                          <div className={styles.cartItem} key={item.ipfsHash}>
                            <div>{index + 1}.</div>
                            <div
                              className={
                                item.size === GridSize.Small
                                  ? styles.cart_grid_small
                                  : styles.cart_grid_default
                              }
                            >
                              {item.canvas.map((row, i1) =>
                                row.map((bgColor, i2) => (
                                  <div
                                    key={i1.toString() + i2.toString()}
                                    style={{
                                      backgroundColor: bgColor,
                                      borderTop: "none",
                                      borderLeft: "none"
                                    }}
                                  ></div>
                                ))
                              )}
                            </div>
                            <div>
                              Sold by{" "}
                              {item.seller.slice(0, 5) +
                                "..." +
                                item.seller.slice(-5)}
                            </div>
                            <div>ꜩ {item.price / 1000000}</div>
                            <div>
                              <a
                                href={`https://gateway.pinata.cloud/ipfs/${item.ipfsHash}`}
                                className={styles.tokenData}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <i className="fas fa-cube"></i>
                              </a>
                            </div>
                            <div
                              style={{ cursor: "pointer" }}
                              onClick={() => {
                                if (setCart) {
                                  setCart(
                                    [...cart].filter(
                                      el => el.ipfsHash !== item.ipfsHash
                                    )
                                  );
                                }
                              }}
                            >
                              <i className="far fa-trash-alt"></i>
                            </div>
                          </div>
                        ))}
                    </div>
                    <p className={styles.cart_total}>
                      Total: ꜩ{" "}
                      {cart.map(item => item.price).reduce((a, b) => a + b) /
                        1000000}
                    </p>
                  </>
                ) : (
                  <div>Your cart is empty</div>
                )}
              </div>
              <div className={styles.modal__buttons}>
                <button
                  className={`button ${
                    cart && cart.length > 0 ? "info" : "disabled"
                  }`}
                  onClick={() => {
                    setConfirmBuy(true);
                    confirm(cart, setCart);
                  }}
                >
                  {confirmBuy ? (
                    <span>
                      <i className="fas fa-spinner fa-spin"></i> Processing...
                    </span>
                  ) : (
                    <span>Confirm</span>
                  )}
                </button>
                <button
                  className="button error"
                  onClick={close}
                  disabled={confirmBuy}
                >
                  Close
                </button>
              </div>
            </>
          )}
          {/* CONFIRM TOKEN TRANSFER */}
          {type === ModalType.CONFIRM_TRANSFER && (
            <>
              <div className={styles.modal__body}>
                <p>
                  You are about to transfer this token. Please enter the
                  recipient's address below:
                </p>
                <p>
                  <i className="fas fa-user-friends fa-lg"></i>
                  <input
                    type="text"
                    className={styles.modal__input_text}
                    value={transferRecipient}
                    onChange={event => setTransferRecipient(event.target.value)}
                  />
                </p>
                {validateAddress(transferRecipient) === 3 ? (
                  <p>Are you sure you want to proceed with the transfer?</p>
                ) : (
                  <p>&nbsp;</p>
                )}
              </div>
              <div className={styles.modal__buttons}>
                <button
                  className={`button ${
                    validateAddress(transferRecipient) === 3
                      ? "info"
                      : "disabled"
                  }`}
                  onClick={() => {
                    if (!loadingTransfer) confirm(transferRecipient);
                    setLoadingTransfer(true);
                  }}
                >
                  {loadingTransfer ? (
                    <span>
                      <i className="fas fa-spinner fa-spin"></i> Processing...
                    </span>
                  ) : (
                    <span>Confirm</span>
                  )}
                </button>
                <button
                  className="button error"
                  onClick={close}
                  disabled={loadingTransfer}
                >
                  Close
                </button>
              </div>
            </>
          )}
          {/* CONNECT LEDGER */}
          {type === ModalType.CONNECT_LEDGER && (
            <>
              <div className={styles.modal__body}>
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
                      value={DerivationType.tz1}
                      checked={derivationType === DerivationType.tz1}
                      onChange={e => setDerivationType(DerivationType.tz1)}
                    />{" "}
                    tz1 address
                  </label>
                  <label>
                    <input
                      type="radio"
                      value={DerivationType.tz2}
                      checked={derivationType === DerivationType.tz2}
                      onChange={e => setDerivationType(DerivationType.tz2)}
                    />{" "}
                    tz2 address
                  </label>
                  <label>
                    <input
                      type="radio"
                      value={DerivationType.tz3}
                      checked={derivationType === DerivationType.tz3}
                      onChange={e => setDerivationType(DerivationType.tz3)}
                    />{" "}
                    tz3 address
                  </label>
                </div>
                <p>
                  Your address:{" "}
                  {addressFromLedger
                    ? addressFromLedger
                    : "Please confirm your address on your device"}
                </p>
              </div>
              <div className={styles.modal__buttons}>
                <button
                  className="button info"
                  onClick={() => {
                    if (addressFromLedger) {
                      confirm(ledgerSigner, addressFromLedger);
                      close();
                    }
                  }}
                >
                  {addressFromLedger ? "Confirm" : "Find your address"}
                </button>
                <button className="button error" onClick={close}>
                  Close
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }
};

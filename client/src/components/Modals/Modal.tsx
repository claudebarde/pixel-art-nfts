import React, { useState, useContext } from "react";
import styles from "./modal.module.scss";
import { Context } from "../../Context";
import { TokenMetadata, GridSize } from "../../types";
import { validateAddress } from "@taquito/utils";

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
  CONNECT_LEDGER,
  BURN_TOKEN
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
  const { userAddress, cart, storage, setCart, userBalance } = useContext(
    Context
  );
  const [artName, setArtName] = useState("");
  const [price, setPrice] = useState("");
  const [artistName, setArtistName] = useState("");
  const [availableOnMarket, setAvailableOnMarket] = useState(true);
  const [confirmBuy, setConfirmBuy] = useState(false);
  const [transferRecipient, setTransferRecipient] = useState<string>("");
  const [loadingTransfer, setLoadingTransfer] = useState(false);
  const [loadingBurn, setLoadingBurn] = useState(false);

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
                        maxLength={5}
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
                      price: Math.round(parseFloat(price) * 1000000),
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
                    <p className={styles.cart_balance}>
                      Your balance: ꜩ{" "}
                      {userBalance
                        ? (userBalance / 1000000).toLocaleString("en-US")
                        : "---"}
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
          {/* CONFIRM TOKEN TRANSFER */}
          {type === ModalType.BURN_TOKEN && (
            <div>
              <div className={styles.modal__body}>
                <p>Are you sure you want to delete this token?</p>
                <p>
                  The token will be removed from the main smart contract and
                  IPFS node, however, due to the nature of the IPFS, it will not
                  be permanently removed from the network if the token data are
                  pinned on other IPFS nodes.
                </p>
                <p>Do you wish to continue?</p>
              </div>
              <div className={styles.modal__buttons}>
                <button
                  className="button error"
                  onClick={() => {
                    if (!loadingBurn) confirm(transferRecipient);
                    setLoadingBurn(true);
                  }}
                >
                  {loadingBurn ? (
                    <span>
                      <i className="fas fa-spinner fa-spin"></i> Deleting...
                    </span>
                  ) : (
                    <span>Confirm</span>
                  )}
                </button>
                <button
                  className="button success"
                  onClick={close}
                  disabled={loadingBurn}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
};

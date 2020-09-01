import React, { useState, useContext, useEffect } from "react";
import styles from "./modal.module.scss";
import { Context } from "../../Context";
import { TokenMetadata, GridSize } from "../../types";

export enum State {
  OPEN,
  CLOSED
}

export enum ModalType {
  CLOSED,
  EMPTY_CANVAS,
  CONFIRM_NEW_TOKEN,
  CONFIRM_CART
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
  const { userAddress, cart, storage, setCart } = useContext(Context);
  const [artName, setArtName] = useState("masterpiece");
  const [price, setPrice] = useState("3");
  const [artistName, setArtistName] = useState("Claude B.");
  const [availableOnMarket, setAvailableOnMarket] = useState(true);

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
                >
                  Confirm
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

import React, { useState, useContext } from "react";
import styles from "./modal.module.scss";
import { Context } from "../../Context";
import { TokenMetadata } from "../../types";
import BigNumber from "bignumber.js";

export enum State {
  OPEN,
  CLOSED
}

export enum ModalType {
  CLOSED,
  EMPTY_CANVAS,
  CONFIRM_NEW_TOKEN
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
  const { userAddress } = useContext(Context);
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
        </div>
      </div>
    );
  }
};

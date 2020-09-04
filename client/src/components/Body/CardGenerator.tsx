import React from "react";
import moment from "moment";
import { NavLink } from "react-router-dom";
import { View, CartItem, CardProps } from "../../types";

const displayAuthorName = (address: string, name: string): string => {
  if (name && name !== "unknown") {
    return name;
  } else {
    return address.slice(0, 5) + "..." + address.slice(-5);
  }
};

const CardGenerator: React.FC<CardProps> = ({
  artwork,
  i,
  styles,
  view,
  userAddress,
  address,
  location,
  cart,
  setCart,
  refreshStorage,
  contract,
  token_id,
  confirmTransfer,
  flippedCard,
  setFlippedCard,
  transferRecipient,
  setTransferRecipient,
  newPrice,
  setNewPrice,
  confirmNewPrice
}) => {
  const isOwnerConnected =
    location?.includes("/profile") && userAddress && userAddress === address;

  const buy = (cartItem: CartItem) => {
    if (
      userAddress &&
      setCart &&
      cart &&
      cart.filter(el => el.ipfsHash === cartItem.ipfsHash).length === 0
    ) {
      console.log(cart);
      setCart([...cart, cartItem]);
    }
  };

  const setOnSale = async () => {
    try {
      const op = await contract?.methods
        .update_token_status(artwork.ipfsHash, true)
        .send();
      await op?.confirmation();
      if (refreshStorage) {
        await refreshStorage();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const burnToken = () => {
    console.log(artwork.ipfsHash);
  };

  return (
    <div className="flip-container" key={i + "-" + artwork.hash}>
      <div
        className={`flip-card ${
          flippedCard && flippedCard === artwork.ipfsHash ? "hover" : ""
        }`}
      >
        <div className="front">
          <div
            className={
              token_id === artwork.ipfsHash
                ? styles.card_highlight
                : styles.card
            }
          >
            <div className={styles.card__image}>
              {artwork.size === 1 && (
                <div
                  className={styles.pixelGridSmall}
                  style={{
                    borderBottom: "none",
                    borderRight: "none"
                  }}
                >
                  {artwork.canvas.map((row, i1) =>
                    row.map((bgColor, i2) => (
                      <div
                        key={i1.toString() + i2.toString()}
                        className={styles.pixel}
                        style={{
                          backgroundColor: bgColor,
                          borderTop: "none",
                          borderLeft: "none"
                        }}
                      ></div>
                    ))
                  )}
                </div>
              )}
            </div>
            <div className={styles.card__header}>{artwork.name}</div>
            <div className={styles.card__body}>
              <p>
                {artwork.size === 1 && "12x12"}
                {artwork.size === 2 && "32x32"}
                {artwork.size === 3 && "64x64"}
              </p>
              <p>
                Created on{" "}
                {moment.unix(artwork.timestamp / 1000).format("MM/DD/YYYY")}
              </p>
              {view === View.MARKET && (
                <>
                  <p>
                    Artist:{" "}
                    <NavLink
                      to={`/profile/${artwork.author}`}
                      className={styles.card__link}
                    >
                      {displayAuthorName(artwork.author, artwork.artistName)}
                    </NavLink>
                  </p>
                  <p>
                    Sold by{" "}
                    <NavLink
                      to={`/profile/${artwork.seller}`}
                      className={styles.card__link}
                    >
                      {displayAuthorName(artwork.seller, "")}
                    </NavLink>
                  </p>
                </>
              )}
              <p>
                {artwork.market ? (
                  <button
                    className={styles.card__button}
                    onClick={
                      !cart?.includes(artwork.ipfsHash)
                        ? () =>
                            buy({
                              ipfsHash: artwork.ipfsHash,
                              seller: artwork.author,
                              canvas: artwork.canvas,
                              price: artwork.price,
                              size: artwork.size
                            })
                        : () => null
                    }
                  >
                    {cart &&
                    cart.filter(el => el.ipfsHash === artwork.ipfsHash).length >
                      0
                      ? "Added to cart"
                      : "Buy"}
                  </button>
                ) : isOwnerConnected ? (
                  <button className={styles.card__button} onClick={setOnSale}>
                    Set On Sale
                  </button>
                ) : (
                  <button className={styles.card__button}>Not For Sale</button>
                )}
              </p>
            </div>
            <div className={styles.card__footer}>
              <div>
                <a
                  href={`https://gateway.pinata.cloud/ipfs/${artwork.ipfsHash}`}
                  className={styles.tokenData}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fas fa-cube"></i>
                </a>
              </div>
              <div>
                <NavLink to={`/market/${artwork.ipfsHash}`}>
                  <i className="fas fa-share-alt"></i>
                </NavLink>
              </div>
              {isOwnerConnected && (
                <div
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    if (setFlippedCard && setTransferRecipient) {
                      setFlippedCard(artwork.ipfsHash);
                      setTransferRecipient("");
                    }
                  }}
                >
                  <i className="fas fa-user-cog"></i>
                </div>
              )}
              <div>ꜩ {artwork.price / 1000000}</div>
            </div>
          </div>
        </div>
        <div className="back">
          <div className={styles.card}>
            <div className={styles.card__header}></div>
            <div className={styles.card__body}>
              <div className={styles.card__body_}>
                <p>Manual transfer</p>
                <input
                  type="text"
                  placeholder="Recipient"
                  value={transferRecipient}
                  onChange={e => {
                    if (setTransferRecipient) {
                      setTransferRecipient(e.target.value);
                    }
                  }}
                />
                <button
                  className={styles.card__button}
                  onClick={() => {
                    if (confirmTransfer) confirmTransfer(artwork.ipfsHash);
                  }}
                >
                  <i className="fas fa-exchange-alt"></i> Transfer
                </button>
              </div>
              <div className={styles.card__separator}></div>
              <div>
                <p>Price update</p>
                <input
                  type="text"
                  placeholder="New price"
                  value={newPrice}
                  onChange={e => {
                    if (setNewPrice) {
                      setNewPrice(e.target.value);
                    }
                  }}
                />
                <button
                  className={styles.card__button}
                  onClick={() => {
                    if (confirmNewPrice) {
                      confirmNewPrice(artwork.ipfsHash);
                    }
                  }}
                >
                  <i className="fas fa-tag"></i> Confirm
                </button>
              </div>
              <div className={styles.card__separator}></div>
              <div>
                <button className={styles.card__button_error}>
                  <i className="far fa-trash-alt"></i> Delete token
                </button>
              </div>
            </div>
            <div className={styles.card__footer}>
              <div
                style={{ cursor: "pointer" }}
                onClick={() => {
                  if (setFlippedCard) {
                    setFlippedCard(undefined);
                  }
                }}
              >
                <i className="far fa-image"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardGenerator;

import React from "react";
import moment from "moment";
import { NavLink } from "react-router-dom";
import { View, CartItem, CardProps, GridSize } from "../../types";
import Identicon from "identicon.js";

const displayAuthorName = (address: string, name: string): string => {
  if (name && name !== "unknown") {
    return name;
  } else if (address) {
    return address.slice(0, 5) + "..." + address.slice(-5);
  } else {
    return "unknown";
  }
};

const makeIdenticon = hash => {
  const options = {
    size: 20,
    background: [255, 255, 255, 0],
    saturation: 1,
    brightness: 1
  };
  return new Identicon(hash, options).toString();
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
  token_id,
  confirmTransfer,
  flippedCard,
  setFlippedCard,
  transferRecipient,
  setTransferRecipient,
  newPrice,
  setNewPrice,
  confirmNewPrice,
  burnTokenModal,
  openArtworkPopup,
  changePriceLoading,
  transferLoading,
  setOnSale,
  removeFromMarket,
  removingFromMarket,
  settingOnSale
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
            <div
              className={styles.card__image}
              onClick={() => {
                if (openArtworkPopup) {
                  openArtworkPopup(artwork);
                }
              }}
            >
              {artwork.size === GridSize.Small && (
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
              {artwork.size === GridSize.Medium && (
                <div
                  className={styles.pixelGridMedium}
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
              {artwork.size === GridSize.Large && (
                <div
                  className={styles.pixelGridLarge}
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
              {view === View.MARKET ? (
                <p>
                  Artist:{" "}
                  <NavLink
                    to={`/profile/${artwork.author}`}
                    className={styles.card__link}
                  >
                    {displayAuthorName(artwork.author, artwork.artistName)}
                  </NavLink>
                </p>
              ) : (
                <p>
                  Created on{" "}
                  {moment.unix(artwork.timestamp / 1000).format("MM/DD/YYYY")}
                </p>
              )}
              {view === View.PROFILE && (
                <p>
                  Artist:{" "}
                  <NavLink
                    to={`/profile/${artwork.author}`}
                    className={styles.card__link}
                  >
                    {displayAuthorName(artwork.author, artwork.artistName)}
                  </NavLink>
                </p>
              )}
              <p style={{ minHeight: "66px" }}>
                {artwork.market && removingFromMarket === artwork.ipfsHash && (
                  <button className={styles.card__button} disabled>
                    <span>
                      <i className="fas fa-spinner fa-spin"></i> Removing
                    </span>
                  </button>
                )}
                {!artwork.market && settingOnSale === artwork.ipfsHash && (
                  <button className={styles.card__button} disabled>
                    <span>
                      <i className="fas fa-spinner fa-spin"></i> Updating
                    </span>
                  </button>
                )}
                {removingFromMarket === artwork.ipfsHash ||
                settingOnSale === artwork.ipfsHash ? null : artwork.market ? (
                  <button
                    className={styles.card__button}
                    onClick={() => {
                      if (location?.includes("market")) {
                        // market page
                        if (!cart?.includes(artwork.ipfsHash)) {
                          buy({
                            ipfsHash: artwork.ipfsHash,
                            seller: artwork.author,
                            canvas: artwork.canvas,
                            price: artwork.price,
                            size: artwork.size
                          });
                        }
                      } else if (location?.includes("profile")) {
                        // profile page
                        if (isOwnerConnected && removeFromMarket) {
                          // owner wants to remove the token from the market
                          removeFromMarket(artwork.ipfsHash);
                        } else {
                          // visitor wants to buy the token
                          buy({
                            ipfsHash: artwork.ipfsHash,
                            seller: artwork.author,
                            canvas: artwork.canvas,
                            price: artwork.price,
                            size: artwork.size
                          });
                        }
                      }
                    }}
                  >
                    {cart &&
                    cart.filter(el => el.ipfsHash === artwork.ipfsHash).length >
                      0
                      ? "Added to cart"
                      : isOwnerConnected && userAddress === artwork.seller
                      ? "Remove from market"
                      : "Buy"}
                  </button>
                ) : isOwnerConnected && userAddress === artwork.seller ? (
                  <button
                    className={styles.card__button}
                    onClick={() => {
                      if (setOnSale) setOnSale(artwork.ipfsHash);
                    }}
                  >
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
              {(!isOwnerConnected ||
                (isOwnerConnected && userAddress !== artwork.seller)) && (
                <>
                  <div>
                    <img
                      src={`data:image/png;base64,${makeIdenticon(
                        artwork.hash || artwork.extras.canvasHash
                      )}`}
                      title="Unique identicon"
                    />
                  </div>
                  {artwork.seller && (
                    <div>
                      <NavLink to={`/profile/${artwork.seller}`}>
                        <i className="fas fa-cash-register"></i>
                      </NavLink>
                    </div>
                  )}
                </>
              )}
              {isOwnerConnected && userAddress === artwork.seller && (
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
                  className="manual-transfer"
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
                    if (
                      transferLoading !== artwork.ipfsHash &&
                      confirmTransfer
                    ) {
                      confirmTransfer(artwork.ipfsHash);
                    }
                  }}
                >
                  {transferLoading === artwork.ipfsHash ? (
                    <span>
                      <i className="fas fa-spinner fa-spin"></i> Transferring
                    </span>
                  ) : (
                    <span>
                      <i className="fas fa-exchange-alt"></i> Transfer
                    </span>
                  )}
                </button>
              </div>
              <div className={styles.card__separator}></div>
              <div>
                <p>Price update</p>
                <input
                  className="new-price"
                  type="text"
                  maxLength={5}
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
                    if (
                      changePriceLoading !== artwork.ipfsHash &&
                      confirmNewPrice
                    ) {
                      confirmNewPrice(artwork.ipfsHash);
                    }
                  }}
                >
                  {changePriceLoading === artwork.ipfsHash ? (
                    <span>
                      <i className="fas fa-spinner fa-spin"></i> Updating
                    </span>
                  ) : (
                    <span>
                      <i className="fas fa-tag"></i> Confirm
                    </span>
                  )}
                </button>
              </div>
              <div className={styles.card__separator}></div>
              <div>
                <button
                  className={styles.card__button_error}
                  onClick={burnTokenModal}
                >
                  <i className="far fa-trash-alt"></i> Delete token
                </button>
              </div>
            </div>
            <br />
            <br />
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

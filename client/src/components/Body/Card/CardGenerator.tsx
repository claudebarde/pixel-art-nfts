import React, { useState, useContext, useEffect } from "react";
import moment from "moment";
import { NavLink } from "react-router-dom";
import ReactTooltip from "react-tooltip";
import {
  View,
  CartItem,
  CardProps,
  CardFooterProps,
  GridSize
} from "../../../types";
import { Context } from "../../../Context";
import { ToastType } from "../../Toast/Toast";
import CardFooter from "./CardFooter";

const displayAuthorName = (address: string, name: string): string => {
  if (name && name !== "unknown") {
    return name;
  } else if (address) {
    return address.slice(0, 5) + "..." + address.slice(-5);
  } else {
    return "unknown";
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
  token_id,
  burnTokenModal,
  openArtworkPopup,
  setToastType,
  setToastText,
  cardDisplay
}) => {
  const isOwnerConnected =
    location?.includes("/profile") && !!userAddress && userAddress === address;
  const { cart, setCart, refreshStorage, contract, network } = useContext(
    Context
  );
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferRecipient, setTransferRecipient] = useState<string>("");
  const [changePriceLoading, setChangePriceLoading] = useState(false);
  const [newPrice, setNewPrice] = useState<string>("");
  const [settingOnSale, setSettingOnSale] = useState(false);
  const [removingFromMarket, setRemovingFromMarket] = useState(false);
  const [flippedCard, setFlippedCard] = useState(false);

  const buy = (cartItem: CartItem) => {
    if (
      userAddress &&
      setCart &&
      cart &&
      cart.filter(el => el.ipfsHash === cartItem.ipfsHash).length === 0
    ) {
      setCart([...cart, cartItem]);
    }
  };

  const transfer = async () => {
    if (
      artwork.ipfsHash &&
      transferRecipient &&
      refreshStorage &&
      setToastType &&
      setToastText
    ) {
      setTransferLoading(true);
      try {
        const op = await contract?.methods
          .transfer([
            {
              from_: userAddress,
              txs: [
                {
                  to_: transferRecipient,
                  token_id: artwork.ipfsHash,
                  amount: 1
                }
              ]
            }
          ])
          .send();
        setToastType(ToastType.INFO);
        setToastText(
          <span>
            Op hash:{" "}
            <a
              href={`https://better-call.dev/${network}/opg/${op?.opHash}/contents`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {op?.opHash.slice(0, 7) + "..." + op?.opHash.slice(-7)}
            </a>
          </span>
        );
        await op?.confirmation();
        setTransferRecipient("");
        setToastType(ToastType.SUCCESS);
        setToastText(<span>Token successfully transferred!</span>);
        await refreshStorage();
      } catch (error) {
        console.log(error);
        setToastType(ToastType.ERROR);
        setToastText(<span>An error has occurred</span>);
      } finally {
        setTransferLoading(false);
      }
    }
  };

  const changePrice = async () => {
    if (
      artwork.ipfsHash &&
      !isNaN(+newPrice) &&
      refreshStorage &&
      setToastType &&
      setToastText
    ) {
      try {
        setChangePriceLoading(true);
        const op = await contract?.methods
          .update_token_price(
            artwork.ipfsHash,
            Math.round(parseFloat(newPrice) * 1000000)
          )
          .send();
        setToastType(ToastType.INFO);
        setToastText(
          <span>
            Op hash:{" "}
            <a
              href={`https://better-call.dev/${network}/opg/${op?.opHash}/contents`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {op?.opHash.slice(0, 7) + "..." + op?.opHash.slice(-7)}
            </a>
          </span>
        );
        await op?.confirmation();
        setNewPrice("");
        await refreshStorage();
        setToastType(ToastType.SUCCESS);
        setToastText(<span>Price successfully changed!</span>);
      } catch (error) {
        console.log(error);
        setToastType(ToastType.ERROR);
        setToastText(<span>An error has occurred</span>);
      } finally {
        setChangePriceLoading(false);
      }
    }
  };

  const setOnSale = async () => {
    if (!setToastText || !setToastType) return;

    setSettingOnSale(true);
    try {
      const op = await contract?.methods
        .update_token_status(artwork.ipfsHash, true)
        .send();
      setToastType(ToastType.INFO);
      setToastText(
        <span>
          Op hash:{" "}
          <a
            href={`https://better-call.dev/${network}/opg/${op?.opHash}/contents`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {op?.opHash.slice(0, 7) + "..." + op?.opHash.slice(-7)}
          </a>
        </span>
      );
      await op?.confirmation();
      setToastType(ToastType.SUCCESS);
      setToastText(<span>Successfully set on sale!</span>);
      if (refreshStorage) {
        await refreshStorage();
      }
    } catch (error) {
      console.log(error);
      setToastType(ToastType.ERROR);
      setToastText(<span>An error occurred</span>);
    } finally {
      // the storage needs a second or two to update
      // setTimeout prevents the previous button to display
      // which could be confusing for the user
      setTimeout(() => setSettingOnSale(false), 2000);
    }
  };

  const removeFromMarket = async () => {
    if (!setToastText || !setToastType) return;

    setRemovingFromMarket(true);
    try {
      const op = await contract?.methods
        .update_token_status(artwork.ipfsHash, false)
        .send();
      setToastType(ToastType.INFO);
      setToastText(
        <span>
          Op hash:{" "}
          <a
            href={`https://better-call.dev/${network}/opg/${op?.opHash}/contents`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {op?.opHash.slice(0, 7) + "..." + op?.opHash.slice(-7)}
          </a>
        </span>
      );
      await op?.confirmation();
      setToastType(ToastType.SUCCESS);
      setToastText(<span>Successfully removed from the market!</span>);
      if (refreshStorage) {
        await refreshStorage();
      }
    } catch (error) {
      console.log(error);
      setToastType(ToastType.ERROR);
      setToastText(<span>An error occurred</span>);
    } finally {
      // the storage needs a second or two to update
      // setTimeout prevents the previous button to display
      // which could be confusing for the user
      setTimeout(() => setRemovingFromMarket(false), 2000);
    }
  };

  useEffect(() => {
    ReactTooltip.rebuild();
  }, []);

  let cardStyle;
  if (token_id === artwork.ipfsHash && cardDisplay === "portrait") {
    cardStyle = styles.card_portrait_highlight;
  } else if (token_id === artwork.ipfsHash && cardDisplay === "landscape") {
    cardStyle = styles.card_landscape_highlight;
  } else if (token_id !== artwork.ipfsHash && cardDisplay === "portrait") {
    cardStyle = styles.card_portrait;
  } else if (token_id !== artwork.ipfsHash && cardDisplay === "landscape") {
    cardStyle = styles.card_landscape;
  }

  return (
    <div
      className={`flip-container-` + cardDisplay}
      key={i + "-" + artwork.hash}
    >
      <div className={`flip-card ${flippedCard ? "hover" : ""}`}>
        <div className={`front-` + cardDisplay}>
          <div className={cardStyle}>
            {cardDisplay === "landscape" && (
              <div className={styles.card__header}>{artwork.name}</div>
            )}
            <div>
              <div
                className={styles.card__image}
                onClick={() => {
                  if (openArtworkPopup && location?.includes("profile")) {
                    openArtworkPopup(artwork);
                  }
                }}
              >
                {artwork.canvas.length === 0 && (
                  <div className={styles.card__empty_canvas}></div>
                )}
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
            </div>
            <div className={styles.card__container}>
              {cardDisplay === "portrait" && (
                <div className={styles.card__header}>{artwork.name}</div>
              )}
              <div className={styles.card__body}>
                <p>
                  {artwork.size === 1 && "12x12"}
                  {artwork.size === 2 && "32x32"}
                  {artwork.size === 3 && "48x48"}
                </p>
                {view === View.MARKET ? (
                  <p>
                    By{" "}
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
                  {artwork.market && removingFromMarket && (
                    <button className={styles.card__button} disabled>
                      <span>
                        <i className="fas fa-spinner fa-spin"></i> Removing
                      </span>
                    </button>
                  )}
                  {!artwork.market && settingOnSale && (
                    <button className={styles.card__button} disabled>
                      <span>
                        <i className="fas fa-spinner fa-spin"></i> Updating
                      </span>
                    </button>
                  )}
                  {removingFromMarket ||
                  settingOnSale ? null : artwork.market ? (
                    <button
                      className={styles.card__button}
                      onClick={() => {
                        if (location?.includes("market")) {
                          // market page
                          if (
                            cart?.filter(
                              item => item.ipfsHash === artwork.ipfsHash
                            ).length === 0
                          ) {
                            buy({
                              ipfsHash: artwork.ipfsHash,
                              seller: artwork.seller,
                              canvas: artwork.canvas,
                              price: artwork.price,
                              size: artwork.size
                            });
                          }
                        } else if (location?.includes("profile")) {
                          // profile page
                          if (isOwnerConnected && removeFromMarket) {
                            // owner wants to remove the token from the market
                            removeFromMarket();
                          } else {
                            // visitor wants to buy the token
                            buy({
                              ipfsHash: artwork.ipfsHash,
                              seller: artwork.seller,
                              canvas: artwork.canvas,
                              price: artwork.price,
                              size: artwork.size
                            });
                          }
                        }
                      }}
                    >
                      {cart &&
                      cart.filter(el => el.ipfsHash === artwork.ipfsHash)
                        .length > 0
                        ? "Added to cart"
                        : isOwnerConnected && userAddress === artwork.seller
                        ? "Remove from market"
                        : "Buy"}
                    </button>
                  ) : isOwnerConnected && userAddress === artwork.seller ? (
                    <button className={styles.card__button} onClick={setOnSale}>
                      Set On Sale
                    </button>
                  ) : (
                    <button className={styles.card__button}>
                      Not For Sale
                    </button>
                  )}
                </p>
              </div>
              {cardDisplay === "portrait" && (
                <CardFooter
                  artwork={artwork}
                  styles={styles}
                  address={address}
                  userAddress={userAddress}
                  setToastType={setToastType}
                  setToastText={setToastText}
                  isOwnerConnected={isOwnerConnected}
                  setFlippedCard={setFlippedCard}
                  setTransferRecipient={setTransferRecipient}
                  display={cardDisplay}
                />
              )}
            </div>
            {cardDisplay === "landscape" && (
              <CardFooter
                artwork={artwork}
                styles={styles}
                address={address}
                userAddress={userAddress}
                setToastType={setToastType}
                setToastText={setToastText}
                isOwnerConnected={isOwnerConnected}
                setFlippedCard={setFlippedCard}
                setTransferRecipient={setTransferRecipient}
                display={cardDisplay}
              />
            )}
          </div>
        </div>
        <div className={`back-` + cardDisplay}>
          <div className={cardStyle}>
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
                    if (!transferLoading) {
                      transfer();
                    }
                  }}
                >
                  {transferLoading ? (
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
                    if (!changePriceLoading) {
                      changePrice();
                    }
                  }}
                >
                  {changePriceLoading ? (
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
            <div className={styles.card__footer}>
              <div
                style={{ cursor: "pointer" }}
                onClick={() => {
                  setFlippedCard(false);
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

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
  setStorage,
  contract
}) => {
  const isOwnerConnected =
    location?.includes("/profile") && userAddress && userAddress === address;

  const buy = (cartItem: CartItem) => {
    if (userAddress && setCart && cart) {
      setCart([...cart, cartItem]);
    }
  };

  const setOnSale = async () => {
    try {
      const op = await contract?.methods
        .update_token_status(artwork.ipfsHash, true)
        .send();
      await op?.confirmation();
      if (setStorage) {
        setStorage(await contract?.storage());
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className={styles.card} key={i + "-" + artwork.hash}>
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
          {artwork.size === 1 && "8x8"}
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
              cart.filter(el => el.ipfsHash === artwork.ipfsHash).length > 0
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
          <i className="fas fa-share-alt"></i>
        </div>
        {isOwnerConnected && (
          <div>
            <i className="fas fa-exchange-alt"></i>
          </div>
        )}
        <div>ꜩ {artwork.price / 1000000}</div>
      </div>
    </div>
  );
};

export default CardGenerator;

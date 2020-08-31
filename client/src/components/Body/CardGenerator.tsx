import React from "react";
import moment from "moment";
import { NavLink } from "react-router-dom";
import { View } from "../../types";

interface CardProps {
  artwork: any;
  i: number;
  styles: any;
  view: View;
}

const displayAuthorName = (address: string, name: string): string => {
  if (name && name !== "unknown") {
    return name;
  } else {
    return address.slice(0, 5) + "..." + address.slice(-5);
  }
};

const CardGenerator: React.FC<CardProps> = ({ artwork, i, styles, view }) => {
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
          <p>
            Sold by{" "}
            <NavLink
              to={`/profile/${artwork.author}`}
              className={styles.card__link}
            >
              {displayAuthorName(artwork.author, artwork.artistName)}
            </NavLink>
          </p>
        )}
        <p>
          {artwork.market ? (
            <button className={styles.card__button}>Buy</button>
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
        <div>ꜩ {artwork.price / 1000000}</div>
      </div>
    </div>
  );
};

export default CardGenerator;

import React, { useEffect, useState, useContext } from "react";
import { NavLink } from "react-router-dom";
import styles from "./market.module.scss";
import { ArtworkListElement, TokenMetadata } from "../../../types";
import config from "../../../config";
import { Context } from "../../../Context";
import { BigNumber } from "bignumber.js";
import moment from "moment";

const Market: React.FC = () => {
  const { storage } = useContext(Context);
  const [loadingMarket, setLoadingMarket] = useState(true);
  const [artworkList, setArtworkList] = useState<ArtworkListElement[]>([]);
  const [numberOfArtwork, setNumberOfArtwork] = useState<number>(0);

  const displayAuthorName = (address: string, name: string): string => {
    if (name && name !== "unknown") {
      return name;
    } else {
      return address.slice(0, 5) + "..." + address.slice(-5);
    }
  };

  useEffect(() => {
    (async () => {
      // fetches IPFS hashes from big map
      const response = await fetch(
        `https://api.better-call.dev/v1/bigmap/${config.ENV}/${config.LEDGER_ID}/keys`
      );
      const entries: any[] = await response.json();
      setNumberOfArtwork(entries.length);
      if (entries.length > 0 && storage) {
        const artPieces: Promise<any>[] = [];
        entries.forEach(async entry => {
          // gets info for each piece from the IPFS
          artPieces.push(
            fetch(`https://gateway.pinata.cloud/ipfs/${entry.data.key.value}`)
              .then(response => response.json())
              .then(result => ({ ...result, ipfsHash: entry.data.key.value }))
          );
        });
        const resultEntries: ArtworkListElement[] = await Promise.all(
          artPieces
        );
        // patches missing information from the blockchain
        const list = await Promise.all(
          [...resultEntries].map(async el => {
            const tkmt = (await storage?.token_metadata.get(
              el.ipfsHash
            )) as TokenMetadata;
            if (tkmt) {
              const createdOn = await tkmt.extras.get("createdOn");
              const canvasHash = await tkmt.extras.get("canvasHash");
              if (tkmt.market && canvasHash === el.hash) {
                const price = (tkmt.price as BigNumber).toNumber();
                return {
                  ...el,
                  timestamp: createdOn,
                  price
                };
              }
            }
          })
        );
        setArtworkList(list.filter(el => el) as ArtworkListElement[]);
        console.log(list.filter(el => el));
        setLoadingMarket(false);
        /*
        // builds a list of IPFS hashes to query from the IPFS
        const list: string[] = entries.map(entry => entry.data.key.value);
        // fetches list of NFTs
        const FetchArtwork =
          process.env.NODE_ENV === "development"
            ? `http://localhost:${config.NETLIFY_PORT}/fetchArtworkList`
            : "https://pixel-art-nfts.netlify.app/.netlify/functions/fetchArtworkList";

        const response = await fetch(FetchArtwork, {
          body: JSON.stringify(list),
          method: "POST"
        });
        const {
          count,
          rows
        }: { count: number; rows: any[] } = await response.json();
        setNumberOfArtwork(count);
        console.log(rows);*/
      }
    })();
  }, [storage]);

  return (
    <main>
      {loadingMarket ? (
        <div className={styles.loader}>
          <div>Loading the market place</div>
          <div className={styles.pulsate_fwd}>
            <i className="fas fa-store fa-lg"></i>
          </div>
        </div>
      ) : artworkList.length > 0 ? (
        <>
          <h2>
            {numberOfArtwork} Artwork{numberOfArtwork > 1 ? "s" : ""} Available
            for Purchase
          </h2>
          <p></p>
          <div className={styles.cards}>
            {artworkList.map((artwork, i) => {
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
                      Created on{" "}
                      {moment
                        .unix(artwork.timestamp / 1000)
                        .format("MM/DD/YYYY")}
                    </p>
                    <p>
                      Sold by{" "}
                      <NavLink
                        to={`/profile/${artwork.author}`}
                        className={styles.card__link}
                      >
                        {displayAuthorName(artwork.author, artwork.artistName)}
                      </NavLink>
                    </p>
                    <p>
                      <button className={styles.card__button}>Buy</button>
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
            })}
          </div>
          {/*<div className={styles.grid}>
            <div className={styles.grid__header}>
              <div>Artwork</div>
              <div>Name</div>
              <div>Seller</div>
              <div>Creation Date</div>
              <div>Price</div>
              <div></div>
            </div>
            {artworkList.map((artwork, i) => {
              return (
                <div className={styles.grid__row} key={i + "-" + artwork.hash}>
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
                  <div>
                    <em>{artwork.name}</em>
                  </div>
                  <div>
                    <a
                      className={styles.author}
                      href={`https://${
                        config.ENV === "carthagenet" && "carthage."
                      }tzkt.io/${artwork.author}/operations`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {displayAuthorName(artwork.author, artwork.artistName)}
                    </a>
                  </div>
                  <div>
                    {moment.unix(artwork.timestamp / 1000).format("MM/DD/YYYY")}
                  </div>
                  <div>ꜩ {artwork.price / 1000000}</div>
                  <div>
                    <button className="button info">Buy</button>
                  </div>
                </div>
              );
            })}
          </div>*/}
        </>
      ) : (
        <div>
          <h2>No artwork available yet</h2>
        </div>
      )}
    </main>
  );
};

export default Market;

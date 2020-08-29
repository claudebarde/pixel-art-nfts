import React, { useEffect, useState, useContext } from "react";
import styles from "./market.module.scss";
import { ArtworkListElement, TokenMetadata } from "../../../types";
import config from "../../../config";
import { Context } from "../../../Context";
import { BigNumber } from "bignumber.js";
import moment from "moment";

const Market: React.FC = () => {
  const { storage } = useContext(Context);
  const [artworkList, setArtworkList] = useState<ArtworkListElement[]>([]);
  const [numberOfArtwork, setNumberOfArtwork] = useState<number>(0);

  useEffect(() => {
    (async () => {
      // fetches IPFS hashes from big map
      const response = await fetch(
        `https://api.better-call.dev/v1/bigmap/${config.ENV}/15409/keys`
      );
      const entries: any[] = await response.json();
      setNumberOfArtwork(entries.length);
      if (entries.length > 0) {
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
        const artList = [...resultEntries]
          .map(async el => {
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
          .filter(el => el);
        const list = await Promise.all(artList);
        setArtworkList([...list, ...list] as ArtworkListElement[]);
        console.log([list]);
        //setArtworkList(artList);
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
      {artworkList.length > 0 ? (
        <>
          <h2>Available Artwork to Purchase</h2>
          <p></p>
          <div className={styles.grid}>
            <div className={styles.grid__header}>Artwork</div>
            <div className={styles.grid__header}>Name</div>
            <div className={styles.grid__header}>Author</div>
            <div className={styles.grid__header}>Creation Date</div>
            <div className={styles.grid__header}>Price</div>
            <div></div>
            {artworkList.map((artwork, i) => {
              return (
                <React.Fragment key={i + "-" + artwork.hash}>
                  <div>Image</div>
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
                      {artwork.author.slice(0, 10) +
                        "..." +
                        artwork.author.slice(-10)}
                    </a>
                  </div>
                  <div>
                    {moment.unix(artwork.timestamp / 1000).format("MM/DD/YYYY")}
                  </div>
                  <div>ꜩ {artwork.price / 1000000}</div>
                  <div>
                    <button className="button">Buy</button>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
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

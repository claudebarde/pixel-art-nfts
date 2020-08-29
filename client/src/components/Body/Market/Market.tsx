import React, { useEffect, useState } from "react";
import styles from "./market.module.scss";
import { ArtworkListElement } from "../../../types";
import config from "../../../config";

const Market: React.FC = () => {
  const [artworkList, setArtworkList] = useState<ArtworkListElement[]>([]);

  useEffect(() => {
    (async () => {
      // fetches list of NFTs
      const FetchArtwork =
        process.env.NODE_ENV === "development"
          ? `http://localhost:${config.NETLIFY_PORT}/fetchArtworkList`
          : "https://pixel-art-nfts.netlify.app/.netlify/functions/fetchArtworkList";

      const response = await fetch(FetchArtwork, {
        body: "list",
        method: "POST"
      });
      const list = await response.json();
      console.log(list);
    })();
  }, []);

  return (
    <main>
      <h2>Available Artwork to Purchase</h2>
      <div className={styles.grid}>
        <div className={styles.grid__header}>Artwork</div>
        <div className={styles.grid__header}>Name</div>
        <div className={styles.grid__header}>Author</div>
        <div className={styles.grid__header}>Date</div>
        <div className={styles.grid__header}>Price</div>
        <div></div>
      </div>
    </main>
  );
};

export default Market;

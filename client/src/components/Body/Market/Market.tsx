import React, { useEffect, useState, useContext } from "react";
import styles from "./market.module.scss";
import { ArtworkListElement, TokenMetadata, View } from "../../../types";
import config from "../../../config";
import { Context } from "../../../Context";
import { BigNumber } from "bignumber.js";
import CardGenerator from "../CardGenerator";
import { useParams } from "react-router-dom";

const Market: React.FC = () => {
  const { storage, cart, setCart, userAddress } = useContext(Context);
  const [loadingMarket, setLoadingMarket] = useState(true);
  const [artworkList, setArtworkList] = useState<ArtworkListElement[]>([]);
  const [numberOfArtwork, setNumberOfArtwork] = useState<number>(0);
  const { token_id } = useParams();

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
          if (entry.data.value) {
            // gets info for each piece from the IPFS
            artPieces.push(
              fetch(`https://gateway.pinata.cloud/ipfs/${entry.data.key.value}`)
                .then(response => response.json())
                .then(result => ({
                  ...result,
                  ipfsHash: entry.data.key.value,
                  seller: entry.data.value.value
                }))
            );
          }
        });
        const resultEntries: ArtworkListElement[] = await Promise.all(
          artPieces
        );
        // patches missing information from the blockchain
        const list = (
          await Promise.all(
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
                    timestamp: +createdOn,
                    price,
                    market: true
                  };
                }
              }
            })
          )
        ).filter(el => el) as ArtworkListElement[];
        // sorts list by timestamp
        list.sort((a, b) =>
          a.timestamp > b.timestamp ? -1 : b.timestamp > a.timestamp ? 1 : 0
        );
        // if token id is provided in URL parameters
        if (token_id) {
          const token = list.filter(
            el => el.ipfsHash === token_id
          )[0] as ArtworkListElement;
          if (token) {
            const filteredList = list.filter(
              el => el.ipfsHash !== token_id
            ) as ArtworkListElement[];
            setArtworkList([token, ...filteredList]);
          } else {
            setArtworkList(list as ArtworkListElement[]);
          }
        } else {
          setArtworkList(list as ArtworkListElement[]);
        }
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
  }, [storage, token_id]);

  return (
    <main>
      {loadingMarket ? (
        <div className="loader">
          <div>Loading the market place</div>
          <div className="pulsate-fwd">
            <i className="fas fa-store fa-lg"></i>
          </div>
        </div>
      ) : artworkList.length > 0 ? (
        <>
          <h2>Artwork Marketplace</h2>
          <div className={styles.cards}>
            {artworkList.map((artwork, i) => {
              return CardGenerator({
                artwork,
                i,
                styles,
                view: View.MARKET,
                userAddress,
                cart,
                setCart,
                token_id
              });
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

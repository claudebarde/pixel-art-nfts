import React, { useEffect, useState, useContext, ReactNode } from "react";
import styles from "./market.module.scss";
import {
  ArtworkListElement,
  GridSize,
  TokenMetadata,
  View
} from "../../../types";
import config from "../../../config";
import { Context } from "../../../Context";
import { BigNumber } from "bignumber.js";
import CardGenerator from "../CardGenerator";
import { useParams, useLocation } from "react-router-dom";
import ArtworkModal from "../../Modals/ArtworkModal";
import { Toast, ToastType } from "../../Toast/Toast";

const Market: React.FC = () => {
  const { storage, userAddress } = useContext(Context);
  const [loadingMarket, setLoadingMarket] = useState(true);
  const [tokens, setTokens] = useState<ArtworkListElement[]>([]);
  const [artworkList, setArtworkList] = useState<ArtworkListElement[]>([]);
  const [numberOfArtwork, setNumberOfArtwork] = useState<number>(0);
  const [openArtworkModal, setOpenArtworkModal] = useState(false);
  const [artworkModal, setArtworkModal] = useState<ArtworkListElement>();
  const [toastText, setToastText] = useState<ReactNode>();
  const [toastType, setToastType] = useState<ToastType>(ToastType.DEFAULT);
  const [selectedSize, setSelectSize] = useState<GridSize | string>("all");
  const [orderByPrice, setOrderByPrice] = useState<string>();
  const { token_id } = useParams();
  const location = useLocation();

  const sizeOptions = [
    { value: "all", label: "All" },
    { value: GridSize.Small, label: "12x12" },
    { value: GridSize.Medium, label: "32x32" },
    { value: GridSize.Large, label: "48x48" }
  ];

  const openArtworkPopup = artwork => {
    setArtworkModal(artwork);
    setOpenArtworkModal(true);
  };

  useEffect(() => {
    (async () => {
      // gets length of big map
      const lengthQuery = await fetch(
        `https://api.better-call.dev/v1/bigmap/${config.ENV}/${config.LEDGER_ID}`
      );
      const length = await lengthQuery.json();
      // fetches IPFS hashes from big map
      const response = await fetch(
        `https://api.better-call.dev/v1/bigmap/${config.ENV}/${config.LEDGER_ID}/keys?size=${length.total_keys}`
      );
      const entries: any[] = await response.json();
      setNumberOfArtwork(entries.length);
      if (entries.length > 0 && storage) {
        const artPieces: Promise<any>[] = [];
        entries.forEach(async entry => {
          // must be a valid IPFS hash
          if (
            entry.data.value &&
            entry.data.key.value.length === 46 &&
            entry.data.key.value.slice(0, 2) === "Qm"
          ) {
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
            // a copy is kept to retrieve tokens when user filters them
            setTokens([token, ...filteredList]);
          } else {
            setArtworkList(list as ArtworkListElement[]);
            // a copy is kept to retrieve tokens when user filters them
            setTokens(list);
          }
        } else {
          setArtworkList(list as ArtworkListElement[]);
          // a copy is kept to retrieve tokens when user filters them
          setTokens(list);
        }
        setLoadingMarket(false);
      }
    })();
  }, [storage, token_id]);

  return (
    <>
      <main>
        {loadingMarket ? (
          <div className="loader">
            <div>Loading the market place</div>
            <div className="pulsate-fwd">
              <i className="fas fa-store fa-lg"></i>
            </div>
          </div>
        ) : (
          <>
            <h2>Artwork Marketplace</h2>
            <div className={styles.market_options}>
              <label htmlFor="select-size"> Select by size:</label>
              <span className="custom-dropdown">
                <select
                  id="select-size"
                  onChange={e => {
                    const val = e.target.value;
                    // sets new selected size
                    setSelectSize(val);
                    // filters tokens
                    if (val === "all") {
                      setArtworkList(tokens);
                    } else {
                      const newTokens = [...tokens].filter(
                        token => token.size === +val
                      );
                      setArtworkList(newTokens);
                    }
                  }}
                  value={selectedSize}
                >
                  {sizeOptions.map(option => (
                    <option
                      key={`select-size-` + option.label}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              </span>
              <label htmlFor="select-price">Order by price:</label>
              <span className="custom-dropdown">
                <select
                  id="select-price"
                  value={orderByPrice}
                  onChange={e => {
                    const val = e.target.value;
                    setOrderByPrice(val);
                    if (val === "up") {
                      const newTokens = [...tokens];
                      newTokens.sort((a, b) => (+a.price < +b.price ? -1 : 1));
                      setArtworkList(newTokens);
                    } else if (val === "down") {
                      const newTokens = [...tokens];
                      newTokens.sort((a, b) => (+a.price > +b.price ? -1 : 1));
                      setArtworkList(newTokens);
                    } else {
                      setArtworkList(tokens);
                    }
                  }}
                >
                  <option value={undefined}>None</option>
                  <option value="up">Increasing</option>
                  <option value="down">Decreasing</option>
                </select>
              </span>
            </div>
          </>
        )}
        <div className={styles.cards}>
          {artworkList.map((artwork, i) => (
            <CardGenerator
              key={artwork.hash}
              artwork={artwork}
              i={i}
              styles={styles}
              view={View.MARKET}
              userAddress={userAddress}
              token_id={token_id}
              openArtworkPopup={openArtworkPopup}
              location={location.pathname}
              setToastText={setToastText}
              setToastType={setToastType}
            />
          ))}
        </div>
        {artworkList.length === 0 && !loadingMarket && (
          <div>
            <h2>No artwork available yet</h2>
          </div>
        )}
      </main>
      <Toast type={toastType} text={toastText} />
      {openArtworkModal && (
        <ArtworkModal
          close={() => setOpenArtworkModal(false)}
          artwork={artworkModal as ArtworkListElement}
          address={""}
        />
      )}
    </>
  );
};

export default Market;

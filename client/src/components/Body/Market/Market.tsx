import React, { useEffect, useState, useContext, ReactNode } from "react";
import { useParams, useLocation } from "react-router-dom";
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
import CardGenerator from "../Card/CardGenerator";
import ArtworkModal from "../../Modals/ArtworkModal";
import { Toast, ToastType } from "../../Toast/Toast";

const Market: React.FC = () => {
  const { storage, userAddress } = useContext(Context);
  const [loadingMarket, setLoadingMarket] = useState(true);
  const [loadingArtPieces, setLoadingArtPieces] = useState(false);
  const [tokens, setTokens] = useState<ArtworkListElement[]>([]);
  const [artworkList, setArtworkList] = useState<ArtworkListElement[]>([]);
  const [numberOfArtwork, setNumberOfArtwork] = useState<number>(0);
  const [openArtworkModal, setOpenArtworkModal] = useState(false);
  const [artworkModal, setArtworkModal] = useState<ArtworkListElement>();
  const [toastText, setToastText] = useState<ReactNode>();
  const [toastType, setToastType] = useState<ToastType>(ToastType.DEFAULT);
  const [selectedSize, setSelectSize] = useState<GridSize | string>("all");
  const [orderByPrice, setOrderByPrice] = useState<string>();
  const [cardDisplay, setCardDisplay] = useState("landscape"); // portrait or landscape
  const [entries, setEntries] = useState<any[] | undefined>();
  const [initialCounter, setInitialCounter] = useState(0);
  const [initialThreshold, setInitialThreshold] = useState(6);
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

  const loadArtPieces = async storage => {
    if (initialCounter > 0) setLoadingArtPieces(true);

    if (!entries) {
      // gets length of big map
      const lengthQuery = await fetch(
        `https://api.better-call.dev/v1/bigmap/${config.ENV}/${config.LEDGER_ID}`
      );
      const length = await lengthQuery.json();
      // fetches IPFS hashes from big map
      const response = await fetch(
        `https://api.better-call.dev/v1/bigmap/${config.ENV}/${config.LEDGER_ID}/keys?size=${length.total_keys}`
      );
      let respEntries: any[] = await response.json();
      // entry.data.value is null if key has been removed
      respEntries = respEntries.filter(entry => entry.data.value !== null);
      respEntries.sort((a, b) =>
        a.timestamp > b.timestamp ? -1 : b.timestamp > a.timestamp ? 1 : 0
      );
      setNumberOfArtwork(respEntries.length);
      setEntries(respEntries);
    }

    if (entries && entries.length > 0 && storage) {
      const artPieces: any[] = [];
      const tempEntries = [...entries];
      let counter = initialCounter;
      for (const entry of entries) {
        // must be a valid IPFS hash
        if (
          entry.data.key.value.length === 46 &&
          entry.data.key.value.slice(0, 2) === "Qm"
        ) {
          const tkmt = (await storage?.token_metadata.get(
            entry.data.key.value
          )) as TokenMetadata;
          if (tkmt && tkmt.market && counter < initialThreshold) {
            // gets info for each piece from the IPFS
            console.log("call to the IPFS");
            const response = await fetch(
              `https://gateway.pinata.cloud/ipfs/${entry.data.key.value}`
            );
            const result = await response.json();
            let artPiece = {
              ...result,
              ipfsHash: entry.data.key.value,
              seller: entry.data.value.value
            };
            // gets value from the blockchain
            const createdOn = await tkmt.extras.get("createdOn");
            const canvasHash = await tkmt.extras.get("canvasHash");
            if (canvasHash === artPiece.hash) {
              counter++;
              const price = (tkmt.price as BigNumber).toNumber();
              artPiece = {
                ...artPiece,
                timestamp: +createdOn,
                price,
                market: true
              };

              artPieces.push(artPiece);
            }
          } else if (counter > initialThreshold - 1) {
            setInitialThreshold(initialThreshold * 2);
            break;
          }
        }
        tempEntries.shift();
      }
      // entries are updated so we don't use the same again after infinite scroll
      setEntries([...tempEntries]);
      setLoadingMarket(false);
      setTokens([...artworkList, ...artPieces]);
      setArtworkList([...artworkList, ...artPieces]);
      setInitialCounter(counter);
    }
    setLoadingArtPieces(false);
  };

  const handleScroll = async e => {
    const bottom =
      e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
    if (bottom && !loadingArtPieces) {
      await loadArtPieces(storage);
    }
  };

  useEffect(() => {
    (async () => {
      loadArtPieces(storage);
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
              <label htmlFor="select-card-display">Portrait</label>
              <input
                type="radio"
                name="select-card-display"
                value="portrait"
                checked={cardDisplay === "portrait"}
                onChange={() => setCardDisplay("portrait")}
              />
              <label htmlFor="select-card-display">Landscape</label>
              <input
                type="radio"
                name="select-card-display"
                value="landscape"
                checked={cardDisplay === "landscape"}
                onChange={() => setCardDisplay("landscape")}
              />
            </div>
          </>
        )}
        <div className={styles.cards} onScroll={handleScroll}>
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
              cardDisplay={cardDisplay}
            />
          ))}
          {loadingArtPieces && (
            <>
              <div></div>
              <div>Loading more artwork...</div>
              <div></div>
            </>
          )}
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

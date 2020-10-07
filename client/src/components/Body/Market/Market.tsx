import React, {
  useEffect,
  useState,
  useContext,
  useRef,
  ReactNode
} from "react";
import { useParams, useLocation } from "react-router-dom";
import styles from "./market.module.scss";
import {
  ArtworkListElement,
  GridSize,
  TokenMetadata,
  View,
  IPFSResponse
} from "../../../types";
import config from "../../../config";
import { Context } from "../../../Context";
import CardGenerator from "../Card/CardGenerator";
import ArtworkModal from "../../Modals/ArtworkModal";
import { Toast, ToastType } from "../../Toast/Toast";

const Market: React.FC = () => {
  const {
    storage,
    userAddress,
    artworkList,
    setArtworkList,
    tokens,
    setTokens,
    entries,
    setEntries
  } = useContext(Context);
  const [loadingMarket, setLoadingMarket] = useState(true);
  const [loadingArtPieces, setLoadingArtPieces] = useState(false);
  const [numberOfArtwork, setNumberOfArtwork] = useState<number>(0);
  const [openArtworkModal, setOpenArtworkModal] = useState(false);
  const [artworkModal, setArtworkModal] = useState<ArtworkListElement>();
  const [toastText, setToastText] = useState<ReactNode>();
  const [toastType, setToastType] = useState<ToastType>(ToastType.DEFAULT);
  const [selectedSize, setSelectSize] = useState<GridSize | string>("all");
  const [orderByPrice, setOrderByPrice] = useState<string>();
  const [cardDisplay, setCardDisplay] = useState("portrait"); // portrait or landscape
  const [artworkLoadingCounter, setArtworkLoadingCounter] = useState(0);
  const [initialThreshold, setInitialThreshold] = useState(6);
  const { token_id } = useParams();
  const location = useLocation();
  const cards = useRef<HTMLDivElement>(null);

  const sizeOptions = [
    { value: "all", label: "All" },
    { value: GridSize.Small, label: "12x12" },
    { value: GridSize.Medium, label: "32x32" },
    { value: GridSize.Large, label: "48x48" }
  ];

  const artworkLoadingIncrement = 6;

  const openArtworkPopup = artwork => {
    setArtworkModal(artwork);
    setOpenArtworkModal(true);
  };

  const loadArtPieces = async storage => {
    const startTimer = performance.now();

    if (!setTokens || !setArtworkList || !setEntries) return;
    // no need to show the market loading if the artwork is already loaded
    if (artworkList && artworkList.length > 0) {
      setLoadingMarket(false);
    }

    let localEntries = !entries ? undefined : [...entries];
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
      respEntries = respEntries
        .filter(entry => entry.data.value !== null)
        .slice(0, 20);
      respEntries.sort((a, b) =>
        a.timestamp > b.timestamp ? -1 : b.timestamp > a.timestamp ? 1 : 0
      );
      setNumberOfArtwork(respEntries.length);
      setEntries(respEntries);
      localEntries = [...respEntries];
    }

    if (localEntries && localEntries.length > 0 && storage) {
      if (artworkList?.length === 0) {
        // if artwork list is loading for the first time
        const tempArtworkList: ArtworkListElement[] = [];
        const newArtworks = localEntries.map(async (entry, i) => {
          if (
            entry.data.key.value.length === 46 &&
            entry.data.key.value.slice(0, 2) === "Qm"
          ) {
            // gets data
            const ipfsHash = entry.data.key.value;
            const response = await fetch(
              `https://gateway.pinata.cloud/ipfs/${ipfsHash}`
            );
            // response from the IPFS
            const result: IPFSResponse = await response.json();
            // extra data from the blockchain
            const seller = await storage.ledger.get(ipfsHash);
            const tkmt = (await storage?.token_metadata.get(
              entry.data.key.value
            )) as TokenMetadata;
            if (tkmt && tkmt.market) {
              const createdOn: number = await tkmt.extras.get("createdOn");
              const author: string = await tkmt.extras.get("createdBy");
              const canvasHash: string = await tkmt.extras.get("canvasHash");
              const artPiece: ArtworkListElement = {
                ...result,
                ipfsHash,
                timestamp: +createdOn,
                price: tkmt.price as number,
                market: tkmt.market,
                seller
              };
              tempArtworkList.push(artPiece);
            }
          }
        });

        await Promise.all(newArtworks);
        tempArtworkList.sort((a, b) =>
          a.timestamp > b.timestamp ? -1 : b.timestamp > a.timestamp ? 1 : 0
        );
        setLoadingMarket(false);
        setTokens([...artworkList!, ...tempArtworkList]);
        setArtworkList([...artworkList!, ...tempArtworkList.slice(0, 6)]);
        setArtworkLoadingCounter(
          artworkLoadingCounter + artworkLoadingIncrement
        );

        const endTimer = performance.now();
        console.log(`Loading time: ${endTimer - startTimer} milliseconds`);
      } else {
        // infinite scroll
        // 6 more artwork pieces are loaded in the artwork list
        // while 6 other are fetched from the indexer
        const cardsHeight = cards.current?.scrollHeight || 0;
        if (
          tokens?.length &&
          tokens?.length > artworkLoadingCounter + artworkLoadingIncrement
        ) {
          // there are still items to load
          const newCounter = artworkLoadingCounter + artworkLoadingIncrement;
          const itemsToLoad = tokens.slice(artworkLoadingCounter, newCounter);
          let newItems = await reorderItems([...artworkList!, ...itemsToLoad]);
          if (newItems.length > 0) {
            setArtworkList(newItems);
            setArtworkLoadingCounter(newCounter);
          }
        } else if (
          tokens?.length &&
          tokens?.length < artworkLoadingCounter + artworkLoadingIncrement &&
          tokens?.length > artworkLoadingCounter
        ) {
          // there are some items but less that the increment value
          const newCounter = artworkLoadingCounter + artworkLoadingIncrement;
          const itemsToLoad = tokens.slice(
            artworkLoadingCounter,
            tokens.length
          );
          // reorders items according to current settings
          let newItems = await reorderItems([...artworkList!, ...itemsToLoad]);

          setArtworkList(newItems);
          setArtworkLoadingCounter(newCounter);
        }
        setLoadingArtPieces(false);
        // scrolls down to show new cards
        cards.current?.scrollTo({
          top: cardsHeight,
          left: 0,
          behavior: "smooth"
        });
      }
    }
  };

  const reorderItems = async (
    items: ArtworkListElement[]
  ): Promise<ArtworkListElement[]> => {
    // order by price
    if (orderByPrice === "up") {
      items.sort((a, b) => (+a.price < +b.price ? -1 : 1));
    } else if (orderByPrice === "down") {
      items.sort((a, b) => (+a.price > +b.price ? -1 : 1));
    } else {
      items.sort((a, b) =>
        a.timestamp > b.timestamp ? -1 : b.timestamp > a.timestamp ? 1 : 0
      );
    }
    // order by size
    if (selectedSize !== "all") {
      items = [...items].filter(token => token.size === +selectedSize);
    }

    return items.filter(
      (item, index, self) =>
        self.findIndex(
          t => t.ipfsHash === item.ipfsHash && t.hash === item.hash
        ) === index
    );
  };

  const handleScroll = async e => {
    const bottom =
      e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
    if (bottom && tokens && artworkList && tokens.length > artworkList.length) {
      setLoadingArtPieces(true);
    }
  };

  useEffect(() => {
    (async () => {
      loadArtPieces(storage);
    })();
  }, [storage, token_id]);

  useEffect(() => {
    (async () => {
      if (loadingArtPieces) {
        await loadArtPieces(storage);
      }
    })();
  }, [loadingArtPieces]);

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
                    if (!setArtworkList) return;

                    const val = e.target.value;
                    // sets new selected size
                    setSelectSize(val);
                    // filters tokens
                    if (val === "all") {
                      setArtworkList(
                        tokens
                          ?.sort((a, b) =>
                            a.timestamp > b.timestamp
                              ? -1
                              : b.timestamp > a.timestamp
                              ? 1
                              : 0
                          )
                          .slice(0, 6) as ArtworkListElement[]
                      );
                    } else {
                      const newTokens = [...tokens!]
                        .filter(token => token.size === +val)
                        .slice(0, 6);
                      setArtworkList(newTokens);
                    }
                    setArtworkLoadingCounter(6);
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
                    if (!setArtworkList) return;

                    const val = e.target.value;
                    setOrderByPrice(val);
                    if (val === "up") {
                      const newTokens = [...tokens!];
                      newTokens.sort((a, b) => (+a.price < +b.price ? -1 : 1));
                      setArtworkList(newTokens as ArtworkListElement[]);
                    } else if (val === "down") {
                      const newTokens = [...tokens!];
                      newTokens.sort((a, b) => (+a.price > +b.price ? -1 : 1));
                      setArtworkList(newTokens as ArtworkListElement[]);
                    } else {
                      setArtworkList(
                        tokens?.slice(0, 6) as ArtworkListElement[]
                      );
                    }
                    setArtworkLoadingCounter(6);
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
                className={styles.displayRadio}
                name="select-card-display"
                value="portrait"
                checked={cardDisplay === "portrait"}
                onChange={() => setCardDisplay("portrait")}
              />
              <label htmlFor="select-card-display">Landscape</label>
              <input
                type="radio"
                className={styles.displayRadio}
                name="select-card-display"
                value="landscape"
                checked={cardDisplay === "landscape"}
                onChange={() => setCardDisplay("landscape")}
              />
            </div>
          </>
        )}
        <div
          id="cards"
          ref={cards}
          className={styles.cards}
          onScroll={handleScroll}
        >
          {artworkList?.map((artwork, i) => (
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
        </div>
        {loadingArtPieces && (
          <div className={styles.loading_art_pieces}>
            {console.log(loadingArtPieces)}
            Loading more artwork...
          </div>
        )}
        {artworkList && artworkList.length === 0 && !loadingMarket && (
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

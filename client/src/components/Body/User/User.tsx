import React, { useState, useEffect, useContext } from "react";
import { useParams, useLocation } from "react-router-dom";
import config from "../../../config";
import { Context } from "../../../Context";
import styles from "./user.module.scss";
import CardGenerator from "../CardGenerator";
import { View, Canvas, ArtworkListElement } from "../../../types";
import {
  State as ModalState,
  ModalProps,
  ModalType,
  Modal
} from "../../Modals/Modal";

const User: React.FC = () => {
  const {
    storage,
    userAddress,
    cart,
    setCart,
    refreshStorage,
    contract
  } = useContext(Context);
  const [loading, setLoading] = useState(true);
  const [tokens, setTokens] = useState<ArtworkListElement[]>([]);
  const [modalState, setModalState] = useState<ModalProps>({
    state: ModalState.CLOSED,
    type: ModalType.CLOSED,
    header: "",
    body: "",
    confirm: undefined,
    close: undefined
  });
  const [flippedCard, setFlippedCard] = useState<string>();
  const [transferRecipient, setTransferRecipient] = useState<string>("");
  const [newPrice, setNewPrice] = useState<string>("");
  let { address } = useParams();
  const location = useLocation();

  const confirmTransfer = ipfsHash => {
    if (ipfsHash && transferRecipient) {
      transfer(ipfsHash, transferRecipient);
    }
  };

  const transfer = async (ipfsHash: string, recipient: string) => {
    if (ipfsHash && recipient && refreshStorage) {
      try {
        const op = await contract?.methods
          .transfer([
            {
              from_: userAddress,
              txs: [{ to_: recipient, token_id: ipfsHash, amount: 1 }]
            }
          ])
          .send();
        await op?.confirmation();
        setTransferRecipient("");
        await refreshStorage();
      } catch (error) {
        console.log(error);
      }
    }
  };

  const confirmNewPrice = (ipfsHash: string) => {
    changePrice(ipfsHash, newPrice);
  };

  const changePrice = async (ipfsHash: string, price: string) => {
    if (ipfsHash && !isNaN(+price) && refreshStorage) {
      try {
        const op = await contract?.methods
          .update_token_price(ipfsHash, +price * 1000000)
          .send();
        await op?.confirmation();
        setNewPrice("");
        await refreshStorage();
      } catch (error) {
        console.log(error);
      }
    }
  };

  const burnToken = async (tokenID: string) => {
    const BurnToken =
      process.env.NODE_ENV === "development"
        ? `http://localhost:${config.NETLIFY_PORT}/burnPixelArt`
        : "https://pixel-art-nfts.netlify.app/.netlify/functions/burnPixelArt";

    try {
      const data = await fetch(BurnToken, {
        body: tokenID,
        method: "POST"
      });

      if (data.status === 200) {
        console.log("removed!");
      } else {
        throw new Error(JSON.stringify(await data.text()));
      }
      // remove the token from the blockchain
      const op = await contract?.methods.burn_token(tokenID).send();
      await op?.confirmation();
      // removes token from list
      setTokens([...tokens.filter(el => el.ipfsHash !== tokenID)]);
      setModalState({
        state: ModalState.CLOSED,
        type: ModalType.CLOSED,
        header: "",
        body: "",
        confirm: undefined,
        close: undefined
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    (async () => {
      if (storage) {
        let tokensOwned: any[];
        // gets ledger to find tokens owned by user
        const responseLedger = await fetch(
          `https://api.better-call.dev/v1/bigmap/${config.ENV}/${config.LEDGER_ID}/keys`
        );
        const ledger = await responseLedger.json();
        tokensOwned = [
          ...ledger.filter(
            el => el.data.value && el.data.value.value === address
          )
        ];
        // gets IPFS hashes of tokens owned by user
        const IPFSHashes: string[] = tokensOwned.map(el => el.data.key.value);
        // gets token metadata to find tokens created by user
        const responseMetadata = await fetch(
          `https://api.better-call.dev/v1/bigmap/${config.ENV}/${config.TOKEN_METADATA_ID}/keys`
        );
        const entries: any[] = await responseMetadata.json();
        const tokensMetadata: any[] = entries.filter(el =>
          IPFSHashes.includes(el.data.key.value)
        );
        const canvasList = await Promise.all(
          tokensMetadata.map(async tk => {
            // gets canvas code
            const response = await fetch(
              `https://gateway.pinata.cloud/ipfs/${tk.data.key_string}`
            );
            const canvas = await response.json();
            return { ...canvas, ipfsHash: tk.data.key_string };
          })
        );
        const tokensPromise: any[] = tokensMetadata.map(async el => {
          const tkmt: any = await storage.token_metadata.get(
            el.data.key_string
          );
          const children = [...el.data.value.children];
          const token = {};
          await Promise.all(
            children.map(async child => {
              if (child.name === "extras") {
                // extras map is not returned by the API request
                const _token: any = await storage?.token_metadata.get(
                  el.data.key_string
                );
                const extras: Canvas = Array.from(_token.extras.entries());

                token[child.name] = {
                  canvasHash: extras.filter(
                    (arr: string[]) => arr[0] === "canvasHash"
                  )[0][1],
                  createdBy:
                    extras.filter(
                      (arr: string[]) => arr[0] === "createdBy"
                    )[0][1] || null,
                  createdOn: extras.filter(
                    (arr: string[]) => arr[0] === "createdOn"
                  )[0][1]
                };
              } else {
                if (tkmt.hasOwnProperty(child.name)) {
                  token[child.name] = tkmt[child.name];
                } else {
                  token[child.name] = child.value;
                }
              }
            })
          );

          return token;
        });
        let tokens = await Promise.all(tokensPromise);
        // adds canvas code for each token
        tokens = tokens
          .map(tk => {
            return {
              ...tk,
              ...canvasList.filter(cv => cv.ipfsHash === tk.token_id)[0]
            };
          })
          .map(tk => ({ ...tk, timestamp: tk.extras.createdOn }));
        // sorts list by timestamp
        tokens.sort((a, b) =>
          a.timestamp > b.timestamp ? -1 : b.timestamp > a.timestamp ? 1 : 0
        );
        setTokens(tokens);
        setLoading(false);
      }
    })();
  }, [storage]);
  return (
    <main>
      {loading ? (
        <div className="loader">
          <div>
            Loading{" "}
            {userAddress && userAddress === address ? "your" : "the user's"}{" "}
            profile
          </div>
          <div className="pulsate-fwd">
            <i className="fas fa-user fa-lg"></i>
          </div>
        </div>
      ) : (
        <>
          <h2>
            {userAddress && userAddress === address ? "Your" : "User"} Profile
          </h2>
          <h3 className={styles.user_address}>
            <a
              href={`https://${
                config.ENV === "carthagenet" && "carthage."
              }tzkt.io/${address}/operations`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {address}
            </a>
          </h3>
          <div className={styles.cards}>
            {tokens.length > 0
              ? tokens.map((tk, i) =>
                  CardGenerator({
                    artwork: tk,
                    i,
                    styles,
                    view: View.PROFILE,
                    userAddress,
                    address,
                    location: location.pathname,
                    cart,
                    setCart,
                    refreshStorage,
                    contract,
                    confirmTransfer,
                    flippedCard,
                    setFlippedCard,
                    transferRecipient,
                    setTransferRecipient,
                    newPrice,
                    setNewPrice,
                    confirmNewPrice,
                    burnTokenModal: () =>
                      setModalState({
                        state: ModalState.OPEN,
                        type: ModalType.BURN_TOKEN,
                        header: "Delete this token?",
                        body: "",
                        confirm: () => burnToken(tk.ipfsHash),
                        close: () =>
                          setModalState({
                            state: ModalState.CLOSED,
                            type: ModalType.CLOSED,
                            header: "",
                            body: "",
                            confirm: undefined,
                            close: undefined
                          })
                      })
                  })
                )
              : "No token for this user"}
          </div>
        </>
      )}
      <Modal {...modalState} />
    </main>
  );
};

export default User;

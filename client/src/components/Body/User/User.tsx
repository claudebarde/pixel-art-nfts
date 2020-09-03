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
} from "../../Modal/Modal";

const User: React.FC = () => {
  const {
    storage,
    userAddress,
    cart,
    setCart,
    setStorage,
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
  let { address } = useParams();
  const location = useLocation();

  const confirmTransfer = ipfsHash => {
    setModalState({
      state: ModalState.OPEN,
      type: ModalType.CONFIRM_TRANSFER,
      header: "Confirm token transfer",
      body: "",
      confirm: (recipient: string) => transfer(ipfsHash, recipient),
      close: () =>
        setModalState({
          state: ModalState.CLOSED,
          type: ModalType.CLOSED,
          header: "",
          body: "",
          confirm: undefined,
          close: undefined
        })
    });
  };

  const transfer = async (ipfsHash: string, recipient: string) => {
    if (ipfsHash && recipient) {
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
        tokensOwned = [...ledger.filter(el => el.data.value.value === address)];
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
                // TODO: remove this hack
                // first token created didn't have a createdBy prop
                if (
                  el.data.key_string ===
                  "QmT3o46MhGfA7DQKFipkbkBw4UTc2M4E63V9B2F7WkJbGp"
                )
                  extras.push([
                    "createdBy",
                    "tz1NhNv9g7rtcjyNsH8Zqu79giY5aTqDDrzB"
                  ]);

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
                token[child.name] = child.value;
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
    <div>
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
                    setStorage,
                    contract,
                    confirmTransfer
                  })
                )
              : "No token for this user"}
          </div>
        </>
      )}
      <Modal {...modalState} />
    </div>
  );
};

export default User;

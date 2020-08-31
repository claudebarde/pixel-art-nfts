import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import config from "../../../config";
import { Context } from "../../../Context";
import styles from "./user.module.scss";

const User: React.FC = () => {
  const { storage } = useContext(Context);
  const [loading, setLoading] = useState(true);
  const [tokens, setTokens] = useState<any[]>([]);
  let { address } = useParams();

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
        const tokens: any[] = tokensMetadata.map(el => {
          const children = [...el.data.value.children];
          const token = {};
          children.forEach(async child => {
            if (child.name === "extras") {
              // extras map is not returned by the API request
              const _token: any = await storage?.token_metadata.get(
                el.data.key_string
              );
              const extras: string[][] = Array.from(_token.extras.entries());
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
          });

          return token;
        });

        console.log(tokens);
        setTokens(tokens);
        setLoading(false);
      }
    })();
  }, [storage]);
  return (
    <div>
      {loading ? (
        <div>Loading</div>
      ) : (
        <div className={styles.cards}>
          {tokens.length > 0
            ? tokens.map(tk => <div key={tk.token_id}>Token</div>)
            : "No token for this user"}
        </div>
      )}
    </div>
  );
};

export default User;

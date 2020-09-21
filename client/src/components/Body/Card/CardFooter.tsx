import React from "react";
import ReactTooltip from "react-tooltip";
import Identicon from "identicon.js";
import { NavLink } from "react-router-dom";
import { ToastType } from "../../Toast/Toast";
import { CardFooterProps } from "../../../types";

const CardFooter = ({
  artwork,
  styles,
  address,
  userAddress,
  setToastType,
  setToastText,
  isOwnerConnected,
  setFlippedCard,
  setTransferRecipient,
  display
}: CardFooterProps) => {
  const makeIdenticon = hash => {
    const options = {
      size: 20,
      background: [255, 255, 255, 0],
      saturation: 1,
      brightness: 1
    };
    return new Identicon(hash, options).toString();
  };

  return (
    <div
      className={styles.card__footer}
      style={
        display === "portrait" ? { position: "absolute", bottom: "5px" } : {}
      }
    >
      <div data-tip data-for={`ipfs-link-` + artwork.ipfsHash}>
        <ReactTooltip
          id={`ipfs-link-` + artwork.ipfsHash}
          place="bottom"
          type="info"
          effect="solid"
          multiline={true}
        >
          <span>IPFS link</span>
        </ReactTooltip>
        <a
          href={`https://gateway.pinata.cloud/ipfs/${artwork.ipfsHash}`}
          className={styles.tokenData}
          target="_blank"
          rel="noopener noreferrer"
        >
          <i className="fas fa-cube"></i>
        </a>
      </div>
      <div
        style={{ cursor: "pointer" }}
        onClick={() => {
          const currentPath = window.location.href;
          let path = "";
          if (currentPath.includes("market")) {
            path =
              currentPath.split("market")[0] + "market/" + artwork.ipfsHash;
          } else if (currentPath.includes("profile")) {
            path =
              currentPath.split("profile")[0] +
              "profile/" +
              address +
              "/" +
              artwork.ipfsHash;
          }
          navigator.clipboard.writeText(path);
          setToastType(ToastType.SUCCESS);
          setToastText(<span>Link copied to clipboard!</span>);
        }}
        data-tip
        data-for={`share-link-` + artwork.ipfsHash}
      >
        <ReactTooltip
          id={`share-link-` + artwork.ipfsHash}
          place="bottom"
          type="info"
          effect="solid"
          multiline={true}
        >
          <span>Share link</span>
        </ReactTooltip>
        <i className="fas fa-share-alt"></i>
      </div>
      {(!isOwnerConnected ||
        (isOwnerConnected && userAddress !== artwork.seller)) && (
        <>
          <div data-tip data-for={`identicon-` + artwork.ipfsHash}>
            <ReactTooltip
              id={`identicon-` + artwork.ipfsHash}
              place="bottom"
              type="info"
              effect="solid"
              multiline={true}
            >
              <span>Identicon</span>
            </ReactTooltip>
            <img
              src={`data:image/png;base64,${makeIdenticon(
                artwork.hash || artwork.extras.canvasHash
              )}`}
              title="Unique identicon"
            />
          </div>
          {artwork.seller && (
            <div data-tip data-for={`seller-` + artwork.ipfsHash}>
              <ReactTooltip
                id={`seller-` + artwork.ipfsHash}
                place="bottom"
                type="info"
                effect="solid"
                multiline={true}
              >
                <span>Seller's account</span>
              </ReactTooltip>
              <NavLink to={`/profile/${artwork.seller}`}>
                <i className="fas fa-cash-register"></i>
              </NavLink>
            </div>
          )}
        </>
      )}
      {isOwnerConnected && userAddress === artwork.seller && (
        <div
          style={{ cursor: "pointer" }}
          onClick={() => {
            setFlippedCard(true);
            setTransferRecipient("");
          }}
          data-tip
          data-for={`settings-` + artwork.ipfsHash}
        >
          <ReactTooltip
            id={`settings-` + artwork.ipfsHash}
            place="bottom"
            type="info"
            effect="solid"
            multiline={true}
          >
            <span>Settings</span>
          </ReactTooltip>
          <i className="fas fa-user-cog"></i>
        </div>
      )}
      <div>ꜩ {artwork.price / 1000000}</div>
    </div>
  );
};

export default CardFooter;

import React, { useContext, useEffect, useRef, useState } from "react";
import { Link, useLocation, matchPath } from "react-router-dom";
import ReactTooltip from "react-tooltip";
import styles from "./header.module.scss";
import { Context } from "../../Context";
import ztext from "./ztext-custom";
import {
  State as ModalState,
  ModalProps,
  ModalType,
  Modal
} from "../Modals/Modal";
import WalletModal from "../Modals/WalletModal";
import { disconnectThanos } from "../Modals/walletConnection";

const titleColors = [
  "red",
  "yellow",
  "green",
  "blue",
  "turquoise",
  "grey",
  "orange"
];

const Header: React.FC = () => {
  const {
    userAddress,
    cart,
    contract,
    refreshStorage,
    walletModalOpen,
    setWalletModalOpen,
    setUserAddress,
    setUserBalance,
    Tezos
  } = useContext(Context);
  const title = useRef(null);
  const [zTextTitle] = useState(
    [
      "P",
      "I",
      "X",
      "E",
      "L",
      "&nbsp;",
      "A",
      "R",
      "T",
      "&nbsp;",
      "N",
      "F",
      "T",
      "s"
    ]
      .map(char => {
        const color =
          titleColors[Math.floor(Math.random() * titleColors.length)];
        return `<span data-z class=${color}>${char}</span>`;
      })
      .join("")
  );
  const location = useLocation();
  const [modalState, setModalState] = useState<ModalProps>({
    state: ModalState.CLOSED,
    type: ModalType.CLOSED,
    header: "",
    body: "",
    confirm: undefined,
    close: undefined
  });
  const [address, setAddress] = useState<string>();

  const confirmBuy = async (cart, setCart) => {
    const tokens = cart?.map(item => item.ipfsHash);
    const price = cart?.map(item => item.price).reduce((a, b) => a + b);
    // starts transaction
    try {
      const op = await contract?.methods
        .buy_tokens(tokens)
        .send({ amount: price, mutez: true });
      console.log(op?.opHash);
      await op?.confirmation();
      // empties the cart
      if (setCart && refreshStorage) {
        setCart([]);
        // refreshes the storage
        await refreshStorage();
      }
    } catch (error) {
      console.log(error);
    } finally {
      // closes the modal
      setModalState({
        state: ModalState.CLOSED,
        type: ModalType.CLOSED,
        header: "",
        body: "",
        confirm: undefined,
        close: undefined
      });
    }
  };

  useEffect(() => {
    if (ztext) {
      ztext(title.current, "[data-z]", {
        depth: "1rem",
        direction: "both",
        event: "pointer",
        eventRotation: "40deg",
        eventDirection: "default",
        fade: false,
        layers: 10,
        perspective: "500px",
        z: true
      });
    }
  }, []);

  useEffect(() => {
    const path = matchPath(location.pathname, {
      path: "/profile/:address",
      exact: true,
      strict: false
    });
    if (path) {
      setAddress(path.params.address);
    }
  }, [location]);

  return (
    <header>
      <div className={styles.nav}>
        {userAddress && (
          <div className={styles.account_connected_container}>
            <Link to={`/profile/${userAddress}`}>
              <div className={styles.account_connected}>
                <img
                  src={`https://services.tzkt.io/v1/avatars/${userAddress}`}
                  alt="avatar"
                />
                <span>
                  {userAddress.slice(0, 5) + "..." + userAddress.slice(-5)}
                </span>
              </div>
            </Link>
            <div
              className={styles.logout}
              onClick={() =>
                disconnectThanos(setUserAddress, setUserBalance, Tezos)
              }
            >
              <i className="fas fa-sign-out-alt fa-lg"></i>
            </div>
          </div>
        )}
      </div>
      <div className="title">
        <Link to="/">
          <h1 ref={title} dangerouslySetInnerHTML={{ __html: zTextTitle }}></h1>
        </Link>
      </div>
      <div className={styles.nav}>
        <Link to="/draw" data-tip data-for="new-artowrk-link">
          <ReactTooltip
            id="new-artowrk-link"
            place="bottom"
            type="warning"
            effect="solid"
            multiline={true}
          >
            <span>New artwork</span>
          </ReactTooltip>
          <i
            className="fas fa-palette fa-lg"
            style={
              location.pathname === "/draw"
                ? { color: "#4fd1c5" }
                : { color: "black" }
            }
          ></i>
        </Link>
        <Link to="/market" data-tip data-for="marketplace-link">
          <ReactTooltip
            id="marketplace-link"
            place="bottom"
            type="warning"
            effect="solid"
            multiline={true}
          >
            <span>Marketplace</span>
          </ReactTooltip>
          <i
            className="fas fa-store fa-lg"
            style={
              location.pathname === "/market"
                ? { color: "#4fd1c5" }
                : { color: "black" }
            }
          ></i>
        </Link>
        {!userAddress && (
          <div className={styles.wallet_button}>
            <div
              onClick={() => {
                if (setWalletModalOpen) {
                  setWalletModalOpen(!walletModalOpen);
                }
              }}
              data-tip
              data-for="connect-wallet-link"
            >
              <ReactTooltip
                id="connect-wallet-link"
                place="bottom"
                type="warning"
                effect="solid"
                multiline={true}
              >
                <span>Connect your wallet</span>
              </ReactTooltip>
              <i className="fas fa-wallet fa-lg"></i>
            </div>
          </div>
        )}
        {userAddress && (
          <>
            <div
              onClick={() =>
                setModalState({
                  state: ModalState.OPEN,
                  type: ModalType.CONFIRM_CART,
                  header: "Confirm purchases",
                  body: "",
                  confirm: confirmBuy,
                  close: () => {
                    setModalState({
                      state: ModalState.CLOSED,
                      type: ModalType.CLOSED,
                      header: "",
                      body: "",
                      confirm: undefined,
                      close: undefined
                    });
                  }
                })
              }
              data-tip
              data-for="cart-link"
            >
              <ReactTooltip
                id="cart-link"
                place="bottom"
                type="warning"
                effect="solid"
                multiline={true}
              >
                {cart && cart.length > 0 ? (
                  <span>
                    {cart.length} item{cart.length > 1 ? "s" : ""} in your cart
                  </span>
                ) : (
                  <span>Your cart is empty</span>
                )}
              </ReactTooltip>
              <i
                className={`fas ${
                  cart && cart.length > 0 ? "fa-cart-plus" : "fa-shopping-cart"
                } fa-lg`}
              ></i>
            </div>
          </>
        )}
      </div>
      <Modal {...modalState} />
      {walletModalOpen && <WalletModal close={setWalletModalOpen} />}
    </header>
  );
};

export default Header;

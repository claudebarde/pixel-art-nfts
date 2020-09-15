import React, { useContext, useEffect, useRef, useState } from "react";
import { Link, useLocation, matchPath } from "react-router-dom";
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
    setWalletModalOpen
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
      <div className={styles.nav}></div>
      <div className="title">
        <Link to="/">
          <h1 ref={title} dangerouslySetInnerHTML={{ __html: zTextTitle }}></h1>
        </Link>
      </div>
      <div className={styles.nav}>
        <Link to="/draw">
          <i
            className="fas fa-palette fa-lg"
            style={
              location.pathname === "/draw"
                ? { color: "#4fd1c5" }
                : { color: "black" }
            }
          ></i>
        </Link>
        <Link to="/market">
          <i
            className="fas fa-store fa-lg"
            style={
              location.pathname === "/market"
                ? { color: "#4fd1c5" }
                : { color: "black" }
            }
          ></i>
        </Link>
        <div className={styles.wallet_button}>
          {userAddress ? (
            <Link to={`/profile/${userAddress}`}>
              <i
                className="fas fa-user-check fa-lg"
                style={
                  location.pathname.includes("/profile") &&
                  userAddress === address
                    ? { color: "#4fd1c5" }
                    : { color: "black" }
                }
              ></i>
            </Link>
          ) : (
            <div
              onClick={() => {
                if (setWalletModalOpen) {
                  setWalletModalOpen(!walletModalOpen);
                }
              }}
            >
              <i className="fas fa-wallet fa-lg"></i>
            </div>
          )}
        </div>
        {userAddress && (
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
          >
            <i
              className={`fas ${
                cart && cart.length > 0 ? "fa-cart-plus" : "fa-shopping-cart"
              } fa-lg`}
            ></i>
          </div>
        )}
      </div>
      <Modal {...modalState} />
      {walletModalOpen && <WalletModal close={setWalletModalOpen} />}
    </header>
  );
};

export default Header;

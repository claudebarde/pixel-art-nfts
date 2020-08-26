import React, { useContext } from "react";
import styles from "./header.module.scss";
import line1 from "./templates/template-line-1";
import line2 from "./templates/template-line-2";
import line3 from "./templates/template-line-3";
import line4 from "./templates/template-line-4";
import line5 from "./templates/template-line-5";
import { Context, View } from "../../Context";

const Header: React.FC = () => {
  const { view, setView } = useContext(Context);

  return (
    <header>
      <div></div>
      <div className={styles.grid}>
        {Array(76)
          .fill("0")
          .map((pos, i) => (
            <div key={"pixel-" + i} className={styles.pixel}></div>
          ))}
        {line1.map((pos, i) => {
          if (pos === "0") {
            return <div key={"pixel-" + i} className={styles.pixel}></div>;
          } else {
            return (
              <div
                className={styles.pixel}
                key={"pixel-" + i}
                style={{ backgroundColor: pos }}
              ></div>
            );
          }
        })}
        {line2.map((pos, i) => {
          if (pos === "0") {
            return <div key={"pixel-" + i} className={styles.pixel}></div>;
          } else {
            return (
              <div
                className={styles.pixel}
                key={"pixel-" + i}
                style={{ backgroundColor: pos }}
              ></div>
            );
          }
        })}
        {line3.map((pos, i) => {
          if (pos === "0") {
            return <div key={"pixel-" + i} className={styles.pixel}></div>;
          } else {
            return (
              <div
                className={styles.pixel}
                key={"pixel-" + i}
                style={{ backgroundColor: pos }}
              ></div>
            );
          }
        })}
        {line4.map((pos, i) => {
          if (pos === "0") {
            return <div key={"pixel-" + i} className={styles.pixel}></div>;
          } else {
            return (
              <div
                className={styles.pixel}
                key={"pixel-" + i}
                style={{ backgroundColor: pos }}
              ></div>
            );
          }
        })}
        {line5.map((pos, i) => {
          if (pos === "0") {
            return <div key={"pixel-" + i} className={styles.pixel}></div>;
          } else {
            return (
              <div
                className={styles.pixel}
                key={"pixel-" + i}
                style={{ backgroundColor: pos }}
              ></div>
            );
          }
        })}
        {Array(76)
          .fill("0")
          .map((pos, i) => (
            <div key={"pixel-" + i} className={styles.pixel}></div>
          ))}
      </div>
      <div className={styles.nav}>
        <div onClick={() => setView(View.CANVAS)}>
          <i
            className="fas fa-palette fa-lg"
            style={
              view === View.CANVAS ? { color: "#4fd1c5" } : { color: "black" }
            }
          ></i>
        </div>
        <div onClick={() => setView(View.MARKET)}>
          <i
            className="fas fa-store fa-lg"
            style={
              view === View.MARKET ? { color: "#4fd1c5" } : { color: "black" }
            }
          ></i>
        </div>
        <div>
          <i className="fas fa-wallet fa-lg"></i>
        </div>
      </div>
    </header>
  );
};

export default Header;

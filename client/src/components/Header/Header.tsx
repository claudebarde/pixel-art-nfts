import React from "react";
import styles from "./header.module.scss";
import line1 from "./templates/template-line-1";
import line2 from "./templates/template-line-2";
import line3 from "./templates/template-line-3";
import line4 from "./templates/template-line-4";
import line5 from "./templates/template-line-5";

const Header: React.FC = () => {
  return (
    <header>
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
    </header>
  );
};

export default Header;

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "./Home.module.scss";
import { Canvas } from "../../../types";

const defaultLargeCanvas = (): Canvas =>
  Array(48)
    .fill("")
    .map(el => Array(48).fill("transparent"));

const Home: React.FC = () => {
  const [largeCanvas, setLargeCanvas] = useState(defaultLargeCanvas());
  const [animatedPixels, setAnimatedPixels] = useState<number[]>([]);

  const createAnimation = async () => {
    const response = await fetch(
      "https://gateway.pinata.cloud/ipfs/QmayaQ8xiprjyK7TbLQdkeaqAWo4RwYJt3fe9uwTsLcDkh"
    );
    const data = await response.json();
    setLargeCanvas(data.canvas);
  };

  useEffect(() => {
    createAnimation();

    const interval = setInterval(() => {
      let min = 0;
      let max = 48 * 48;
      let pixels: number[] = [];
      const nrOfPixels: number = Math.round(Math.random() * (5 - 1) + 1);
      for (let i = 0; i < nrOfPixels; i++) {
        pixels.push(Math.round(Math.random() * (max - min) + min));
      }
      setAnimatedPixels(pixels);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.main}>
      <div className={styles.container}>
        <div className={styles.container__content}>
          <h1>
            Create and sell <br /> your pixel art creations <br />
            on the Tezos blockchain
          </h1>
          <br />
          <br />
          <Link to="/draw">
            <button className="button large info">
              <span>
                <i className="fas fa-palette fa-lg"></i> Start drawing!
              </span>
            </button>
          </Link>
        </div>
        <div>
          <div className={styles.grid}>
            {largeCanvas.map((row, rowIndex) =>
              row.map((bgColor, columnIndex) => {
                const pixelPos =
                  rowIndex === 0 ? columnIndex : rowIndex * 48 + columnIndex;
                return (
                  <div
                    key={`pixel-home-` + columnIndex}
                    className={styles.grid__box}
                  >
                    <div
                      className={`${styles.pixel} ${
                        animatedPixels.includes(pixelPos)
                          ? styles.animate_pixel
                          : ""
                      }`}
                      id={`pixel-${pixelPos}`}
                      style={{
                        backgroundColor: bgColor
                      }}
                    ></div>
                    {/*<div
                    className={styles.pixel}
                    style={{
                      animationDuration: Math.random() * (10 - 1) + 1 + "s",
                      backgroundColor: bgColor,
                      margin: calcStartPos(rowIndex, columnIndex)
                    }}
                  ></div>*/}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

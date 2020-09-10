import React, { useContext, useRef, useEffect, useState } from "react";
import moment from "moment";
import styles from "./artworkmodal.module.scss";
import { Context } from "../../Context";
import { ArtworkListElement, View, GridSize } from "../../types";

const ArtworkModal: React.FC<{ close: any; artwork: ArtworkListElement }> = ({
  close,
  artwork
}) => {
  const { view } = useContext(Context);
  const canvasRef = useRef<any>();
  const [gridSize, setGridSize] = useState<GridSize>();
  const [pixelSize, setPixelSize] = useState(0);

  const drawCanvas = (ctx, grid, size) => {
    let counter = 0;
    let delay = size === GridSize.Small ? 15 : size === GridSize.Medium ? 2 : 1;

    grid.forEach((row, i1) => {
      row.forEach((color, i2) => {
        counter++;
        setTimeout(() => {
          ctx.fillStyle = color;
          ctx.fillRect(i2 * pixelSize, i1 * pixelSize, pixelSize, pixelSize);
        }, counter * delay);
      });
    });
  };

  useEffect(() => {
    setGridSize(artwork.size);
    if (canvasRef.current) {
      const canvasObj = canvasRef.current;
      const ctx = canvasObj.getContext("2d");
      if (ctx) {
        if (artwork.size === GridSize.Small) {
          setPixelSize(6);
        } else if (artwork.size === GridSize.Medium) {
          setPixelSize(3);
        } else if (artwork.size === GridSize.Large) {
          setPixelSize(2);
        }
        drawCanvas(ctx, artwork.canvas, artwork.size);
      }
    }
  }, [pixelSize]);

  return (
    <div className={styles.modal_container}>
      <div className={styles.modal}>
        <div className={styles.modal__header}>
          {artwork.name} by{" "}
          {artwork.artistName && artwork.artistName !== "unknown"
            ? artwork.artistName
            : artwork.author.slice(0, 5) + "..." + artwork.author.slice(-5)}
        </div>
        <div className={styles.modal__body}>
          <div className={styles.modal__body_p}>
            <canvas
              id="artwork"
              ref={canvasRef}
              width={
                gridSize === GridSize.Small
                  ? 12 * pixelSize
                  : gridSize === GridSize.Medium
                  ? 32 * pixelSize
                  : 64 * pixelSize
              }
              height={
                gridSize === GridSize.Small
                  ? 12 * pixelSize
                  : gridSize === GridSize.Medium
                  ? 32 * pixelSize
                  : 64 * pixelSize
              }
            ></canvas>
          </div>
          <div className={styles.modal__body_p}>
            Created on{" "}
            {moment.unix(artwork.timestamp / 1000).format("MM/DD/YYYY")}
          </div>
          <div className={styles.modal__body_p}>
            ꜩ {artwork.price / 1000000}
          </div>
        </div>
        <div className={styles.modal__buttons}>
          {view === View.PROFILE ? (
            <button className="button info">Download</button>
          ) : (
            <button className="button info">Buy</button>
          )}
          <button className="button error" onClick={() => close(false)}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArtworkModal;

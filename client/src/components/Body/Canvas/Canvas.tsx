import React, { useContext, useEffect, useState } from "react";
import Pickr from "@simonwep/pickr";
import "@simonwep/pickr/dist/themes/classic.min.css";
import styles from "./canvas.module.scss";
import { Context, GridSize } from "../../../Context";

const [blockNumberSmall, blockNumberMedium, blockNumberLarge]: number[] = [
  12,
  32,
  48
];

const Canvas: React.FC = () => {
  const { gridSize, setGridSize } = useContext(Context);
  const [smallCanvas, setSmallCanvas] = useState(
    Array(blockNumberSmall)
      .fill("")
      .map(el => Array(blockNumberSmall).fill("#ffffff"))
  );
  const [mediumCanvas, setMediumCanvas] = useState(
    Array(blockNumberMedium)
      .fill("")
      .map(el => Array(blockNumberMedium).fill("#ffffff"))
  );
  const [largeCanvas, setLargeCanvas] = useState(
    Array(blockNumberLarge)
      .fill("")
      .map(el => Array(blockNumberLarge).fill("#ffffff"))
  );
  const [currentColor, setCurrentColor] = useState("#42445a");

  useEffect(() => {
    const pickr = Pickr.create({
      el: "#color-picker",
      theme: "classic",
      default: "#42445a",

      swatches: [
        "rgba(244, 67, 54, 1)",
        "rgba(233, 30, 99, 0.95)",
        "rgba(156, 39, 176, 0.9)",
        "rgba(103, 58, 183, 0.85)",
        "rgba(63, 81, 181, 0.8)",
        "rgba(33, 150, 243, 0.75)",
        "rgba(3, 169, 244, 0.7)",
        "rgba(0, 188, 212, 0.7)",
        "rgba(0, 150, 136, 0.75)",
        "rgba(76, 175, 80, 0.8)",
        "rgba(139, 195, 74, 0.85)",
        "rgba(205, 220, 57, 0.9)",
        "rgba(255, 235, 59, 0.95)",
        "rgba(255, 193, 7, 1)"
      ],

      components: {
        // Main components
        preview: true,
        opacity: true,
        hue: true,

        // Input / output Options
        interaction: {
          hex: true,
          rgba: true,
          input: true,
          clear: true,
          save: true
        }
      }
    });
    pickr.on("save", color => {
      if (color) setCurrentColor(color.toHEXA().toString());
      pickr.hide();
    });
  }, []);

  return (
    <main>
      <div className={styles.layout}>
        <div className={styles.layout__tools}>
          <h2>
            <i className="fas fa-toolbox"></i> Tool Box
          </h2>
          <p>Canvas Size</p>
          <label htmlFor="12x12-grid">
            <input
              id="12x12-grid"
              type="radio"
              name="grid-size"
              value="12x12"
              checked={gridSize === GridSize.Small}
              onChange={() => setGridSize(GridSize.Small)}
            />
            12x12
          </label>
          <label htmlFor="32x32-grid">
            <input
              id="32x32-grid"
              type="radio"
              name="grid-size"
              value="32x32"
              checked={gridSize === GridSize.Medium}
              onChange={() => setGridSize(GridSize.Medium)}
            />
            32x32
          </label>
          <label htmlFor="64x64-grid">
            <input
              id="64x64-grid"
              type="radio"
              name="grid-size"
              value="64x64"
              checked={gridSize === GridSize.Large}
              onChange={() => setGridSize(GridSize.Large)}
            />
            64x64
          </label>
          <p>Color Picker</p>
          <div id="color-picker"></div>
        </div>
        <div className={styles.layout__canvas}>
          <div>
            <h2>Draw your pixel art below</h2>
            {/* Small Grid */}
            {gridSize === GridSize.Small && (
              <div className={styles.pixelGridSmall}>
                {smallCanvas.map((row, i1) =>
                  row.map((bgColor, i2) => (
                    <div
                      key={i1.toString() + i2.toString()}
                      className={styles.pixel}
                      style={{ backgroundColor: bgColor }}
                      onClick={() => {
                        //console.log(`row: ${i1} ; column: ${i2}`);
                        // updates color in `smallCanvas` variable
                        const newCanvas: string[][] = [...smallCanvas];
                        newCanvas[i1][i2] = currentColor;
                        setSmallCanvas(newCanvas);
                      }}
                    ></div>
                  ))
                )}
              </div>
            )}
            {/* Medium Grid */}
            {gridSize === GridSize.Medium && (
              <div className={styles.pixelGridMedium}>
                {mediumCanvas.map((row, i1) =>
                  row.map((bgColor, i2) => (
                    <div
                      key={i1.toString() + i2.toString()}
                      className={styles.pixel}
                      style={{ backgroundColor: bgColor }}
                      onClick={() => {
                        // updates color in `smallCanvas` variable
                        const newCanvas: string[][] = [...mediumCanvas];
                        newCanvas[i1][i2] = currentColor;
                        setMediumCanvas(newCanvas);
                      }}
                    ></div>
                  ))
                )}
              </div>
            )}
            {/* Large Grid */}
            {gridSize === GridSize.Large && (
              <div className={styles.pixelGridLarge}>
                {largeCanvas.map((row, i1) =>
                  row.map((bgColor, i2) => (
                    <div
                      key={i1.toString() + i2.toString()}
                      className={styles.pixel}
                      style={{ backgroundColor: bgColor }}
                      onClick={() => {
                        // updates color in `smallCanvas` variable
                        const newCanvas: string[][] = [...largeCanvas];
                        newCanvas[i1][i2] = currentColor;
                        setLargeCanvas(newCanvas);
                      }}
                    ></div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Canvas;

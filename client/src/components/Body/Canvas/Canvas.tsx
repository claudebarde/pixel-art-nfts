import React, { useContext, useEffect, useState, useRef } from "react";
import Pickr from "@simonwep/pickr";
import "@simonwep/pickr/dist/themes/classic.min.css";
import styles from "./canvas.module.scss";
import { Context, GridSize } from "../../../Context";

const [blockNumberSmall, blockNumberMedium, blockNumberLarge]: number[] = [
  12,
  32,
  48
];

const bgColor = "#f7fafc";
const brushColor = "#42445a";
const defaultSmallCanvas = (): string[][] =>
  Array(blockNumberSmall)
    .fill("")
    .map(el => Array(blockNumberSmall).fill(bgColor));
const defaultMediumCanvas = (): string[][] =>
  Array(blockNumberMedium)
    .fill("")
    .map(el => Array(blockNumberMedium).fill(bgColor));
const defaultLargeCanvas = (): string[][] =>
  Array(blockNumberLarge)
    .fill("")
    .map(el => Array(blockNumberLarge).fill(bgColor));

const Canvas: React.FC = () => {
  const { gridSize, setGridSize } = useContext(Context);
  const [smallCanvas, setSmallCanvas] = useState(defaultSmallCanvas());
  const [mediumCanvas, setMediumCanvas] = useState(defaultMediumCanvas());
  const [largeCanvas, setLargeCanvas] = useState(defaultLargeCanvas());
  const [colorPicker, setColorPicker] = useState(undefined);
  const [bgColorPicker, setBgColorPicker] = useState(undefined);
  const activeBrushColor = useRef(brushColor);
  const activeBgColor = useRef(bgColor);
  const activeSmallCanvas = useRef([...smallCanvas]);
  const activeMediumCanvas = useRef([...mediumCanvas]);
  const activeLargeCanvas = useRef([...largeCanvas]);
  const activeGridSize = useRef(GridSize.Small);

  const resetCanvas = () => {
    colorPicker.setColor(brushColor);
    bgColorPicker.setColor(bgColor);
    setSmallCanvas(defaultSmallCanvas());
    activeSmallCanvas.current = defaultSmallCanvas();
    setMediumCanvas(defaultMediumCanvas());
    activeMediumCanvas.current = defaultMediumCanvas();
    setLargeCanvas(defaultLargeCanvas());
    activeLargeCanvas.current = defaultLargeCanvas();
  };

  useEffect(() => {
    // brush color picker
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
          cancel: false,
          clear: true,
          save: true
        }
      }
    });
    pickr.on("save", color => {
      if (color) {
        const newColor = color.toHEXA().toString().toLowerCase();
        activeBrushColor.current = newColor;
      }
      pickr.hide();
    });
    setColorPicker(pickr);
    // background color picker
    const bgPickr = Pickr.create({
      el: "#bg-color-picker",
      theme: "classic",
      default: "#f7fafc",

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
          cancel: false,
          clear: true,
          save: true
        }
      }
    });
    bgPickr.on("save", color => {
      if (color) {
        const newColor = color.toHEXA().toString().toLowerCase();
        //console.log("colors:", activeBgColor.current, newColor);
        // updates all the background color in the current canvas
        if (activeGridSize.current === GridSize.Small) {
          const newCanvas = [...activeSmallCanvas.current].map(row =>
            row.map(currentColor => {
              if (currentColor === activeBgColor.current) {
                return newColor;
              } else {
                return currentColor;
              }
            })
          );
          setSmallCanvas(newCanvas);
          activeSmallCanvas.current = newCanvas;
        } else if (activeGridSize.current === GridSize.Medium) {
          const newCanvas = [...activeMediumCanvas.current].map(row =>
            row.map(currentColor => {
              if (currentColor === activeBgColor.current) {
                return newColor;
              } else {
                return currentColor;
              }
            })
          );
          setMediumCanvas(newCanvas);
          activeMediumCanvas.current = newCanvas;
        } else if (activeGridSize.current === GridSize.Large) {
        }
        // updates the background color
        activeBgColor.current = newColor;
      }
      bgPickr.hide();
    });
    setBgColorPicker(bgPickr);
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
              onChange={() => {
                setGridSize(GridSize.Small);
                activeGridSize.current = GridSize.Small;
                resetCanvas();
              }}
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
              onChange={() => {
                setGridSize(GridSize.Medium);
                activeGridSize.current = GridSize.Medium;
                resetCanvas();
              }}
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
              onChange={() => {
                setGridSize(GridSize.Large);
                activeGridSize.current = GridSize.Large;
                resetCanvas();
              }}
            />
            64x64
          </label>
          <p>Color Picker</p>
          <div className={styles.colorPickerContainer}>
            <div>
              <div id="color-picker" className={styles.colorpicker}></div>
              <div>
                <em>Brush color</em>
              </div>
            </div>
            <div>
              <div id="bg-color-picker" className={styles.colorpicker}></div>
              <div>
                <em>Background color</em>
              </div>
            </div>
          </div>
          <p>Options</p>
          <ul>
            <li>Hide the grid</li>
            <li onClick={resetCanvas}>Reset the grid</li>
          </ul>
          <p>Upload</p>
          <div>Give it a name</div>
          <div>Add a price</div>
          <div>Add your name (optional)</div>
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
                        newCanvas[i1][i2] = activeBrushColor.current;
                        setSmallCanvas(newCanvas);
                        activeSmallCanvas.current = newCanvas;
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
                        newCanvas[i1][i2] = activeBrushColor.current;
                        setMediumCanvas(newCanvas);
                        activeMediumCanvas.current = newCanvas;
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
                        newCanvas[i1][i2] = activeBrushColor.current;
                        setLargeCanvas(newCanvas);
                        activeLargeCanvas.current = newCanvas;
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

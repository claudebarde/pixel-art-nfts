import React, { useContext, useEffect, useState, useRef } from "react";
import Pickr from "@simonwep/pickr";
import "@simonwep/pickr/dist/themes/classic.min.css";
import styles from "./canvas.module.scss";
import { Context, GridSize } from "../../../Context";
import { State as ModalState, ModalProps, Modal } from "../../Modal/Modal";

interface IPFSObject {
  canvas: string;
  size: number;
  createdOn: number;
  author: string;
  name: string;
  artistName?: string;
}

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
  const { gridSize, setGridSize, userAddress } = useContext(Context);
  const [smallCanvas, setSmallCanvas] = useState(defaultSmallCanvas());
  const [mediumCanvas, setMediumCanvas] = useState(defaultMediumCanvas());
  const [largeCanvas, setLargeCanvas] = useState(defaultLargeCanvas());
  const [colorPicker, setColorPicker] = useState<Pickr | undefined>();
  const [bgColorPicker, setBgColorPicker] = useState<Pickr | undefined>();
  const [displayGrid, setDisplayGrid] = useState(true);
  const activeBrushColor = useRef(brushColor);
  const activeBgColor = useRef(bgColor);
  const activeSmallCanvas = useRef([...smallCanvas]);
  const activeMediumCanvas = useRef([...mediumCanvas]);
  const activeLargeCanvas = useRef([...largeCanvas]);
  const activeGridSize = useRef(GridSize.Small);
  const [showArtName, setShowArtName] = useState(false);
  const [showPrice, setShowPrice] = useState(false);
  const [showArtistName, setShowArtistName] = useState(false);
  const [artName, setArtName] = useState("masterpiece");
  const [price, setPrice] = useState(3);
  const [artistName, setArtistName] = useState("Claude B.");
  const [modalState, setModalState] = useState<ModalProps>({
    state: ModalState.CLOSED,
    header: "",
    body: "",
    confirm: undefined,
    close: undefined
  });

  const resetCanvas = () => {
    if (colorPicker && bgColorPicker) {
      colorPicker.setColor(brushColor);
      bgColorPicker.setColor(bgColor);
      setSmallCanvas(defaultSmallCanvas());
      activeSmallCanvas.current = defaultSmallCanvas();
      setMediumCanvas(defaultMediumCanvas());
      activeMediumCanvas.current = defaultMediumCanvas();
      setLargeCanvas(defaultLargeCanvas());
      activeLargeCanvas.current = defaultLargeCanvas();
    }
  };

  const updateCanvas = (
    pos1: number,
    pos2: number,
    canvas: string[][]
  ): string[][] => {
    // updates color in `smallCanvas` variable
    const newCanvas: string[][] = [...canvas];
    if (newCanvas[pos1][pos2] === activeBrushColor.current) {
      // user clicks on a block with the same color as the brush
      newCanvas[pos1][pos2] = activeBgColor.current;
    } else {
      newCanvas[pos1][pos2] = activeBrushColor.current;
    }
    return newCanvas;
  };

  const upload = (emptyCanvas: boolean) => {
    if (!artName || !price || !artistName) return;

    if (gridSize === GridSize.Small) {
      // for the small canvas
      if (
        smallCanvas.flat(2).reduce((a, b) => {
          if (a === b) return a;

          return "";
        }) &&
        !emptyCanvas
      ) {
        // canvas is made of the same color
        setModalState({
          state: ModalState.OPEN,
          header: "Empty canvas",
          body:
            "Your canvas appears to be empty, are you sure you want to upload it?",
          confirm: () => upload(true),
          close: () =>
            setModalState({
              state: ModalState.CLOSED,
              header: "",
              body: "",
              confirm: undefined,
              close: undefined
            })
        });
        return;
      }
    } else if (gridSize === GridSize.Medium) {
      // for the medium canvas
      if (
        mediumCanvas.flat(2).reduce((a, b) => {
          if (a === b) return a;

          return "";
        }) &&
        !emptyCanvas
      ) {
        // canvas is made of the same color
        setModalState({
          state: ModalState.OPEN,
          header: "Empty canvas",
          body:
            "Your canvas appears to be empty, are you sure you want to upload it?",
          confirm: () => upload(true),
          close: () =>
            setModalState({
              state: ModalState.CLOSED,
              header: "",
              body: "",
              confirm: undefined,
              close: undefined
            })
        });
        return;
      }
    } else if (gridSize === GridSize.Large) {
      // for the large canvas
      if (
        largeCanvas.flat(2).reduce((a, b) => {
          if (a === b) return a;

          return "";
        }) &&
        !emptyCanvas
      ) {
        // canvas is made of the same color
        setModalState({
          state: ModalState.OPEN,
          header: "Empty canvas",
          body:
            "Your canvas appears to be empty, are you sure you want to upload it?",
          confirm: () => upload(true),
          close: () =>
            setModalState({
              state: ModalState.CLOSED,
              header: "",
              body: "",
              confirm: undefined,
              close: undefined
            })
        });
        return;
      }
    }
    let canvasJSON: string = "";
    if (gridSize === 1) {
      // small canvas
      canvasJSON = JSON.stringify(smallCanvas);
    } else if (gridSize === 2) {
      // medium canvas
      canvasJSON = JSON.stringify(mediumCanvas);
    } else if (gridSize === 3) {
      // small canvas
      canvasJSON = JSON.stringify(largeCanvas);
    }
    if (canvasJSON && userAddress) {
      const timestamp = Date.now();
      const IPFSObject: IPFSObject = {
        canvas: canvasJSON,
        size: gridSize as number,
        createdOn: timestamp,
        author: userAddress as string,
        name: artName,
        artistName: showArtistName ? artistName : ""
      };
    }
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
          <p className={styles.menu_title}>Canvas Size</p>
          <div className={styles.menu_list}>
            <label
              htmlFor="12x12-grid"
              className={
                gridSize === GridSize.Small ? styles.active : undefined
              }
            >
              <input
                id="12x12-grid"
                type="radio"
                name="grid-size"
                value="12x12"
                checked={gridSize === GridSize.Small}
                onChange={() => {
                  if (setGridSize) setGridSize(GridSize.Small);
                  activeGridSize.current = GridSize.Small;
                  resetCanvas();
                }}
              />
              <span>12x12</span>
            </label>
            <label
              htmlFor="32x32-grid"
              className={
                gridSize === GridSize.Medium ? styles.active : undefined
              }
            >
              <input
                id="32x32-grid"
                type="radio"
                name="grid-size"
                value="32x32"
                checked={gridSize === GridSize.Medium}
                onChange={() => {
                  if (setGridSize) setGridSize(GridSize.Medium);
                  activeGridSize.current = GridSize.Medium;
                  resetCanvas();
                }}
              />
              <span>32x32</span>
            </label>
            <label
              htmlFor="64x64-grid"
              className={
                gridSize === GridSize.Large ? styles.active : undefined
              }
            >
              <input
                id="64x64-grid"
                type="radio"
                name="grid-size"
                value="64x64"
                checked={gridSize === GridSize.Large}
                onChange={() => {
                  if (setGridSize) setGridSize(GridSize.Large);
                  activeGridSize.current = GridSize.Large;
                  resetCanvas();
                }}
              />
              <span>64x64</span>
            </label>
          </div>
          <p className={styles.menu_title}>Color Picker</p>
          <div className={styles.menu_list}>
            <div className={styles.colorPickerContainer}>
              <div id="color-picker" className={styles.colorpicker}></div>
              <div>
                <em>Brush color</em>
              </div>
            </div>
            <div className={styles.colorPickerContainer}>
              <div id="bg-color-picker" className={styles.colorpicker}></div>
              <div>
                <em>Background color</em>
              </div>
            </div>
          </div>
          <p className={styles.menu_title}>Options</p>
          <div className={styles.menu_list}>
            {displayGrid ? (
              <p onClick={() => setDisplayGrid(false)}>Hide the grid</p>
            ) : (
              <p onClick={() => setDisplayGrid(true)}>Show the grid</p>
            )}
            <p onClick={resetCanvas}>Reset the grid</p>
          </div>
          <p className={styles.menu_title}>Upload</p>
          <div className={styles.menu_list}>
            <div onClick={() => setShowArtName(!showArtName)}>
              <i className="fas fa-chevron-down"></i> Give it a name
            </div>
            {showArtName && (
              <div>
                <input
                  type="text"
                  placeholder="Name of your piece"
                  onChange={e => setArtName(e.target.value)}
                  value={artName}
                />
              </div>
            )}
            <div onClick={() => setShowPrice(!showPrice)}>
              <i className="fas fa-chevron-down"></i> Add a price
            </div>
            {showPrice && (
              <div>
                <input
                  type="number"
                  placeholder="Price in XTZ"
                  onChange={e => setPrice(+e.target.value)}
                  value={price}
                />
              </div>
            )}
            <div onClick={() => setShowArtistName(!showArtistName)}>
              <i className="fas fa-chevron-down"></i> Add your name (optional)
            </div>
            {showArtistName && (
              <div>
                <input
                  type="text"
                  placeholder="Your name"
                  onChange={e => setArtistName(e.target.value)}
                  value={artistName}
                />
              </div>
            )}
            <div>
              <button
                disabled={!artName || !price || !artistName}
                className={`button ${
                  artName && price && artistName ? "info" : "disabled"
                }`}
                onClick={() => upload(false)}
              >
                <i className="fas fa-file-upload"></i> Upload
              </button>
            </div>
          </div>
        </div>
        <div className={styles.layout__canvas}>
          <h2>
            <i className="fas fa-paint-brush"></i> Draw your pixel art below
          </h2>
          <div>
            {/* Small Grid */}
            {gridSize === GridSize.Small && (
              <div
                className={styles.pixelGridSmall}
                style={{
                  borderBottom: displayGrid ? "solid 1px black" : "none",
                  borderRight: displayGrid ? "solid 1px black" : "none"
                }}
              >
                {smallCanvas.map((row, i1) =>
                  row.map((bgColor, i2) => (
                    <div
                      key={i1.toString() + i2.toString()}
                      className={styles.pixel}
                      style={{
                        backgroundColor: bgColor,
                        borderTop: displayGrid ? "solid 1px black" : "none",
                        borderLeft: displayGrid ? "solid 1px black" : "none"
                      }}
                      onMouseDown={() => {
                        //console.log(`row: ${i1} ; column: ${i2}`);
                        // updates color in `smallCanvas` variable
                        const newCanvas: string[][] = updateCanvas(i1, i2, [
                          ...smallCanvas
                        ]);
                        setSmallCanvas(newCanvas);
                        activeSmallCanvas.current = newCanvas;
                      }}
                      onMouseEnter={event => {
                        // draw as user drags the mouse
                        if (event.buttons === 1) {
                          // updates color in `smallCanvas` variable
                          const newCanvas: string[][] = updateCanvas(i1, i2, [
                            ...smallCanvas
                          ]);
                          setSmallCanvas(newCanvas);
                          activeSmallCanvas.current = newCanvas;
                        }
                      }}
                    ></div>
                  ))
                )}
              </div>
            )}
            {/* Medium Grid */}
            {gridSize === GridSize.Medium && (
              <div
                className={styles.pixelGridMedium}
                style={{
                  borderBottom: displayGrid ? "solid 1px black" : "none",
                  borderRight: displayGrid ? "solid 1px black" : "none"
                }}
              >
                {mediumCanvas.map((row, i1) =>
                  row.map((bgColor, i2) => (
                    <div
                      key={i1.toString() + i2.toString()}
                      className={styles.pixel}
                      style={{
                        backgroundColor: bgColor,
                        borderTop: displayGrid ? "solid 1px black" : "none",
                        borderLeft: displayGrid ? "solid 1px black" : "none"
                      }}
                      onMouseDown={() => {
                        // updates color in `smallCanvas` variable
                        const newCanvas: string[][] = updateCanvas(i1, i2, [
                          ...mediumCanvas
                        ]);
                        setMediumCanvas(newCanvas);
                        activeMediumCanvas.current = newCanvas;
                      }}
                      onMouseEnter={event => {
                        // draw as user drags the mouse
                        if (event.buttons === 1) {
                          // updates color in `smallCanvas` variable
                          const newCanvas: string[][] = updateCanvas(i1, i2, [
                            ...mediumCanvas
                          ]);
                          setSmallCanvas(newCanvas);
                          activeSmallCanvas.current = newCanvas;
                        }
                      }}
                    ></div>
                  ))
                )}
              </div>
            )}
            {/* Large Grid */}
            {gridSize === GridSize.Large && (
              <div
                className={styles.pixelGridLarge}
                style={{
                  borderBottom: displayGrid ? "solid 1px black" : "none",
                  borderRight: displayGrid ? "solid 1px black" : "none"
                }}
              >
                {largeCanvas.map((row, i1) =>
                  row.map((bgColor, i2) => (
                    <div
                      key={i1.toString() + i2.toString()}
                      className={styles.pixel}
                      style={{
                        backgroundColor: bgColor,
                        borderTop: displayGrid ? "solid 1px black" : "none",
                        borderLeft: displayGrid ? "solid 1px black" : "none"
                      }}
                      onMouseDown={() => {
                        // updates color in `smallCanvas` variable
                        const newCanvas: string[][] = updateCanvas(i1, i2, [
                          ...largeCanvas
                        ]);
                        setLargeCanvas(newCanvas);
                        activeLargeCanvas.current = newCanvas;
                      }}
                      onMouseEnter={event => {
                        // draw as user drags the mouse
                        if (event.buttons === 1) {
                          // updates color in `smallCanvas` variable
                          const newCanvas: string[][] = updateCanvas(i1, i2, [
                            ...largeCanvas
                          ]);
                          setSmallCanvas(newCanvas);
                          activeSmallCanvas.current = newCanvas;
                        }
                      }}
                    ></div>
                  ))
                )}
              </div>
            )}
          </div>
          <div></div>
        </div>
      </div>
      <Modal {...modalState} />
    </main>
  );
};

export default Canvas;

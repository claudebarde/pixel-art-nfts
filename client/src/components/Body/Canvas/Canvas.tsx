import React, {
  useContext,
  useEffect,
  useState,
  useRef,
  ReactNode
} from "react";
import Pickr from "@simonwep/pickr";
import "@simonwep/pickr/dist/themes/classic.min.css";
import { MichelsonMap } from "@taquito/taquito";
import styles from "./canvas.module.scss";
import { Context } from "../../../Context";
import { GridSize, Canvas, CursorType } from "../../../types";
import {
  State as ModalState,
  ModalProps,
  ModalType,
  Modal
} from "../../Modals/Modal";
import config from "../../../config";
import { IPFSObject, TokenMetadata } from "../../../types";
import { saveCanvas, loadCanvas } from "./localCanvas";
import { Toast, ToastType } from "../../Toast/Toast";
import WalletModal from "../../Modals/WalletModal";

const [blockNumberSmall, blockNumberMedium, blockNumberLarge]: number[] = [
  12,
  32,
  48
];

const bgColor = "#f7fafc";
const brushColor = "#42445a";
const defaultPalette = ["#ffffff", "#42445a", "#f7fafc", "#ffffff"];
const defaultSmallCanvas = (): Canvas =>
  Array(blockNumberSmall)
    .fill("")
    .map(el => Array(blockNumberSmall).fill(bgColor));
const defaultMediumCanvas = (): Canvas =>
  Array(blockNumberMedium)
    .fill("")
    .map(el => Array(blockNumberMedium).fill(bgColor));
const defaultLargeCanvas = (): Canvas =>
  Array(blockNumberLarge)
    .fill("")
    .map(el => Array(blockNumberLarge).fill(bgColor));

const CanvasPainting: React.FC = () => {
  const {
    gridSize,
    setGridSize,
    userAddress,
    contract,
    network,
    refreshStorage,
    walletModalOpen,
    setWalletModalOpen
  } = useContext(Context);
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
  const [modalState, setModalState] = useState<ModalProps>({
    state: ModalState.CLOSED,
    type: ModalType.CLOSED,
    header: "",
    body: "",
    confirm: undefined,
    close: undefined
  });
  const [loadingNewToken, setLoadingNewToken] = useState(false);
  const [lastUsedColors, setLastUsedColors] = useState(defaultPalette);
  const activeLastUsedColors = useRef(defaultPalette);
  const [savedCanvas, setSavedCanvas] = useState<boolean>(false);
  const [errorSavingToken, setErrorSavingToken] = useState(false);
  const [toastText, setToastText] = useState<ReactNode>();
  const [toastType, setToastType] = useState<ToastType>(ToastType.DEFAULT);
  const [cursorType, setCursorType] = useState<CursorType>(CursorType.PEN);

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

  const updateCanvas = (pos1: number, pos2: number, canvas: Canvas): Canvas => {
    // updates color in `smallCanvas` variable
    const newCanvas: Canvas = [...canvas];
    if (newCanvas[pos1][pos2] === activeBrushColor.current) {
      // user clicks on a block with the same color as the brush
      newCanvas[pos1][pos2] = activeBgColor.current;
    } else {
      newCanvas[pos1][pos2] = activeBrushColor.current;
    }
    return newCanvas;
  };

  const upload = async (emptyCanvas: boolean) => {
    if (!userAddress) return;

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
          type: ModalType.EMPTY_CANVAS,
          header: "Empty canvas",
          body:
            "Your canvas appears to be empty, are you sure you want to upload it?",
          confirm: () => upload(true),
          close: () =>
            setModalState({
              state: ModalState.CLOSED,
              type: ModalType.CLOSED,
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
          type: ModalType.EMPTY_CANVAS,
          header: "Empty canvas",
          body:
            "Your canvas appears to be empty, are you sure you want to upload it?",
          confirm: () => upload(true),
          close: () =>
            setModalState({
              state: ModalState.CLOSED,
              type: ModalType.CLOSED,
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
          type: ModalType.EMPTY_CANVAS,
          header: "Empty canvas",
          body:
            "Your canvas appears to be empty, are you sure you want to upload it?",
          confirm: () => upload(true),
          close: () =>
            setModalState({
              state: ModalState.CLOSED,
              type: ModalType.CLOSED,
              header: "",
              body: "",
              confirm: undefined,
              close: undefined
            })
        });
        return;
      }
    }

    setModalState({
      state: ModalState.OPEN,
      type: ModalType.CONFIRM_NEW_TOKEN,
      header: "Confirm new tokenized pixel art",
      body: "",
      confirm: tkmt => createNewToken(tkmt),
      close: () =>
        setModalState({
          state: ModalState.CLOSED,
          type: ModalType.CLOSED,
          header: "",
          body: "",
          confirm: undefined,
          close: undefined
        })
    });
  };

  const createNewToken = async (
    tkmt: Omit<TokenMetadata, "token_id, decimals, extras">
  ) => {
    setLoadingNewToken(true);

    let canvas: Canvas;
    if (gridSize === GridSize.Small) {
      // small canvas
      canvas = smallCanvas;
    } else if (gridSize === GridSize.Medium) {
      // medium canvas
      canvas = mediumCanvas;
    } else if (gridSize === GridSize.Large) {
      // small canvas
      canvas = largeCanvas;
    } else {
      canvas = [[""]];
    }
    if (canvas && canvas.length > 1 && userAddress) {
      const IPFSObject: IPFSObject = {
        canvas,
        size: gridSize as number,
        author: userAddress as string,
        name: tkmt.name,
        artistName: tkmt.artistName
      };

      const PinPixelArt =
        process.env.NODE_ENV === "development"
          ? `http://localhost:${config.NETLIFY_PORT}/pinPixelArt`
          : "https://pixel-art-nfts.netlify.app/.netlify/functions/pinPixelArt";

      let data;
      try {
        data = await fetch(PinPixelArt, {
          body: JSON.stringify(IPFSObject),
          method: "POST"
        });
      } catch (error) {
        console.log(error);
      }

      //const response = { ipfsHash: "test" };
      if (data && data.status === 200 && contract) {
        const response: {
          hash: string;
          timestamp: number;
          ipfsHash: string;
        } = await data.json();
        try {
          console.log("IPFS hash:", response.ipfsHash);
          const tokenMetadata: TokenMetadata = {
            ...tkmt,
            token_id: response.ipfsHash,
            decimals: 0,
            extras: MichelsonMap.fromLiteral({
              canvasHash: response.hash,
              createdOn: response.timestamp.toString(),
              createdBy: userAddress
            })
          };

          // includes token in the blockchain
          const op = await contract.methods
            .mint_token(
              userAddress,
              tokenMetadata.token_id,
              tokenMetadata.symbol,
              tokenMetadata.name,
              tokenMetadata.decimals,
              tokenMetadata.price,
              tokenMetadata.market,
              tokenMetadata.extras
            )
            .send();
          setToastType(ToastType.INFO);
          setToastText(
            <span>
              Op hash:{" "}
              <a
                href={`https://better-call.dev/${network}/opg/${op?.opHash}/contents`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {op?.opHash.slice(0, 7) + "..." + op?.opHash.slice(-7)}
              </a>
            </span>
          );
          await op.confirmation();
          if (refreshStorage) await refreshStorage();
          // resets canvas
          if (gridSize === GridSize.Small) {
            // small canvas
            const newCanvas = defaultSmallCanvas();
            setSmallCanvas(newCanvas);
            activeSmallCanvas.current = newCanvas;
          } else if (gridSize === GridSize.Medium) {
            // medium canvas
            const newCanvas = defaultMediumCanvas();
            setMediumCanvas(newCanvas);
            activeMediumCanvas.current = newCanvas;
          } else if (gridSize === GridSize.Large) {
            // large canvas
            const newCanvas = defaultLargeCanvas();
            setLargeCanvas(newCanvas);
            activeLargeCanvas.current = newCanvas;
          } else {
            canvas = [[""]];
          }
          setToastType(ToastType.SUCCESS);
          setToastText(<span>Artwork successfully saved!</span>);
        } catch (error) {
          // removes token from IPFS node if it was already saved
          const BurnToken =
            process.env.NODE_ENV === "development"
              ? `http://localhost:${config.NETLIFY_PORT}/burnPixelArt`
              : "https://pixel-art-nfts.netlify.app/.netlify/functions/burnPixelArt";
          await fetch(BurnToken, {
            body: response.ipfsHash,
            method: "POST"
          });
          console.error(error);
          setToastType(ToastType.ERROR);
          if (error.includes("TOKEN_ALREADY_EXISTS")) {
            setToastText(<span>This artwork already exists</span>);
          } else {
            setToastText(<span>An error has occurred</span>);
          }
          setErrorSavingToken(true);
          setTimeout(() => setErrorSavingToken(false), 3000);
        } finally {
          setLoadingNewToken(false);
        }
      } else {
        setToastType(ToastType.ERROR);
        if (!data) {
          setToastText(<span>No data returned from the IPFS node</span>);
        } else {
          const error = await data.text();
          if (error.includes("TOKEN_ALREADY_EXISTS")) {
            setToastText(<span>This artwork already exists</span>);
          } else {
            setToastText(<span>An error has occurred</span>);
          }
        }
        setErrorSavingToken(true);
        setTimeout(() => setErrorSavingToken(false), 3000);
      }
    }
    setLoadingNewToken(false);
  };

  useEffect(() => {
    // brush color picker
    const pickr = Pickr.create({
      el: "#color-picker",
      theme: "classic",
      default: "#42445a",

      swatches: [
        "rgb(244, 67, 54, 1)",
        "rgba(233, 30, 99, 1)",
        "rgba(156, 39, 176, 1)",
        "rgba(103, 58, 183, 1)",
        "rgba(63, 81, 181, 1)",
        "rgba(33, 150, 243, 1)",
        "rgba(3, 169, 244, 1)",
        "rgba(0, 188, 212, 1)",
        "rgba(0, 150, 136, 1)",
        "rgba(76, 175, 80, 1)",
        "rgba(139, 195, 74, 1)",
        "rgba(205, 220, 57, 1)",
        "rgba(255, 235, 59, 1)",
        "rgba(255, 193, 7, 1)"
      ],

      components: {
        // Main components
        preview: true,
        opacity: false,
        hue: true,

        // Input / output Options
        interaction: {
          hex: true,
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
        // updates last used color palette
        let newPalette = [...activeLastUsedColors.current];
        newPalette.pop();
        newPalette = [newColor, ...newPalette];
        setLastUsedColors(newPalette);
        activeLastUsedColors.current = newPalette;
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
        "rgb(244, 67, 54, 1)",
        "rgba(233, 30, 99, 1)",
        "rgba(156, 39, 176, 1)",
        "rgba(103, 58, 183, 1)",
        "rgba(63, 81, 181, 1)",
        "rgba(33, 150, 243, 1)",
        "rgba(3, 169, 244, 1)",
        "rgba(0, 188, 212, 1)",
        "rgba(0, 150, 136, 1)",
        "rgba(76, 175, 80, 1)",
        "rgba(139, 195, 74, 1)",
        "rgba(205, 220, 57, 1)",
        "rgba(255, 235, 59, 1)",
        "rgba(255, 193, 7, 1)"
      ],

      components: {
        // Main components
        preview: true,
        opacity: false,
        hue: true,

        // Input / output Options
        interaction: {
          hex: true,
          rgba: false,
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
    <>
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
                htmlFor="48x48-grid"
                className={
                  gridSize === GridSize.Large ? styles.active : undefined
                }
              >
                <input
                  id="48x48-grid"
                  type="radio"
                  name="grid-size"
                  value="48x48"
                  checked={gridSize === GridSize.Large}
                  onChange={() => {
                    if (setGridSize) setGridSize(GridSize.Large);
                    activeGridSize.current = GridSize.Large;
                    resetCanvas();
                  }}
                />
                <span>48x48</span>
              </label>
            </div>
            <p className={styles.menu_title}>Drawing Tools</p>
            <div className={styles.menu_list}>
              <div className={styles.cursor_style}>
                <label>
                  <input
                    type="radio"
                    name="cursor-type"
                    onChange={() => setCursorType(CursorType.PEN)}
                    checked={cursorType === CursorType.PEN}
                  />
                  <img src="pen-32.png" alt="pen" />
                  <span>Pen</span>
                </label>
                <label>
                  <input
                    type="radio"
                    name="cursor-type"
                    onChange={() => setCursorType(CursorType.PICKER)}
                    checked={cursorType === CursorType.PICKER}
                  />
                  <img src="color-dropper-30.png" alt="pen" />
                  <span>Color Picker</span>
                </label>
              </div>
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
              <div className={styles.lastColorsUsed}>
                <div>Last colors used:</div>
                <div className={styles.lastUsedColorsPalette}>
                  {lastUsedColors.map((color, i) => {
                    if (i === 0) return null;

                    return (
                      <div
                        key={i + "-" + color}
                        className={styles.palette}
                        style={{ backgroundColor: color }}
                        onClick={() => {
                          if (colorPicker) colorPicker.setColor(color);
                        }}
                      >
                        &nbsp;
                      </div>
                    );
                  })}
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
              {window.localStorage &&
              window.localStorage.getItem("pixel-art-nfts") ? (
                <p
                  onClick={() => {
                    const savedCanvas = loadCanvas(gridSize as GridSize);
                    if (savedCanvas) {
                      if (gridSize === GridSize.Small) {
                        setSmallCanvas(savedCanvas.canvas);
                        activeSmallCanvas.current = savedCanvas.canvas;
                      } else if (gridSize === GridSize.Medium) {
                        setMediumCanvas(savedCanvas.canvas);
                        activeMediumCanvas.current = savedCanvas.canvas;
                      } else if (gridSize === GridSize.Large) {
                        setLargeCanvas(savedCanvas.canvas);
                        activeLargeCanvas.current = savedCanvas.canvas;
                      }
                    }
                  }}
                >
                  Load saved grid
                </p>
              ) : (
                <p>No saved grid</p>
              )}
            </div>
            <p className={styles.menu_title}>Tokenize your pixel art</p>
            <div className={styles.menu_list}>
              <div className="buttons">
                {loadingNewToken ? (
                  <button className="button info" disabled>
                    <i className="fas fa-spinner fa-spin"></i> Processing...
                  </button>
                ) : errorSavingToken ? (
                  <button className="button error">
                    <span>
                      <i className="fas fa-exclamation-triangle"></i> Error
                    </span>
                  </button>
                ) : userAddress ? (
                  <button className="button info" onClick={() => upload(false)}>
                    <span>
                      <i className="fas fa-file-upload"></i> Save to Blockchain
                    </span>
                  </button>
                ) : (
                  <button
                    className="button disabled"
                    onClick={() => {
                      if (setWalletModalOpen) setWalletModalOpen(true);
                    }}
                  >
                    <span>
                      <i className="fas fa-wallet"></i> Connect Wallet
                    </span>
                  </button>
                )}
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
                  <div></div>
                  {Array(blockNumberSmall)
                    .fill("")
                    .map((el, i) => (
                      <div
                        className={styles.header_number}
                        key={`row-num-` + i}
                        style={
                          i === blockNumberSmall - 1
                            ? {
                                borderRight: "solid 2px #FFFFED",
                                marginRight: "-2px"
                              }
                            : {}
                        }
                      >
                        {i + 1}
                      </div>
                    ))}
                  {smallCanvas.map((row, i1) => (
                    <React.Fragment key={`col-num-` + i1.toString()}>
                      <div
                        className={styles.header_number}
                        style={
                          i1 === blockNumberSmall - 1
                            ? {
                                borderBottom: "solid 2px #FFFFED",
                                marginBottom: "-2px"
                              }
                            : {}
                        }
                      >
                        {i1 + 1}
                      </div>
                      {row.map((bgColor, i2) => (
                        <div
                          key={`pixel-box-` + i1.toString() + i2.toString()}
                          className={styles[cursorType]}
                          style={{
                            backgroundColor: bgColor,
                            borderTop: displayGrid ? "solid 1px black" : "none",
                            borderLeft: displayGrid ? "solid 1px black" : "none"
                          }}
                          onMouseDown={event => {
                            //console.log(`row: ${i1} ; column: ${i2}`);
                            if (cursorType === CursorType.PEN) {
                              // prevents select of side numbers on mouse drag
                              event.preventDefault();
                              // updates color in `smallCanvas` variable
                              const newCanvas: Canvas = updateCanvas(i1, i2, [
                                ...smallCanvas
                              ]);
                              setSmallCanvas(newCanvas);
                              activeSmallCanvas.current = newCanvas;
                            }
                          }}
                          onMouseMove={event => {
                            // prevents select of side numbers on mouse drag
                            event.preventDefault();
                          }}
                          onMouseUp={() => {
                            if (cursorType === CursorType.PEN) {
                              // saves update in local storage
                              setSavedCanvas(false);
                              const isSaved = saveCanvas(
                                smallCanvas,
                                GridSize.Small
                              );
                              if (isSaved) {
                                setSavedCanvas(true);
                                setTimeout(() => setSavedCanvas(false), 2000);
                              }
                            } else if (cursorType === CursorType.PICKER) {
                              if (colorPicker && setCursorType) {
                                // sets new color
                                colorPicker.setColor(bgColor);
                                //  bring back the pen
                                setCursorType(CursorType.PEN);
                              }
                            }
                          }}
                          onMouseEnter={event => {
                            if (cursorType === CursorType.PEN) {
                              // draw as user drags the mouse
                              if (event.buttons === 1) {
                                // updates color in `smallCanvas` variable
                                const newCanvas: Canvas = updateCanvas(i1, i2, [
                                  ...smallCanvas
                                ]);
                                setSmallCanvas(newCanvas);
                                activeSmallCanvas.current = newCanvas;
                              }
                            }
                          }}
                        ></div>
                      ))}
                    </React.Fragment>
                  ))}
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
                  <div></div>
                  {Array(blockNumberMedium)
                    .fill("")
                    .map((el, i) => (
                      <div
                        className={styles.header_number}
                        key={`row-num-` + i}
                        style={
                          i === blockNumberMedium - 1
                            ? {
                                borderRight: "solid 2px #FFFFED",
                                marginRight: "-2px"
                              }
                            : {}
                        }
                      >
                        {i + 1}
                      </div>
                    ))}
                  {mediumCanvas.map((row, i1) => (
                    <React.Fragment key={`col-num-` + i1.toString()}>
                      <div
                        className={styles.header_number}
                        style={
                          i1 === blockNumberMedium - 1
                            ? {
                                borderBottom: "solid 2px #FFFFED",
                                marginBottom: "-2px"
                              }
                            : {}
                        }
                      >
                        {i1 + 1}
                      </div>
                      {row.map((bgColor, i2) => (
                        <div
                          key={i1.toString() + i2.toString()}
                          className={styles[cursorType]}
                          style={{
                            backgroundColor: bgColor,
                            borderTop: displayGrid ? "solid 1px black" : "none",
                            borderLeft: displayGrid ? "solid 1px black" : "none"
                          }}
                          onMouseDown={() => {
                            if (cursorType === CursorType.PEN) {
                              // updates color in `smallCanvas` variable
                              const newCanvas: Canvas = updateCanvas(i1, i2, [
                                ...mediumCanvas
                              ]);
                              setMediumCanvas(newCanvas);
                              activeMediumCanvas.current = newCanvas;
                            }
                          }}
                          onMouseUp={() => {
                            if (cursorType === CursorType.PEN) {
                              // saves update in local storage
                              setSavedCanvas(false);
                              const isSaved = saveCanvas(
                                mediumCanvas,
                                GridSize.Medium
                              );
                              if (isSaved) {
                                setSavedCanvas(true);
                                setTimeout(() => setSavedCanvas(false), 2000);
                              }
                            } else if (cursorType === CursorType.PICKER) {
                              if (colorPicker && setCursorType) {
                                // sets new color
                                colorPicker.setColor(bgColor);
                                //  bring back the pen
                                setCursorType(CursorType.PEN);
                              }
                            }
                          }}
                          onMouseEnter={event => {
                            if (cursorType === CursorType.PEN) {
                              // draw as user drags the mouse
                              if (event.buttons === 1) {
                                // updates color in `smallCanvas` variable
                                const newCanvas: Canvas = updateCanvas(i1, i2, [
                                  ...mediumCanvas
                                ]);
                                setSmallCanvas(newCanvas);
                                activeSmallCanvas.current = newCanvas;
                              }
                            }
                          }}
                        ></div>
                      ))}
                    </React.Fragment>
                  ))}
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
                  <div></div>
                  {Array(blockNumberLarge)
                    .fill("")
                    .map((el, i) => (
                      <div
                        className={styles.header_number}
                        key={`row-num-` + i}
                        style={
                          i === blockNumberLarge - 1
                            ? {
                                borderRight: "solid 2px #FFFFED",
                                marginRight: "-2px"
                              }
                            : {}
                        }
                      >
                        {i + 1}
                      </div>
                    ))}
                  {largeCanvas.map((row, i1) => (
                    <React.Fragment key={`col-num-` + i1.toString()}>
                      <div
                        className={styles.header_number}
                        style={
                          i1 === blockNumberLarge - 1
                            ? {
                                borderBottom: "solid 2px #FFFFED",
                                marginBottom: "-2px"
                              }
                            : {}
                        }
                      >
                        {i1 + 1}
                      </div>
                      {row.map((bgColor, i2) => (
                        <div
                          key={i1.toString() + i2.toString()}
                          className={styles[cursorType]}
                          style={{
                            backgroundColor: bgColor,
                            borderTop: displayGrid ? "solid 1px black" : "none",
                            borderLeft: displayGrid ? "solid 1px black" : "none"
                          }}
                          onMouseDown={() => {
                            if (cursorType === CursorType.PEN) {
                              // updates color in `smallCanvas` variable
                              const newCanvas: Canvas = updateCanvas(i1, i2, [
                                ...largeCanvas
                              ]);
                              setLargeCanvas(newCanvas);
                              activeLargeCanvas.current = newCanvas;
                            }
                          }}
                          onMouseUp={() => {
                            if (cursorType === CursorType.PEN) {
                              // saves update in local storage
                              setSavedCanvas(false);
                              const isSaved = saveCanvas(
                                largeCanvas,
                                GridSize.Large
                              );
                              if (isSaved) {
                                setSavedCanvas(true);
                                setTimeout(() => setSavedCanvas(false), 2000);
                              }
                            } else if (cursorType === CursorType.PICKER) {
                              if (colorPicker && setCursorType) {
                                // sets new color
                                colorPicker.setColor(bgColor);
                                //  bring back the pen
                                setCursorType(CursorType.PEN);
                              }
                            }
                          }}
                          onMouseEnter={event => {
                            if (cursorType === CursorType.PEN) {
                              // draw as user drags the mouse
                              if (event.buttons === 1) {
                                // updates color in `smallCanvas` variable
                                const newCanvas: Canvas = updateCanvas(i1, i2, [
                                  ...largeCanvas
                                ]);
                                setSmallCanvas(newCanvas);
                                activeSmallCanvas.current = newCanvas;
                              }
                            }
                          }}
                        ></div>
                      ))}
                    </React.Fragment>
                  ))}
                </div>
              )}
              {savedCanvas ? <p>Saved</p> : <p>&nbsp;</p>}
            </div>
            <div></div>
          </div>
        </div>
        <Modal {...modalState} />
        {walletModalOpen && <WalletModal close={setWalletModalOpen} />}
      </main>
      <Toast type={toastType} text={toastText} />
    </>
  );
};

export default CanvasPainting;

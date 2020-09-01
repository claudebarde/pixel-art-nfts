import { Canvas, GridSize } from "../../../types";

interface SavedCanvas {
  canvas: Canvas;
  lastUpdate: number;
}

interface LocalStorage {
  number: SavedCanvas;
}

const itemName: string = "pixel-art-nfts";

export const saveCanvas = (canvas: Canvas, size: GridSize): boolean => {
  if (window.localStorage) {
    const newItem: SavedCanvas = { canvas, lastUpdate: Date.now() };
    try {
      // gets current local storage
      const storage: LocalStorage = JSON.parse(
        window.localStorage.getItem(itemName) as string
      );
      if (storage) {
        const newStorage = { ...storage, [size]: newItem };
        window.localStorage.setItem(itemName, JSON.stringify(newStorage));
      } else {
        window.localStorage.setItem(
          itemName,
          JSON.stringify({ [size]: newItem })
        );
      }
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  return false;
};

export const loadCanvas = (size: GridSize): SavedCanvas | null => {
  if (window.localStorage) {
    const canvas: SavedCanvas = JSON.parse(
      window.localStorage.getItem(itemName) as string
    );
    if (canvas) {
      return canvas[size];
    } else {
      return null;
    }
  } else {
    return null;
  }
};

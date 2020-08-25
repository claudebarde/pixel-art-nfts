import React, { useContext } from "react";
import styles from "./styles.module.scss";
import { Context, View } from "../../Context";

const LeftColumn: React.FC = () => {
  const { view, setView } = useContext(Context);

  return (
    <aside>
      <div className={styles.menu}>
        <p onClick={() => setView(View.CANVAS)}>
          <i
            className="fas fa-palette"
            style={
              view === View.CANVAS ? { color: "#4fd1c5" } : { color: "black" }
            }
          ></i>{" "}
          Canvas
        </p>
        <p onClick={() => setView(View.MARKET)}>
          <i
            className="fas fa-store"
            style={
              view === View.MARKET ? { color: "#4fd1c5" } : { color: "black" }
            }
          ></i>{" "}
          Market
        </p>
      </div>
    </aside>
  );
};

export default LeftColumn;

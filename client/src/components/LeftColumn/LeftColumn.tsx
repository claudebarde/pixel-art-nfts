import React from "react";
import styles from "./styles.module.scss";

const LeftColumn: React.FC = () => {
  return (
    <aside>
      <div className={styles.menu}>
        <p>
          <i className="fas fa-palette"></i> Canvas
        </p>
        <p>
          <i className="fas fa-store"></i> Market
        </p>
      </div>
    </aside>
  );
};

export default LeftColumn;

import React from "react";
import styles from "./modal.module.scss";

export enum State {
  OPEN,
  CLOSED
}

export type ModalProps = {
  state: State;
  header: string;
  body: string;
  close: () => any;
};

export const Modal: React.FC = ({ state, header, body, close }: ModalProps) => {
  if (state === State.CLOSED) {
    return null;
  } else {
    return (
      <div className={styles.modal_container}>
        <div className={styles.modal}>
          <div className={styles.modal__header}>{header}</div>
          <div className={styles.modal__body}>{body}</div>
          <div className={styles.modal__buttons}>
            <button className="button info">Confirm</button>
            <button className="button error" onClick={close}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }
};

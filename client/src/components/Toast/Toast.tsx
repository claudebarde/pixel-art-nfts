import React, { useState, useEffect } from "react";
import styles from "./toast.module.scss";

export enum ToastType {
  DEFAULT,
  SUCCESS,
  INFO,
  ERROR
}

export interface ToastProps {
  type: ToastType;
  text: string;
}

export const Toast: React.FC<ToastProps> = ({ type, text }: ToastProps) => {
  const [show, setShow] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    if (text) {
      setTimeout(() => setShow(true), 2000);
      setTimeout(() => setShow(false), 5000);
    }
  }, [type, text]);

  return (
    <div
      className={`${
        type === ToastType.INFO ? styles.toast_info : styles.toast_default
      } ${show === undefined ? "" : show ? styles.show : styles.hide}`}
    >
      {text}
    </div>
  );
};

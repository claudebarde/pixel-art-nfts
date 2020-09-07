import React, { useState, useEffect, ReactNode } from "react";
import styles from "./toast.module.scss";

export enum ToastType {
  DEFAULT,
  SUCCESS,
  INFO,
  ERROR
}

export interface ToastProps {
  type: ToastType;
  text: ReactNode;
}

export const Toast: React.FC<ToastProps> = ({ type, text }: ToastProps) => {
  const [show, setShow] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    if (text) {
      setTimeout(() => setShow(true), 500);
      setTimeout(() => setShow(false), 4000);
    }
  }, [type, text]);

  return (
    <div
      className={`${
        type === ToastType.INFO
          ? styles.toast_info
          : type === ToastType.ERROR
          ? styles.toast_error
          : type === ToastType.SUCCESS
          ? styles.toast_success
          : styles.toast_default
      } ${show === undefined ? "" : show ? styles.show : styles.hide}`}
    >
      {text}
    </div>
  );
};

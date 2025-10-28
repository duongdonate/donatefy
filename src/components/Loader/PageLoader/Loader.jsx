import { memo } from "react";
import styles from "./Loader.module.css";

function Loader({ size = 2 }) {
  return (
    <div className={styles.loader} style={{ "--dim": `${size}rem` }}>
      <div className={styles.circle}></div>
      <div className={styles.circle}></div>
      <div className={styles.circle}></div>
      <div className={styles.circle}></div>
    </div>
  );
}

export default memo(Loader);

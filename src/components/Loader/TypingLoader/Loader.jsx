import styles from "./Loader.module.css";

function Loader({ className = "" }) {
  return (
    <div className={`${styles.wrapper} ${className}`}>
      <div className={styles.circle}></div>
      <div className={styles.circle}></div>
      <div className={styles.circle}></div>
      <div className={styles.shadow}></div>
      <div className={styles.shadow}></div>
      <div className={styles.shadow}></div>
    </div>
  );
}

export default Loader;

import { Link } from 'react-router-dom';
import styles from './NotFound.module.css';

export default function NotFound() {
  return (
    <div className={styles.container}>
      {/* Фоновая сетка */}
      <div className={styles.grid} />

      {/* ОГРОМНЫЙ котик — на весь экран справа */}
      <div className={styles.catWrap}>
        <img src="/cat.png" alt="Кот-страж" className={styles.catImg} />
      </div>

      <div className={styles.content}>
        <div className={styles.code}>404</div>
        <h1 className={styles.title}>Не найдено</h1>
        <p className={styles.subtitle}>
          Запрашиваемый ресурс не найден или ограничен.
        </p>
        <div className={styles.hint}>
          <span className={styles.hintLabel}>Статус доступа:</span>
          <span className={styles.hintValue}>🔒 Отклонён</span>
        </div>
        <Link to="/" className={styles.homeBtn}>
          🏠 На главную
        </Link>
      </div>

      {/* Нижняя строка состояния */}
      <div className={styles.statusBar}>
        <span>🛡️ СИСТЕМА БЕЗОПАСНОСТИ ЭЛЕКТРОННЫХ СЕРВИСОВ</span>
        <span className={styles.statusOk}>АКТИВНА</span>
      </div>
    </div>
  );
}

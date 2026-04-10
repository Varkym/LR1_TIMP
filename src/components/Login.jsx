import { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { findUserByEmail } from '../services/api';
import Toast from './Toast';
import styles from './Login.module.css';

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [authenticating, setAuthenticating] = useState(false);

  const showToast = useCallback((message, type) => {
    setToast({ message, type });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    findUserByEmail(email)
      .then((res) => {
        const user = res.data[0];
        if (!user) {
          setError('Пользователь не найден');
          setLoading(false);
          return;
        }
        if (user.isBlocked === 1 || user.isBlocked === true || user.isBlocked === '1' || user.isBlocked === 'true') {
          setError('Ваш аккаунт заблокирован');
          setLoading(false);
          return;
        }
        if (user.password !== password) {
          setError('Неверный пароль');
          setLoading(false);
          return;
        }
        // Успешный вход → показываем экран аутентификации
        setLoading(false);
        setAuthenticating(true);
        setTimeout(() => {
          const userData = { id: user.id, name: user.name, role: user.role };
          localStorage.setItem('user', JSON.stringify(userData));
          onLogin(userData);
          showToast(`Добро пожаловать, ${user.name}!`, 'success');
          navigate('/');
        }, 1500);
      })
      .catch(() => {
        setError('Ошибка подключения к серверу');
      })
      .finally(() => setLoading(false));
  };

  // Экран загрузки после успешного входа
  if (authenticating) {
    return (
      <div className={styles.authContainer}>
        <div className={styles.authShield}>🛡️</div>
        <div className={styles.authText}>Проверка данных...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className={styles.card}>
        <div className={styles.iconWrap}>
          <svg viewBox="0 0 48 48" width="48" height="48">
            <path d="M24 4 L42 14 L40 34 Q24 44 8 34 L6 14 Z" fill="none" stroke="#00ff88" strokeWidth="2.5" />
            <circle cx="24" cy="20" r="6" fill="none" stroke="#00ff88" strokeWidth="2" />
            <path d="M14 36 Q24 28 34 36" fill="none" stroke="#00ff88" strokeWidth="2" />
          </svg>
        </div>

        <h1 className={styles.title}>Вход в систему</h1>
        <p className={styles.subtitle}>Безопасность электронных услуг</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password">Пароль</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && <div className={styles.errorBox}>{error}</div>}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? (
              <span className={styles.btnLoading}>
                <span className={styles.btnShield}>🛡️</span> Вход...
              </span>
            ) : (
              '🔐 Войти'
            )}
          </button>
        </form>

        <div className={styles.hints}>
          <p>Демо-аккаунты:</p>
          <code>user@example.com / password123</code>
          <code>admin@security.com / admin123</code>
        </div>

        <div className={styles.registerLink}>
          Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
        </div>
      </div>
    </div>
  );
}

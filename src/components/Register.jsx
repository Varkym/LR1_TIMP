import { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getUsers, createUser } from '../services/api';
import axios from 'axios';
import Toast from './Toast';
import styles from './Register.module.css';

const API_URL = import.meta.env.VITE_API_URL || 'https://69d8ec0e0576c938825a42bb.mockapi.io/api';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
    role: 'Пользователь',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type) => {
    setToast({ message, type });
  }, []);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Имя обязательно';
    if (!form.email.trim()) {
      errs.email = 'Email обязателен';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'Некорректный email';
    }
    if (!form.password) {
      errs.password = 'Пароль обязателен';
    } else if (form.password.length < 4) {
      errs.password = 'Минимум 4 символа';
    }
    if (form.password !== form.passwordConfirm) {
      errs.passwordConfirm = 'Пароли не совпадают';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    getUsers()
      .then((res) => {
        const exists = res.data.find((u) => u.email === form.email);
        if (exists) {
          setErrors({ email: 'Этот email уже зарегистрирован' });
          setLoading(false);
          return;
        }

        const maxId = res.data.reduce((max, u) => Math.max(max, parseInt(u.id) || 0), 0);

        return createUser({
          id: String(maxId + 1),
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          role: form.role,
          isBlocked: 0,
        });
      })
      .then(() => {
        showToast('Регистрация успешна! Войдите в систему', 'success');
        navigate('/login');
      })
      .catch(() => {
        showToast('Ошибка при регистрации', 'error');
      })
      .finally(() => setLoading(false));
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  return (
    <div className={styles.container}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <Link to="/login" className={styles.backLink}>← Назад ко входу</Link>

      <div className={styles.card}>
        <div className={styles.iconWrap}>
          <svg viewBox="0 0 48 48" width="48" height="48">
            <path d="M24 4 L42 14 L40 34 Q24 44 8 34 L6 14 Z" fill="none" stroke="#00ff88" strokeWidth="2.5" />
            <circle cx="24" cy="20" r="6" fill="none" stroke="#00ff88" strokeWidth="2" />
            <path d="M14 36 Q24 28 34 36" fill="none" stroke="#00ff88" strokeWidth="2" />
          </svg>
        </div>

        <h1 className={styles.title}>Регистрация</h1>
        <p className={styles.subtitle}>Создайте аккаунт в системе безопасности</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="name">Имя *</label>
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Ваше имя"
              className={errors.name ? styles.errorInput : ''}
            />
            {errors.name && <span className={styles.errorText}>{errors.name}</span>}
          </div>

          <div className={styles.field}>
            <label htmlFor="email">Email *</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="user@example.com"
              className={errors.email ? styles.errorInput : ''}
            />
            {errors.email && <span className={styles.errorText}>{errors.email}</span>}
          </div>

          <div className={styles.field}>
            <label htmlFor="password">Пароль *</label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className={errors.password ? styles.errorInput : ''}
            />
            {errors.password && <span className={styles.errorText}>{errors.password}</span>}
          </div>

          <div className={styles.field}>
            <label htmlFor="passwordConfirm">Подтвердите пароль *</label>
            <input
              id="passwordConfirm"
              name="passwordConfirm"
              type="password"
              value={form.passwordConfirm}
              onChange={handleChange}
              placeholder="••••••••"
              className={errors.passwordConfirm ? styles.errorInput : ''}
            />
            {errors.passwordConfirm && <span className={styles.errorText}>{errors.passwordConfirm}</span>}
          </div>

          <div className={styles.field}>
            <label htmlFor="role">Роль</label>
            <select id="role" name="role" value={form.role} onChange={handleChange}>
              <option value="Пользователь">Пользователь</option>
              <option value="Администратор">Администратор</option>
            </select>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Регистрация...' : '📝 Зарегистрироваться'}
          </button>
        </form>

        <div className={styles.loginLink}>
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </div>
      </div>
    </div>
  );
}

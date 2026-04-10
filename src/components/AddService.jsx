import { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createService } from '../services/api';
import Toast from './Toast';
import styles from './AddService.module.css';

export default function AddService() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', url: '', status: 'secure' });
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type) => {
    setToast({ message, type });
  }, []);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Название обязательно';
    if (!form.url.trim()) {
      errs.url = 'URL обязателен';
    } else if (!/^https?:\/\//i.test(form.url)) {
      errs.url = 'URL должен начинаться с http:// или https://';
    } else if (!/^https?:\/\/[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}/i.test(form.url)) {
      errs.url = 'Введите корректный домен (например: example.com)';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    createService({ ...form, securityLevel: form.status === 'secure' ? 90 : form.status === 'warning' ? 60 : 30 })
      .then(() => {
        showToast('Сервис добавлен', 'success');
        navigate('/');
      })
      .catch(() => showToast('Ошибка при добавлении', 'error'));
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  return (
    <div className={styles.container}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <Link to="/" className={styles.backLink}>← Назад</Link>

      <h1 className={styles.title}>Добавить сервис</h1>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label htmlFor="name">Название *</label>
          <input
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Например: Файловое хранилище"
            className={errors.name ? styles.errorInput : ''}
          />
          {errors.name && <span className={styles.errorText}>{errors.name}</span>}
        </div>

        <div className={styles.field}>
          <label htmlFor="url">URL *</label>
          <input
            id="url"
            name="url"
            value={form.url}
            onChange={handleChange}
            placeholder="https://example.com"
            className={errors.url ? styles.errorInput : ''}
          />
          {errors.url && <span className={styles.errorText}>{errors.url}</span>}
        </div>

        <div className={styles.field}>
          <label htmlFor="status">Статус</label>
          <select id="status" name="status" value={form.status} onChange={handleChange}>
            <option value="secure">🟢 Защищён</option>
            <option value="warning">🟡 Предупреждение</option>
            <option value="compromised">🔴 Взломан</option>
          </select>
        </div>

        <button type="submit" className={styles.submitBtn}>
          ➕ Добавить
        </button>
      </form>
    </div>
  );
}

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getService, updateService, deleteService } from '../services/api';
import Toast from './Toast';
import styles from './Detail.module.css';

const STATUS_LABELS = {
  secure: '🟢 Защищён',
  warning: '🟡 Предупреждение',
  compromised: '🔴 Взломан',
};

const STATUS_COLORS = {
  secure: '#00ff88',
  warning: '#ffcc00',
  compromised: '#ff3333',
};

// Доступные меры безопасности
const SECURITY_MEASURES = [
  {
    id: 'firewall',
    label: '🛡️ Обновить Firewall',
    desc: 'Блокировка подозрительных IP',
    bonus: 15,
  },
  {
    id: 'keys',
    label: '🔑 Сменить ключи доступа',
    desc: 'Ротация SSL-сертификатов',
    bonus: 20,
  },
  {
    id: 'antivirus',
    label: '🦠 Антивирусное сканирование',
    desc: 'Поиск и удаление угроз',
    bonus: 10,
  },
  {
    id: '2fa',
    label: '🔐 Включить 2FA',
    desc: 'Двухфакторная аутентификация',
    bonus: 25,
  },
];

export default function Detail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [toast, setToast] = useState(null);
  const [appliedMeasures, setAppliedMeasures] = useState([]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [activeMeasure, setActiveMeasure] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const showToast = useCallback((message, type) => {
    setToast({ message, type });
  }, []);

  // Загрузка сервиса
  useEffect(() => {
    getService(id)
      .then((res) => {
        setService(res.data);
        setAppliedMeasures(res.data.appliedMeasures || []);
        setLoading(false);
      })
      .catch(() => {
        setNotFound(true);
        setLoading(false);
      });
  }, [id]);

  if (notFound) return <Navigate to="/404" replace />;

  // Применение меры безопасности
  const applyMeasure = (measure) => {
    if (appliedMeasures.includes(measure.id) || activeMeasure) return;

    setActiveMeasure(measure.id);

    // Имитация процесса (задержка 800мс)
    setTimeout(() => {
      const newLevel = Math.min(service.securityLevel + measure.bonus, 100);
      let newStatus = service.status;

      // Автоматическая смена статуса
      if (newLevel >= 80) newStatus = 'secure';
      else if (newLevel >= 50) newStatus = 'warning';
      else newStatus = 'compromised';

      const updatedService = {
        ...service,
        securityLevel: newLevel,
        status: newStatus,
        appliedMeasures: [...appliedMeasures, measure.id],
      };

      // Отправка на сервер
      updateService(id, {
        securityLevel: newLevel,
        status: newStatus,
        appliedMeasures: updatedService.appliedMeasures,
      })
        .then(() => {
          setService(updatedService);
          setAppliedMeasures(updatedService.appliedMeasures);
          showToast(`${measure.label} выполнено! (+${measure.bonus}%)`, 'success');
        })
        .catch(() => showToast('Ошибка при обновлении', 'error'))
        .finally(() => {
          setActiveMeasure(null);
        });
    }, 800);
  };

  // Удаление сервиса
  const handleDelete = () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    deleteService(id)
      .then(() => {
        showToast('Сервис удалён', 'info');
        navigate('/');
      })
      .catch(() => showToast('Ошибка при удалении', 'error'))
      .finally(() => setShowDeleteConfirm(false));
  };

  if (loading) return (
    <div className={styles.loading}>
      <div className={styles.loadingShield}>🛡️</div>
      <div className={styles.loadingText}>Загрузка данных...</div>
    </div>
  );
  if (notFound) return <Navigate to="/404" replace />;
  if (!service) return null;

  const color = STATUS_COLORS[service.status] || '#888';
  const allMeasuresApplied = SECURITY_MEASURES.every((m) => appliedMeasures.includes(m.id));

  return (
    <div className={styles.container}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <Link to="/" className={styles.backLink}>← Назад</Link>

      <div className={styles.card}>
        <h1 className={styles.name}>{service.name}</h1>

        <div className={styles.row}>
          <span className={styles.label}>URL:</span>
          <a href={service.url} target="_blank" rel="noreferrer" className={styles.url}>
            {service.url}
          </a>
        </div>

        <div className={styles.row}>
          <span className={styles.label}>Статус:</span>
          <span className={styles.status} style={{ color }}>
            {STATUS_LABELS[service.status]}
          </span>
        </div>

        <div className={styles.row}>
          <span className={styles.label}>Уровень безопасности:</span>
          <span className={styles.level} style={{ color }}>{service.securityLevel}%</span>
        </div>

        <div className={styles.progressWrap}>
          <div
            className={styles.progressFill}
            style={{ width: `${service.securityLevel}%`, background: color }}
          />
        </div>

        {/* ═══ ПАНЕЛЬ МЕР БЕЗОПАСНОСТИ ═══ */}
        <div className={styles.securityPanel}>
          <button
            className={styles.togglePanelBtn}
            onClick={() => setIsPanelOpen(!isPanelOpen)}
            disabled={allMeasuresApplied}
          >
            {allMeasuresApplied ? '✅ Все меры применены' : isPanelOpen ? '❌ Закрыть панель' : '🛠️ Начать защиту'}
          </button>

          {isPanelOpen && !allMeasuresApplied && (
            <div className={styles.measuresList}>
              {SECURITY_MEASURES.map((measure) => {
                const isApplied = appliedMeasures.includes(measure.id);
                const isActive = activeMeasure === measure.id;

                return (
                  <div
                    key={measure.id}
                    className={`${styles.measureCard} ${isApplied ? styles.measureApplied : ''}`}
                  >
                    <div className={styles.measureInfo}>
                      <span className={styles.measureLabel}>{measure.label}</span>
                      <span className={styles.measureDesc}>{measure.desc}</span>
                      <span className={styles.measureBonus}>+{measure.bonus}% защиты</span>
                    </div>
                    <button
                      className={`${styles.measureBtn} ${isApplied ? styles.measureBtnDone : ''}`}
                      onClick={() => applyMeasure(measure)}
                      disabled={isApplied || isActive}
                    >
                      {isActive ? (
                        <span className={styles.spinner}>⏳</span>
                      ) : isApplied ? (
                        '✅ Готово'
                      ) : (
                        'Применить'
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className={styles.actions}>
          {showDeleteConfirm ? (
            <>
              <span className={styles.confirmText}>Удалить сервис?</span>
              <button className={styles.confirmYesBtn} onClick={handleDelete}>
                Да, удалить
              </button>
              <button className={styles.confirmNoBtn} onClick={() => setShowDeleteConfirm(false)}>
                Отмена
              </button>
            </>
          ) : (
            <button className={styles.deleteBtn} onClick={handleDelete}>
              🗑 Удалить сервис
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getEvents, getServices, getUsers, createEvent, updateEvent, deleteEvent, updateUser } from '../services/api';
import Toast from './Toast';
import styles from './Events.module.css';

const EVENT_ICONS = {
  login_attempt: '🔑',
  failed_login: '🚫',
  suspicious_activity: '⚠️',
};

const EVENT_LABELS = {
  login_attempt: 'Попытка входа',
  failed_login: 'Неверный пароль',
  suspicious_activity: 'Подозрительная активность',
};

const STATUS_COLORS = {
  'Успех': '#00ff88',
  'Отказ': '#ff3333',
  'Предупреждение': '#ffcc00',
};

export default function Events() {
  const [events, setEvents] = useState([]);
  const [services, setServices] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState('list'); // list, add, edit, view, block
  const [selectedEvent, setSelectedEvent] = useState(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'Администратор';

  const showToast = useCallback((message, type) => {
    setToast({ message, type });
  }, []);

  useEffect(() => {
    Promise.all([getEvents(), getServices(), getUsers()])
      .then(([eventsRes, servicesRes, usersRes]) => {
        setEvents(eventsRes.data);
        setServices(servicesRes.data);
        setUsers(usersRes.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Не удалось загрузить данные');
        setLoading(false);
      });
  }, []);

  const getServiceName = (serviceId) => {
    const svc = services.find((s) => Number(s.id) === Number(serviceId));
    return svc ? svc.name : 'Неизвестный сервис';
  };

  const getUserName = (userId) => {
    const u = users.find((u) => Number(u.id) === Number(userId));
    return u ? u.name : `Пользователь #${userId}`;
  };

  const handleDelete = (id) => {
    deleteEvent(id)
      .then(() => {
        setEvents(events.filter((e) => e.id !== id));
        showToast('Событие удалено', 'info');
      })
      .catch(() => showToast('Ошибка при удалении', 'error'));
  };

  const handleBlockUser = (targetUserId) => {
    if (Number(targetUserId) === user.id) {
      showToast('Нельзя заблокировать себя!', 'error');
      return;
    }
    updateUser(targetUserId, { isBlocked: 1 })
      .then(() => showToast('Пользователь заблокирован', 'success'))
      .catch(() => showToast('Ошибка при блокировке', 'error'));
  };

  if (loading) return (
    <div className={styles.loading}>
      <div className={styles.loadingShield}>🛡️</div>
      <div className={styles.loadingText}>Загрузка данных...</div>
    </div>
  );
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.container}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <Link to="/" className={styles.backLink}>← На главную</Link>

      {/* ═══ МЕНЮ КАК В КОНСОЛЬНОМ ПРИЛОЖЕНИИ ═══ */}
      <div className={styles.menuPanel}>
        <h2 className={styles.menuTitle}>🛡️ Система безопасности электронных сервисов</h2>
        <div className={styles.menuButtons}>
          <button
            className={`${styles.menuBtn} ${activeTab === 'list' ? styles.menuBtnActive : ''}`}
            onClick={() => { setActiveTab('list'); setSelectedEvent(null); }}
          >
            1. Все события
          </button>
          <button
            className={`${styles.menuBtn} ${activeTab === 'add' ? styles.menuBtnActive : ''}`}
            onClick={() => setActiveTab('add')}
          >
            2. Добавить событие
          </button>
          <button
            className={`${styles.menuBtn} ${activeTab === 'edit' ? styles.menuBtnActive : ''}`}
            onClick={() => setActiveTab('edit')}
            disabled={events.length === 0}
          >
            3. Обновить событие
          </button>
          <button
            className={`${styles.menuBtn} ${activeTab === 'view' ? styles.menuBtnActive : ''}`}
            onClick={() => setActiveTab('view')}
            disabled={events.length === 0}
          >
            4. Просмотр по ID
          </button>
          {isAdmin && (
            <button
              className={`${styles.menuBtn} ${activeTab === 'block' ? styles.menuBtnActive : ''}`}
              onClick={() => setActiveTab('block')}
            >
              5. Заблокировать (админ)
            </button>
          )}
        </div>
      </div>

      {/* ═══ ВСЕ СОБЫТИЯ ═══ */}
      {activeTab === 'list' && (
        <div className={styles.tabContent}>
          <h3 className={styles.tabTitle}>Все события</h3>
          <div className={styles.list}>
            {events.length === 0 && <p className={styles.empty}>Событий пока нет</p>}
            {events.map((ev) => {
              const statusClass = ev.status === 'Успех' ? styles.statusSuccess : ev.status === 'Предупреждение' ? styles.statusWarning : ev.status === 'Отказ' ? styles.statusError : '';
              return (
                <div key={ev.id} className={`${styles.eventCard} ${statusClass}`}>
                  <div className={styles.eventHeader}>
                    <span className={styles.eventIcon}>{EVENT_ICONS[ev.eventType] || '📌'}</span>
                    <span className={styles.eventId}>ID: {ev.id}</span>
                    <span className={styles.eventDate}>{ev.date}</span>
                    <span className={styles.eventUser}>{getUserName(ev.userId)}</span>
                    <span className={styles.eventStatus} style={{ color: STATUS_COLORS[ev.status] || '#888' }}>
                      {ev.status}
                    </span>
                  </div>
                  <div className={styles.eventBody}>
                    <div className={styles.eventRow}>
                      <span className={styles.label}>Сервис:</span>
                      <span className={styles.value}>{getServiceName(ev.serviceId)}</span>
                    </div>
                    <div className={styles.eventRow}>
                      <span className={styles.label}>Тип:</span>
                      <span className={styles.value}>{EVENT_LABELS[ev.eventType] || ev.eventType}</span>
                    </div>
                    <div className={styles.eventRow}>
                      <span className={styles.label}>Описание:</span>
                      <span className={styles.value}>{ev.description}</span>
                    </div>
                  </div>
                  <div className={styles.eventActions}>
                    <button
                      className={styles.viewBtn}
                      onClick={() => { setSelectedEvent(ev); setActiveTab('view'); }}
                    >
                      👁 Просмотр
                    </button>
                    <button
                      className={styles.editBtn}
                      onClick={() => { setSelectedEvent(ev); setActiveTab('edit'); }}
                    >
                      ✏️ Изменить
                    </button>
                    <button className={styles.deleteBtn} onClick={() => handleDelete(ev.id)}>
                      🗑 Удалить
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══ ДОБАВИТЬ СОБЫТИЕ ═══ */}
      {activeTab === 'add' && <AddEventForm services={services} user={user} onSuccess={() => {
        getEvents().then((res) => setEvents(res.data));
        setActiveTab('list');
        showToast('Событие добавлено', 'success');
      }} />}

      {/* ═══ ОБНОВИТЬ СОБЫТИЕ ═══ */}
      {activeTab === 'edit' && (
        selectedEvent ? (
          <EditEventForm
            event={selectedEvent}
            services={services}
            onSuccess={(updated) => {
              setEvents(events.map((e) => e.id === updated.id ? updated : e));
              setActiveTab('list');
              setSelectedEvent(null);
              showToast('Событие обновлено', 'success');
            }}
            onCancel={() => { setActiveTab('list'); setSelectedEvent(null); }}
          />
        ) : (
          <div className={styles.tabContent}>
            <h3 className={styles.tabTitle}>Обновить событие</h3>
            <p className={styles.empty}>Выберите событие из списка для редактирования</p>
            <div className={styles.quickList}>
              {events.map((ev) => (
                <button
                  key={ev.id}
                  className={styles.quickBtn}
                  onClick={() => { setSelectedEvent(ev); }}
                >
                  #{ev.id} — {services.find((s) => Number(s.id) === Number(ev.serviceId))?.name || '—'}
                </button>
              ))}
            </div>
          </div>
        )
      )}

      {/* ═══ ПРОСМОТР ПО ID ═══ */}
      {activeTab === 'view' && (
        <ViewEventPanel
          events={events}
          services={services}
          users={users}
          selectedEvent={selectedEvent}
          onSelect={setSelectedEvent}
          onBack={() => { setActiveTab('list'); setSelectedEvent(null); }}
        />
      )}

      {/* ═══ ЗАБЛОКИРОВАТЬ ПОЛЬЗОВАТЕЛЯ (АДМИН) ═══ */}
      {activeTab === 'block' && isAdmin && (
        <BlockUserPanel
          users={users}
          currentUserId={user.id}
          onBlock={handleBlockUser}
        />
      )}
    </div>
  );
}

/* ─── Форма добавления события ─── */
function AddEventForm({ services, user, onSuccess }) {
  const [form, setForm] = useState({
    date: new Date().toLocaleDateString('ru-RU'),
    serviceId: services[0]?.id || '',
    eventType: 'login_attempt',
    description: '',
    status: 'Успех',
  });
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.date.trim()) errs.date = 'Дата обязательна';
    if (!form.description.trim()) errs.description = 'Описание обязательно';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    createEvent({
      ...form,
      userId: user.id,
      serviceId: Number(form.serviceId),
    }).then(() => onSuccess()).catch(() => { });
  };

  return (
    <div className={styles.tabContent}>
      <h3 className={styles.tabTitle}>Добавить событие</h3>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label>Дата</label>
          <input value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} placeholder="ДД.ММ.ГГГГ" />
          {errors.date && <span className={styles.errorText}>{errors.date}</span>}
        </div>
        <div className={styles.field}>
          <label>Сервис</label>
          <select value={form.serviceId} onChange={(e) => setForm({ ...form, serviceId: e.target.value })}>
            {services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className={styles.field}>
          <label>Тип события</label>
          <select value={form.eventType} onChange={(e) => setForm({ ...form, eventType: e.target.value })}>
            <option value="login_attempt">🔑 Попытка входа</option>
            <option value="failed_login">🚫 Неверный пароль</option>
            <option value="suspicious_activity">⚠️ Подозрительная активность</option>
          </select>
        </div>
        <div className={styles.field}>
          <label>Статус</label>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="Успех">🟢 Успех</option>
            <option value="Отказ">🔴 Отказ</option>
            <option value="Предупреждение">🟡 Предупреждение</option>
          </select>
        </div>
        <div className={styles.field}>
          <label>Описание</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Описание события..."
            rows="3"
          />
          {errors.description && <span className={styles.errorText}>{errors.description}</span>}
        </div>
        <button type="submit" className={styles.submitBtn}>➕ Добавить событие</button>
      </form>
    </div>
  );
}

/* ─── Форма редактирования события ─── */
function EditEventForm({ event, services, onSuccess, onCancel }) {
  const [form, setForm] = useState({
    status: event.status,
    description: event.description,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateEvent(event.id, form).then(() => onSuccess({ ...event, ...form })).catch(() => { });
  };

  return (
    <div className={styles.tabContent}>
      <h3 className={styles.tabTitle}>Обновить событие #{event.id}</h3>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label>Сервис</label>
          <input value={services.find((s) => Number(s.id) === Number(event.serviceId))?.name || '—'} disabled />
        </div>
        <div className={styles.field}>
          <label>Тип</label>
          <input value={EVENT_LABELS[event.eventType] || event.eventType} disabled />
        </div>
        <div className={styles.field}>
          <label>Статус</label>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="Успех">🟢 Успех</option>
            <option value="Отказ">🔴 Отказ</option>
            <option value="Предупреждение">🟡 Предупреждение</option>
          </select>
        </div>
        <div className={styles.field}>
          <label>Описание</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows="3"
          />
        </div>
        <div className={styles.formActions}>
          <button type="submit" className={styles.submitBtn}>💾 Сохранить</button>
          <button type="button" className={styles.cancelBtn} onClick={onCancel}>Отмена</button>
        </div>
      </form>
    </div>
  );
}

/* ─── Просмотр события по ID ─── */
function ViewEventPanel({ events, services, users, selectedEvent, onSelect, onBack }) {
  const [searchId, setSearchId] = useState(selectedEvent?.id || '');

  const found = events.find((e) => Number(e.id) === Number(searchId));

  return (
    <div className={styles.tabContent}>
      <h3 className={styles.tabTitle}>Просмотр события по ID</h3>
      <div className={styles.searchRow}>
        <input
          type="number"
          value={searchId}
          onChange={(e) => { setSearchId(e.target.value); onSelect(null); }}
          placeholder="Введите ID события"
          className={styles.searchInput}
        />
      </div>

      {found ? (
        <div className={styles.eventCard}>
          <div className={styles.eventHeader}>
            <span className={styles.eventIcon}>{EVENT_ICONS[found.eventType] || '📌'}</span>
            <span className={styles.eventId}>ID: {found.id}</span>
            <span className={styles.eventDate}>{found.date}</span>
            <span className={styles.eventStatus} style={{ color: STATUS_COLORS[found.status] }}>
              {found.status}
            </span>
          </div>
          <div className={styles.eventBody}>
            <div className={styles.eventRow}>
              <span className={styles.label}>Пользователь:</span>
              <span className={styles.value}>{users.find((u) => Number(u.id) === Number(found.userId))?.name || found.userId}</span>
            </div>
            <div className={styles.eventRow}>
              <span className={styles.label}>Сервис:</span>
              <span className={styles.value}>{services.find((s) => Number(s.id) === Number(found.serviceId))?.name || found.serviceId}</span>
            </div>
            <div className={styles.eventRow}>
              <span className={styles.label}>Тип:</span>
              <span className={styles.value}>{EVENT_LABELS[found.eventType] || found.eventType}</span>
            </div>
            <div className={styles.eventRow}>
              <span className={styles.label}>Описание:</span>
              <span className={styles.value}>{found.description}</span>
            </div>
          </div>
        </div>
      ) : searchId ? (
        <p className={styles.empty}>Событие с ID {searchId} не найдено</p>
      ) : (
        <div className={styles.quickList}>
          <p>Быстрый доступ:</p>
          {events.slice(0, 5).map((ev) => (
            <button
              key={ev.id}
              className={styles.quickBtn}
              onClick={() => { setSearchId(ev.id); onSelect(ev); }}
            >
              #{ev.id} — {services.find((s) => Number(s.id) === Number(ev.serviceId))?.name || '—'}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Блокировка пользователя (админ) ─── */
function BlockUserPanel({ users, currentUserId, onBlock }) {
  const [targetId, setTargetId] = useState('');

  return (
    <div className={styles.tabContent}>
      <h3 className={styles.tabTitle}>Заблокировать пользователя</h3>
      <div className={styles.form}>
        <div className={styles.field}>
          <label>ID пользователя</label>
          <input
            type="number"
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            placeholder="Введите ID"
          />
        </div>
        <div className={styles.userList}>
          <p>Доступные пользователи:</p>
          {users.map((u) => (
            <div key={u.id} className={styles.userRow}>
              <span>#{u.id} — {u.name} ({u.role})</span>
              {u.isBlocked ? (
                <span className={styles.blocked}> Заблокирован</span>
              ) : Number(u.id) === currentUserId ? (
                <span className={styles.self}>Вы</span>
              ) : (
                <button className={styles.blockBtn} onClick={() => onBlock(u.id)}>
                  Заблокировать
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

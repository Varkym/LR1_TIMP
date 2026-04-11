import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getServices } from '../services/api';
import styles from './Shield.module.css';

const STATUS_COLORS = {
  secure: '#00ff88',
  warning: '#ffcc00',
  compromised: '#ff3333',
};

const SHIELD_PATH = 'M 250 30 L 450 110 Q 470 120 470 150 L 450 310 Q 440 380 370 420 Q 300 470 250 490 Q 200 470 130 420 Q 60 380 50 310 L 30 150 Q 30 120 50 110 L 250 30 Z';

// Проверка валидности URL
function isValidUrl(url) {
  if (!url) return false;
  if (!/^https?:\/\//i.test(url)) return false;
  if (!/^https?:\/\/[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}/i.test(url)) return false;
  return true;
}

function rayIntersectShield(cx, cy, angle, outlinePts) {
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  let bestT = Infinity;
  for (const [px, py] of outlinePts) {
    const ex = px - cx;
    const ey = py - cy;
    const dot = ex * dx + ey * dy;
    if (dot > 0) {
      const cross = Math.abs(ex * dy - ey * dx);
      if (cross < 3 && dot < bestT) {
        bestT = dot;
      }
    }
  }
  if (bestT === Infinity) return [cx + dx * 220, cy + dy * 220];
  return [cx + dx * bestT, cy + dy * bestT];
}

function generateShieldOutline() {
  const segments = [
    { type: 'L', x1: 250, y1: 30, x2: 450, y2: 110 },
    { type: 'Q', x1: 450, y1: 110, cx: 470, cy: 120, x2: 470, y2: 150 },
    { type: 'L', x1: 470, y1: 150, x2: 450, y2: 310 },
    { type: 'Q', x1: 450, y1: 310, cx: 440, cy: 380, x2: 370, y2: 420 },
    { type: 'Q', x1: 370, y1: 420, cx: 300, cy: 470, x2: 250, y2: 490 },
    { type: 'Q', x1: 250, y1: 490, cx: 200, cy: 470, x2: 130, y2: 420 },
    { type: 'Q', x1: 130, y1: 420, cx: 60, cy: 380, x2: 50, y2: 310 },
    { type: 'L', x1: 50, y1: 310, x2: 30, y2: 150 },
    { type: 'Q', x1: 30, y1: 150, cx: 30, cy: 120, x2: 50, y2: 110 },
    { type: 'L', x1: 50, y1: 110, x2: 250, y2: 30 },
  ];
  const pts = [];
  for (const seg of segments) {
    if (seg.type === 'L') {
      for (let i = 0; i <= 10; i++) {
        const t = i / 10;
        pts.push([seg.x1 + (seg.x2 - seg.x1) * t, seg.y1 + (seg.y2 - seg.y1) * t]);
      }
    } else if (seg.type === 'Q') {
      for (let i = 0; i <= 20; i++) {
        const t = i / 20;
        const mt = 1 - t;
        const x = mt * mt * seg.x1 + 2 * mt * t * seg.cx + t * t * seg.x2;
        const y = mt * mt * seg.y1 + 2 * mt * t * seg.cy + t * t * seg.y2;
        pts.push([x, y]);
      }
    }
  }
  const deduped = [];
  for (let i = 0; i < pts.length; i++) {
    if (i === 0 || Math.abs(pts[i][0] - pts[i - 1][0]) > 0.5 || Math.abs(pts[i][1] - pts[i - 1][1]) > 0.5) {
      deduped.push(pts[i]);
    }
  }
  return deduped;
}

function buildWedgePath(i, n, cx, cy, outlinePts) {
  const startAngle = -Math.PI / 2 + (i * 2 * Math.PI) / n;
  const endAngle = -Math.PI / 2 + ((i + 1) * 2 * Math.PI) / n;
  const midAngle = -Math.PI / 2 + ((i + 0.5) * 2 * Math.PI) / n;
  const [xStart, yStart] = rayIntersectShield(cx, cy, startAngle, outlinePts);
  const [xEnd, yEnd] = rayIntersectShield(cx, cy, endAngle, outlinePts);
  const [xMid, yMid] = rayIntersectShield(cx, cy, midAngle, outlinePts);
  const contourPts = [];
  for (const [px, py] of outlinePts) {
    const angle = Math.atan2(py - cy, px - cx);
    let normalizedAngle = angle - startAngle;
    if (normalizedAngle < 0) normalizedAngle += 2 * Math.PI;
    const sectorAngle = (2 * Math.PI) / n;
    if (normalizedAngle >= -0.01 && normalizedAngle <= sectorAngle + 0.01) {
      contourPts.push([px, py]);
    }
  }
  if (contourPts.length === 0) {
    return `M ${cx} ${cy} L ${xStart} ${yStart} Q ${xMid} ${yMid} ${xEnd} ${yEnd} Z`;
  }
  const ptsStr = contourPts.map(p => `${p[0]} ${p[1]}`).join(' L ');
  return `M ${cx} ${cy} L ${xStart} ${yStart} L ${ptsStr} L ${xEnd} ${yEnd} Z`;
}

function getWedgeLabelCenter(i, n, cx, cy, outlinePts) {
  const midAngle = -Math.PI / 2 + ((i + 0.5) * 2 * Math.PI) / n;
  const [xMid, yMid] = rayIntersectShield(cx, cy, midAngle, outlinePts);
  return [(cx + xMid) / 2, (cy + yMid) / 2];
}

/**
 * Позиция для иконки предупреждения — правый верхний угол сектора.
 */
function getBadgePosition(i, n, cx, cy, outlinePts) {
  const startAngle = -Math.PI / 2 + (i * 2 * Math.PI) / n;
  const endAngle = -Math.PI / 2 + ((i + 1) * 2 * Math.PI) / n;
  const [xStart, yStart] = rayIntersectShield(cx, cy, startAngle, outlinePts);
  const [xEnd, yEnd] = rayIntersectShield(cx, cy, endAngle, outlinePts);
  // Середина хорды, ближе к краю
  const badgeR = 170; // фиксированный радиус от центра
  const midAngle = -Math.PI / 2 + ((i + 0.85) * 2 * Math.PI) / n;
  return [cx + badgeR * Math.cos(midAngle), cy + badgeR * Math.sin(midAngle)];
}

function getContrastTextColor(bgColor) {
  return '#ffffff';
}

function ShieldSVG({ services, hoveredIndex, setHoveredIndex, navigate, justLoaded }) {
  const n = services.length;
  if (n === 0) return null;

  const cx = 250;
  const cy = 250;
  const outlinePts = generateShieldOutline();
  const avgLevel = Math.round(services.reduce((s, sv) => s + sv.securityLevel, 0) / n);

  const wedgePaths = [];
  for (let i = 0; i < n; i++) {
    wedgePaths.push(buildWedgePath(i, n, cx, cy, outlinePts));
  }

  return (
    <svg viewBox="0 0 1000 660" className={`${styles.shieldSvg} ${justLoaded ? styles.shieldPulse : ''}`}>
      <defs>
        <filter id="shieldGlow" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="12" floodColor="#00ff88" floodOpacity="0.15" />
        </filter>
        <radialGradient id="shieldBg" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="var(--bg-secondary)" />
          <stop offset="100%" stopColor="var(--bg-primary)" />
        </radialGradient>
        <radialGradient id="centerGrad" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="var(--bg-secondary)" />
          <stop offset="100%" stopColor="var(--bg-primary)" />
        </radialGradient>
      </defs>

      {/* ═══ СТРАЖНИК СЛЕВА (PNG) — размером с щит ═══ */}
      <image
        href="/guard.png"
        x="5"
        y="0"
        width="240"
        height="600"
        className={styles.guardImage}
      />

      {/* ═══ СТРАЖНИК СПРАВА (зеркальный PNG) — размером с щит ═══ */}
      <g transform="translate(995, 0) scale(-1, 1)">
        <image
          href="/guard.png"
          x="0"
          y="0"
          width="240"
          height="600"
          className={styles.guardImage}
        />
      </g>

      {/* ═══ ЩИТ ПО ЦЕНТРУ ═══ */}
      <g transform="translate(250, 15)">
        <path
          d={SHIELD_PATH}
          fill="url(#shieldBg)"
          filter="url(#shadow)"
        />
        <path
          d={SHIELD_PATH}
          fill="none"
          stroke="var(--accent-neon)"
          strokeWidth="2.5"
          filter="url(#shieldGlow)"
          opacity="0.7"
        />
        <path
          d={SHIELD_PATH}
          fill="none"
          stroke="#00ff88"
          strokeWidth="0.5"
          opacity="0.15"
          transform="translate(250,250) scale(0.96) translate(-250,-250)"
        />

        {/* Сектора-клинья щита */}
        {services.map((service, i) => {
          const color = STATUS_COLORS[service.status] || '#888';
          const isHovered = hoveredIndex === i;
          const [lx, ly] = getWedgeLabelCenter(i, n, cx, cy, outlinePts);
          const textColor = getContrastTextColor(color);

          return (
            <g
              key={service.id}
              className={`${styles.sectorGroup} ${isHovered ? styles.sectorHover : ''}`}
              onClick={() => navigate(`/detail/${service.id}`)}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{ cursor: 'pointer' }}
            >
              <path
                d={wedgePaths[i]}
                fill={color}
                opacity={isHovered ? 0.7 : 0.4}
                className={styles.sectorPath}
              />
              <path
                d={wedgePaths[i]}
                fill="none"
                stroke={color}
                strokeWidth="1"
                opacity={isHovered ? 0.8 : 0.3}
              />
              <text
                x={lx}
                y={ly}
                textAnchor="middle"
                dominantBaseline="middle"
                className={styles.sectorLabel}
                fill={textColor}
                fontSize="18"
                fontWeight="800"
                opacity={isHovered ? 1 : 0.85}
              >
                {!isValidUrl(service.url) && (
                  <tspan className={styles.badgeWarning} fill="#ff3333" fontSize="14">⚠️ </tspan>
                )}
                {service.securityLevel}%
              </text>
            </g>
          );
        })}

        {/* Центральный элемент */}
        <circle cx={cx} cy={cy} r="50" fill="url(#centerGrad)" stroke="var(--accent-neon)" strokeWidth="2.5" filter="url(#shieldGlow)" opacity="0.95" />
        <circle cx={cx} cy={cy} r="50" fill="none" stroke="var(--accent-neon)" strokeWidth="0.8" opacity="0.3" />
        <text x={cx} y={cy - 12} textAnchor="middle" fill="var(--accent-neon)" fontSize="8" fontWeight="700" letterSpacing="0.5" opacity="0.9">
          БЕЗОПАСНОСТЬ
        </text>
        <text x={cx} y={cy + 16} textAnchor="middle" fill="var(--text-primary)" fontSize="28" fontWeight="800" filter="url(#shieldGlow)">
          {avgLevel}%
        </text>

        {/* Тултип при наведении */}
        {hoveredIndex !== null && (() => {
          const svc = services[hoveredIndex];
          const [lx, ly] = getWedgeLabelCenter(hoveredIndex, n, cx, cy, outlinePts);
          const tooltipX = lx;
          const tooltipY = ly - 48;
          const statusColor = STATUS_COLORS[svc.status];

          return (
            <g>
              <rect
                x={tooltipX - 80}
                y={tooltipY - 18}
                width="160"
                height={!isValidUrl(svc.url) ? '60' : '42'}
                rx="10"
                fill="var(--bg-secondary)"
                stroke={statusColor}
                strokeWidth="1.5"
                filter="url(#shieldGlow)"
                opacity="0.95"
              />
              <text x={tooltipX} y={tooltipY - 2} textAnchor="middle" fill="var(--text-primary)" fontSize="13" fontWeight="700">
                {svc.name}
              </text>
              <text x={tooltipX} y={tooltipY + 15} textAnchor="middle" fill={statusColor} fontSize="12" fontWeight="600">
                {svc.securityLevel}% · {svc.status === 'secure' ? '🟢' : svc.status === 'warning' ? '🟡' : '🔴'} {svc.status === 'secure' ? 'Защищён' : svc.status === 'warning' ? 'Предупреждение' : 'Взломан'}
              </text>
              {!isValidUrl(svc.url) && (
                <text x={tooltipX} y={tooltipY + 30} textAnchor="middle" fill="#ff3333" fontSize="10" fontWeight="700">
                  ⚠️ Некорректный URL: {svc.url}
                </text>
              )}
            </g>
          );
        })()}

      </g>
    </svg>
  );
}

export default function Shield({ user, onLogout, theme, toggleTheme }) {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [justLoaded, setJustLoaded] = useState(false);

  useEffect(() => {
    getServices()
      .then((res) => {
        setServices(res.data);
        setLoading(false);
        setJustLoaded(true);
        setTimeout(() => setJustLoaded(false), 1500);
      })
      .catch(() => { setError('Не удалось загрузить данные'); setLoading(false); });
  }, []);

  if (loading) return (
    <div className={styles.loading}>
      <div className={styles.loadingShield}>🛡️</div>
      <div className={styles.loadingText}>Загрузка данных...</div>
    </div>
  );
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        {user && (
          <div className={styles.userInfo}>
            <span className={styles.userName}>👤 {user.name}</span>
            <span className={styles.userRole}>{user.role}</span>
          </div>
        )}
        <div className={styles.topActions}>
          <button className={styles.themeToggle} onClick={toggleTheme}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <Link to="/events" className={styles.eventsLink}>📋 События</Link>
          <button className={styles.logoutBtn} onClick={onLogout}>Выйти</button>
        </div>
      </div>

      <h1 className={styles.title}>Безопасность электронных услуг</h1>
      <div className={styles.shieldWrapper}>
        <ShieldSVG
          services={services}
          hoveredIndex={hoveredIndex}
          setHoveredIndex={setHoveredIndex}
          navigate={navigate}
          justLoaded={justLoaded}
        />
      </div>
      <Link to="/add" className={styles.addBtn}>➕ Добавить сервис</Link>
    </div>
  );
}

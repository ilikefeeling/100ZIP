import './StatusBadge.css';

/**
 * 상태 뱃지 컴포넌트 (LL-017 납부 상태 등)
 * 색+텍스트 라벨 병기 필수 (NFR-ACC-001, 색맹 대응)
 * @param {'success'|'neutral'|'warning'|'danger'|'info'} status
 * @param {string} label - 텍스트 라벨 (항상 표시)
 */
export default function StatusBadge({ status = 'neutral', label, className = '' }) {
  return (
    <span className={`badge badge--${status} ${className}`}>
      {label}
    </span>
  );
}

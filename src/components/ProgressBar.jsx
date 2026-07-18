import './ProgressBar.css';

/**
 * 진행률 바 컴포넌트
 * 입주키트 등 순차 입력 화면에서 사용 (예: "3/5 항목")
 * @param {number} current - 현재 단계 (1부터 시작)
 * @param {number} total - 전체 단계 수
 */
export default function ProgressBar({ current, total }) {
  const percent = Math.round((current / total) * 100);

  return (
    <div className="progress" role="progressbar" aria-valuenow={current} aria-valuemin={1} aria-valuemax={total}>
      <div className="progress__info">
        <span className="progress__label">{current}/{total} 항목</span>
        <span className="progress__percent">{percent}%</span>
      </div>
      <div className="progress__track">
        <div className="progress__fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

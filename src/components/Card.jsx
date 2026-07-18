import './Card.css';

/**
 * 공통 카드 컴포넌트
 * @param {boolean} selected - 선택 상태 (카드 선택형 UI)
 * @param {boolean} sunken - 비활성/미입력 상태
 * @param {boolean} clickable - 클릭 가능 여부
 */
export default function Card({
  children,
  selected = false,
  sunken = false,
  clickable = false,
  onClick,
  className = '',
  ...props
}) {
  const classes = [
    'card',
    selected && 'card--selected',
    sunken && 'card--sunken',
    clickable && 'card--clickable',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div
      className={classes}
      onClick={clickable ? onClick : undefined}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={clickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick?.(e); } : undefined}
      {...props}
    >
      {children}
    </div>
  );
}

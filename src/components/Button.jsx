import './Button.css';

/**
 * 공통 버튼 컴포넌트
 * @param {'primary'|'accent'|'secondary'|'danger'|'disabled'} variant
 * @param {boolean} fullWidth
 * @param {boolean} disabled
 */
export default function Button({
  children,
  variant = 'primary',
  fullWidth = true,
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  ...props
}) {
  return (
    <button
      type={type}
      className={`btn btn--${disabled ? 'disabled' : variant} ${fullWidth ? 'btn--full' : ''} ${className}`}
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      {...props}
    >
      {children}
    </button>
  );
}

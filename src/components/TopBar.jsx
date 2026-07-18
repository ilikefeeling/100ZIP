import { useNavigate } from 'react-router-dom';
import './TopBar.css';

/**
 * 상단 바 컴포넌트 (뒤로가기 + 제목)
 * 모든 입력 화면 상단 좌측 고정 (04_wireframe-prd.md 기준)
 * @param {string} title - 화면 제목
 * @param {boolean} showBack - 뒤로가기 표시 여부
 * @param {function} onBack - 커스텀 뒤로가기 핸들러
 * @param {React.ReactNode} rightAction - 우측 액션 버튼
 */
export default function TopBar({
  title = '',
  showBack = true,
  onBack,
  rightAction,
}) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <header className="topbar">
      <div className="topbar__left">
        {showBack && (
          <button
            className="topbar__back"
            onClick={handleBack}
            aria-label="뒤로 가기"
            type="button"
          >
            <span className="arrow">←</span> 이전
          </button>
        )}
      </div>
      <h1 className="topbar__title">{title}</h1>
      <div className="topbar__right">
        {rightAction || null}
      </div>
    </header>
  );
}

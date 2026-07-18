import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import Button from '../../components/Button';
import './Onboarding.css';

/**
 * COM-004 최초 이용 안내
 * 4장 슬라이드 카드(스와이프), 큰 일러스트 + 짧은 문장
 * 하단 "건너뛰기" 상시 노출
 */
const SLIDES = [
  { icon: '📋', text: '임대 정보를 한 번만 입력하세요' },
  { icon: '📨', text: '세입자에게 자동으로 전달돼요' },
  { icon: '💰', text: '매달 임차료도 알아서 챙겨드려요' },
  { icon: '🎉', text: '이제 시작해볼까요?' },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { role, isFirstLogin } = useAuthStore();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [agreed, setAgreed] = useState(false);

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    useAuthStore.setState({ isFirstLogin: false });
    const home = role === 'landlord' ? '/landlord/home' : '/tenant/home';
    navigate(home, { replace: true });
  };

  const slide = SLIDES[currentSlide];
  const isLast = currentSlide === SLIDES.length - 1;

  return (
    <div className="onboarding">
      {/* 슬라이드 인디케이터 */}
      <div className="onboarding__dots">
        {SLIDES.map((_, i) => (
          <div
            key={i}
            className={`onboarding__dot ${i === currentSlide ? 'onboarding__dot--active' : ''}`}
          />
        ))}
      </div>

      {/* 슬라이드 콘텐츠 */}
      <div className="onboarding__content" key={currentSlide}>
        <div className="onboarding__icon">{slide.icon}</div>
        <p className="onboarding__text">{slide.text}</p>
      </div>

      {/* 버튼 영역 */}
      <div className="onboarding__actions">
        {isLast ? (
          <div className="onboarding__terms-wrapper">
            <label className="onboarding__terms">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
              <span>(필수) 서비스 이용약관 및 개인정보처리방침에 동의합니다.</span>
            </label>
            <div className="onboarding__terms-links">
              <span onClick={() => navigate('/terms')}>이용약관 보기</span>
              <span onClick={() => navigate('/privacy')}>개인정보처리방침 보기</span>
            </div>
            <Button variant="accent" onClick={handleComplete} disabled={!agreed}>
              시작하기
            </Button>
          </div>
        ) : (
          <Button variant="primary" onClick={handleNext}>
            다음
          </Button>
        )}
        {!isLast && (
          <button className="onboarding__skip" onClick={handleComplete}>
            건너뛰기
          </button>
        )}
      </div>
    </div>
  );
}

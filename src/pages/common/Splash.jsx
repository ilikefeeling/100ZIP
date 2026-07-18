import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import './Splash.css';

/**
 * COM-001 스플래시
 * 중앙 로고 + 로딩 인디케이터
 * 토큰 유효 시 역할별 홈 자동 이동(0.5초 이내)
 */
export default function Splash() {
  const navigate = useNavigate();
  const { isLoggedIn, role, isAuthReady } = useAuthStore();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Firebase 인증 로딩이 완료될 때까지 대기
    if (!isAuthReady) return;

    const timer = setTimeout(() => {
      if (isLoggedIn && role) {
        if (role === 'landlord') {
          navigate('/landlord/home', { replace: true });
        } else if (role === 'broker') {
          navigate('/broker/home', { replace: true });
        } else {
          navigate('/tenant/home', { replace: true });
        }
      } else {
        navigate('/role-select', { replace: true });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [isAuthReady, isLoggedIn, role, navigate]);

  return (
    <div className="splash">
      <div className="splash__logo" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <img src="/icon.png" alt="100집 로고" style={{ width: '80px', height: '80px', borderRadius: '20px', marginBottom: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
          <span style={{ fontSize: '32px', fontWeight: '700', color: 'var(--color-text-primary)' }}>편리하게</span>
          <h1 className="splash__title" style={{ fontSize: '44px', fontWeight: '900', color: 'var(--color-primary-600)', margin: 0 }}>100집</h1>
          <span style={{ fontSize: '32px', fontWeight: '700', color: 'var(--color-text-primary)' }}>관리</span>
        </div>
        <p style={{ fontSize: '18px', color: 'var(--color-text-secondary)', marginTop: '8px', letterSpacing: '2px', fontWeight: '600' }}>100ZIP</p>
      </div>
      <div className="splash__loader">
        <div className="splash__dot" />
        <div className="splash__dot" />
        <div className="splash__dot" />
      </div>
    </div>
  );
}

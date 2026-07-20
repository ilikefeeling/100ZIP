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
  const { isLoggedIn, role, isAuthReady, initAuthListener } = useAuthStore();
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    // 앱 시작 시 인증 리스너 등록
    initAuthListener().catch((err) => {
      setAuthError(err.message || String(err));
    });
  }, [initAuthListener]);

  useEffect(() => {
    // 에러 발생 시 대기
    if (authError || !isAuthReady) return;

    const timer = setTimeout(() => {
      if (isLoggedIn && role) {
        if (role === 'landlord') {
          // 중개사 초대링크를 통한 가입인 경우 자동 락인 처리
          const pendingOfficeId = sessionStorage.getItem('pendingBrokerOfficeId');
          if (pendingOfficeId) {
            sessionStorage.removeItem('pendingBrokerOfficeId');
            sessionStorage.removeItem('pendingBrokerOfficeName');
            navigate(`/invite/broker/${pendingOfficeId}`, { replace: true });
          } else {
            navigate('/landlord/home', { replace: true });
          }
        } else if (role === 'broker') {
          // 중개사 인증(사업자등록) 여부 체크
          const user = useAuthStore.getState().user;
          if (user && user.isBrokerVerified) {
            navigate('/broker/home', { replace: true });
          } else {
            navigate('/broker/register', { replace: true });
          }
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
        <img src="/icon.png" alt="100집 로고" loading="lazy" style={{ width: '80px', height: '80px', borderRadius: '20px', marginBottom: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
          <span style={{ fontSize: '32px', fontWeight: '700', color: '#ffffff' }}>편리하게</span>
          <h1 className="splash__title" style={{ fontSize: '44px', fontWeight: '900', color: '#60a5fa', margin: 0 }}>100집</h1>
          <span style={{ fontSize: '32px', fontWeight: '700', color: '#ffffff' }}>관리</span>
        </div>
        <p style={{ fontSize: '18px', color: '#cbd5e1', marginTop: '8px', letterSpacing: '2px', fontWeight: '600' }}>100ZIP</p>
      </div>
      <div className="splash__loader">
        {authError ? (
          <div style={{ color: '#ef4444', marginTop: '20px', padding: '10px', background: 'rgba(255,255,255,0.9)', borderRadius: '8px', fontSize: '14px', maxWidth: '80%', wordBreak: 'break-all' }}>
            인증 에러: {authError}
          </div>
        ) : (
          <>
            <div className="splash__dot" />
            <div className="splash__dot" />
            <div className="splash__dot" />
          </>
        )}
      </div>
    </div>
  );
}

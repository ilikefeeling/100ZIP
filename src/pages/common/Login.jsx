import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import Button from '../../components/Button';
import TopBar from '../../components/TopBar';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = location.state?.role || 'landlord';
  
  const { loginWithKakao, isFirstLogin } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleKakaoLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const userData = await loginWithKakao(role);
      if (!userData.phone || userData.phone === '010-0000-0000') {
        navigate('/phone-verification', { replace: true, state: { role } });
      } else {
        navigate('/', { replace: true });
      }
    } catch (e) {
      console.error("Detailed Kakao Login Error:", e);
      console.dir(e); // 객체의 내부 속성(customData 등)을 확장해서 볼 수 있게 합니다.
      if (e.customData) {
        console.log("Error Custom Data:", e.customData);
      }
      setError(`카카오 로그인 실패: ${e.message || '다시 시도해주세요.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', position: 'relative' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-text-secondary)',
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: 0,
            position: 'absolute',
            left: '20px'
          }}
        >
          <span>←</span> 이전
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 auto' }}>
          <img src="/icon.png" alt="100집 로고" style={{ width: '28px', height: '28px', borderRadius: '8px' }} />
          <span style={{ fontSize: '20px', fontWeight: '900', color: 'var(--color-primary-600)' }}>100집</span>
        </div>
      </div>

      <div className="page-content login" style={{ paddingTop: '32px' }}>
        <div className="login__guide" style={{ marginBottom: '32px' }}>
          <h2 className="login__heading">
            복잡한 가입 없이<br />카카오톡으로 시작하세요
          </h2>
          <p className="login__sub" style={{ marginTop: '12px' }}>
            선택한 역할: <strong>{role === 'landlord' ? '건물주(임대인)' : role === 'broker' ? '중개사' : '세입자(임차인)'}</strong>
          </p>
        </div>

        <div className="login__buttons" style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '40px' }}>
          <button
            onClick={handleKakaoLogin}
            disabled={loading}
            style={{
              backgroundColor: '#FEE500',
              color: '#000000',
              border: 'none',
              borderRadius: '12px',
              padding: '16px',
              fontSize: '20px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%'
            }}
          >
            {loading ? '로그인 중...' : '💬 카카오로 3초 만에 시작하기'}
          </button>
        </div>

        {error && (
          <div className="login__error" role="alert" style={{ color: 'red', marginTop: '16px', textAlign: 'center' }}>
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

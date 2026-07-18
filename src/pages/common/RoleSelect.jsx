import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import './RoleSelect.css';

/**
 * COM-002 역할 선택
 * 화면 상/하 2분할, 각 영역 큰 버튼 1개
 * 탭 시 즉시 다음 화면, 별도 확인 팝업 없음
 */
export default function RoleSelect() {
  const navigate = useNavigate();
  const setRole = useAuthStore((s) => s.setRole);

  const handleSelect = (role) => {
    setRole(role);
    navigate('/auth/login', { state: { role } });
  };

  return (
    <div className="page" style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: '0 24px' }}>
      <div style={{ padding: '60px 0 40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <img src="/250-icon.png" alt="100집 로고" style={{ width: '64px', height: '64px', borderRadius: '16px', marginBottom: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
        <h1 style={{ fontSize: '32px', fontWeight: '900', color: 'var(--color-primary-600)', margin: '0 0 4px 0' }}>100집</h1>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', letterSpacing: '1px', fontWeight: '600', margin: 0 }}>100ZIP</p>
        <p style={{ fontSize: '18px', color: 'var(--color-text-primary)', marginTop: '24px', fontWeight: 'bold' }}>어떤 역할로 시작할까요?</p>
      </div>

      <div className="role-select" style={{ flex: 1, padding: 0 }}>
        <button
        className="role-select__card role-select__card--landlord"
        onClick={() => handleSelect('landlord')}
      >
        <span className="role-select__icon" aria-hidden="true">🏢</span>
        <span className="role-select__label">임대인이에요</span>
        <span className="role-select__desc">건물과 세입자를 관리해요</span>
      </button>

      <button
        className="role-select__card role-select__card--tenant"
        onClick={() => handleSelect('tenant')}
      >
        <span className="role-select__icon" aria-hidden="true">🔑</span>
        <span className="role-select__label">초대코드로 입장할게요</span>
        <span className="role-select__desc">임대인이 보낸 링크가 있어요</span>
      </button>

      <button
        className="role-select__card role-select__card--broker"
        onClick={() => handleSelect('broker')}
      >
        <span className="role-select__icon" aria-hidden="true">🤝</span>
        <span className="role-select__label">중개사예요</span>
        <span className="role-select__desc">공실 정보와 중개 의뢰를 확인해요</span>
      </button>
      </div>
    </div>
  );
}

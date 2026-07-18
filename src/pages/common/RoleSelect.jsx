import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import Card from '../../components/Card';
import { IconBuildingCommunity, IconKey, IconBriefcase, IconBook } from '@tabler/icons-react';
import './RoleSelect.css';

/**
 * COM-002 역할 선택
 * 2열 그리드 바둑판식 레이아웃 적용 (4분할)
 */
export default function RoleSelect() {
  const navigate = useNavigate();
  const setRole = useAuthStore((s) => s.setRole);

  const handleSelect = (role) => {
    // 임시로 사용설명서는 라우팅 무시
    if (role === 'manual') {
      alert('사용설명서는 준비 중입니다.');
      return;
    }
    setRole(role);
    navigate('/auth/login', { state: { role } });
  };

  return (
    <div className="page" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', padding: '0 24px' }}>
      <div style={{ padding: '60px 0 40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '16px', marginBottom: '16px',
          background: 'var(--color-primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <span style={{ fontSize: '32px', color: '#fff', fontWeight: '900' }}>100</span>
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: '900', color: 'var(--color-primary-600)', margin: '0 0 4px 0' }}>100집</h1>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', letterSpacing: '1px', fontWeight: '600', margin: 0 }}>100ZIP</p>
        <p style={{ fontSize: '18px', color: 'var(--color-text-primary)', marginTop: '24px', fontWeight: 'bold' }}>어떤 역할로 시작할까요?</p>
      </div>

      <div className="role-select">
        <Card clickable onClick={() => handleSelect('landlord')} className="role-select__card role-select__card--landlord">
          <div className="role-select__icon-badge">
            <IconBuildingCommunity size={24} />
          </div>
          <span className="role-select__label">건물주예요</span>
          <span className="role-select__desc">건물과 세입자를<br/>관리해요</span>
        </Card>

        <Card clickable onClick={() => handleSelect('tenant')} className="role-select__card role-select__card--tenant">
          <div className="role-select__icon-badge">
            <IconKey size={24} />
          </div>
          <span className="role-select__label">세입자예요</span>
          <span className="role-select__desc">계약 및 입주 절차를<br/>진행해요</span>
        </Card>

        <Card clickable onClick={() => handleSelect('manual')} className="role-select__card role-select__card--manual">
          <div className="role-select__icon-badge">
            <IconBook size={24} />
          </div>
          <span className="role-select__label">사용설명서</span>
          <span className="role-select__desc">앱 사용 방법과<br/>가이드를 확인해요</span>
        </Card>

        <Card clickable onClick={() => handleSelect('broker')} className="role-select__card role-select__card--broker">
          <div className="role-select__icon-badge">
            <IconBriefcase size={24} />
          </div>
          <span className="role-select__label">중개사예요</span>
          <span className="role-select__desc">공실 정보와 중개<br/>의뢰를 확인해요</span>
        </Card>
      </div>
    </div>
  );
}

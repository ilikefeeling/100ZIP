import React from 'react';
import TopBar from '../../components/TopBar';
import BottomTabBar from '../../components/BottomTabBar';
import Card from '../../components/Card';
import Button from '../../components/Button';

import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';

export default function BrokerHome() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  return (
    <div className="page">
      <TopBar title="중개사 홈" />
      <div className="page-content" style={{ paddingBottom: '80px' }}>
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 8px 0', color: 'var(--color-text-primary)' }}>
              안녕하세요, <span style={{ color: 'var(--color-primary-600)' }}>중개사</span>님
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
              현재 공실 현황을 확인하고 매물을 관리하세요
            </p>
          </div>
          <button
            onClick={async () => {
              if (window.confirm('로그아웃 하시겠습니까?')) {
                await logout();
                navigate('/role-select', { replace: true });
              }
            }}
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '20px',
              padding: '8px 12px',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              color: 'var(--color-text-secondary)'
            }}
          >
            🚪 로그아웃
          </button>
        </div>

        <div style={{ marginBottom: '32px' }}>
          <Button 
            variant="primary" 
            fullWidth 
            onClick={() => navigate('/broker/landlord-invite')}
          >
            + 내 주거래 건물주(매물) 등록하기
          </Button>
        </div>

        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: 'var(--color-text-primary)' }}>
          추천 공실 매물
        </h2>
        
        <Card style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '32px 0', color: 'var(--color-text-secondary)' }}>
            현재 등록된 공실 매물이 없습니다.
          </div>
        </Card>
      </div>
      <BottomTabBar role="broker" />
    </div>
  );
}

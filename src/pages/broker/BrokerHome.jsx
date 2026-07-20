import React, { useEffect, useState } from 'react';
import TopBar from '../../components/TopBar';
import BottomTabBar from '../../components/BottomTabBar';
import Card from '../../components/Card';
import Button from '../../components/Button';

import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import useBrokerStore from '../../stores/brokerStore';

export default function BrokerHome() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { clients, listings, staff, isInitialized, initBrokerData, clearBrokerData, fetchExpiringUnits } = useBrokerStore();
  const [expiringCount, setExpiringCount] = useState(0);

  // 중개사 데이터 초기화
  useEffect(() => {
    if (user && user.officeId && !isInitialized) {
      initBrokerData(user);
    }
    return () => {
      // 컴포넌트 언마운트 시 리스너 해제하지 않음 (앱 전역에서 유지)
    };
  }, [user, isInitialized, initBrokerData]);

  // 만기 임박 건수 로드
  useEffect(() => {
    if (isInitialized && clients.length > 0) {
      fetchExpiringUnits().then(units => setExpiringCount(units.length)).catch(() => {});
    }
  }, [isInitialized, clients.length, fetchExpiringUnits]);

  const newListings = listings.filter(l => l.status === '접수됨').length;

  return (
    <div className="page" style={{ background: '#f8fafc' }}>
      <TopBar title="중개사 홈" />
      <div className="page-content" style={{ paddingBottom: '100px' }}>
        
        {/* 헤더 (프로필 & 로그아웃) */}
        <div style={{ padding: '24px', background: 'linear-gradient(135deg, #1E3A5F 0%, #16283F 100%)', margin: '-16px -16px 24px -16px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 'bold', margin: '0 0 4px 0', color: 'white' }}>
              안녕하세요, <span style={{ color: '#F6E9D8' }}>{user?.officeName || '중개사'}</span>님
            </h1>
            <p style={{ margin: 0, opacity: 0.8, fontSize: '14px' }}>
              오늘도 성공적인 중개를 응원합니다!
            </p>
          </div>
          <button
            onClick={async () => {
              if (window.confirm('로그아웃 하시겠습니까?')) {
                clearBrokerData();
                await logout();
                navigate('/role-select', { replace: true });
              }
            }}
            style={{
              background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '20px', padding: '8px 12px', fontSize: '13px', cursor: 'pointer',
              color: 'white', display: 'flex', alignItems: 'center'
            }}
          >
            로그아웃
          </button>
        </div>

        {/* 대시보드 요약 카드 (기획서 AGT-002: 관리 임대인 수 / 신규 접수 / 만기 임박) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '28px', padding: '0 16px' }}>
          <Card clickable onClick={() => navigate('/broker/clients')} style={{ padding: '20px 12px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.04)', borderRadius: '16px' }}>
            <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--color-primary-600)', marginBottom: '4px' }}>{clients.length}</div>
            <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: '600' }}>관리 임대인</div>
          </Card>
          <Card clickable onClick={() => navigate('/broker/listings')} style={{ padding: '20px 12px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.04)', borderRadius: '16px' }}>
            <div style={{ fontSize: '32px', fontWeight: '800', color: newListings > 0 ? 'var(--color-danger-600)' : 'var(--color-text-primary)', marginBottom: '4px' }}>{newListings}</div>
            <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: '600' }}>신규 접수</div>
          </Card>
          <Card clickable onClick={() => navigate('/broker/expiring')} style={{ padding: '20px 12px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.04)', borderRadius: '16px' }}>
            <div style={{ fontSize: '32px', fontWeight: '800', color: expiringCount > 0 ? '#D97706' : 'var(--color-text-primary)', marginBottom: '4px' }}>{expiringCount}</div>
            <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: '600' }}>만기 임박</div>
          </Card>
        </div>

        <div style={{ padding: '0 16px', marginBottom: '32px' }}>
          <Button 
            variant="primary" 
            fullWidth 
            onClick={() => navigate('/broker/landlord-invite')}
            style={{ padding: '16px', fontSize: '16px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(22, 40, 63, 0.2)' }}
          >
            + 내 주거래 건물주(매물) 등록하기
          </Button>
        </div>

        {/* 퀵 메뉴 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '32px', padding: '0 16px' }}>
          <Card clickable onClick={() => navigate('/broker/clients')} style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', borderRadius: '16px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <span style={{ fontSize: '28px' }}>🤝</span>
            <span style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>임대인 장부</span>
          </Card>
          <Card clickable onClick={() => navigate('/broker/listings')} style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', borderRadius: '16px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <span style={{ fontSize: '28px' }}>📋</span>
            <span style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>매물 관리</span>
          </Card>
          <Card clickable onClick={() => navigate('/broker/expiring')} style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', borderRadius: '16px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <span style={{ fontSize: '28px' }}>⏳</span>
            <span style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>만기 임박 조회</span>
          </Card>
          <Card clickable onClick={() => navigate('/broker/staff')} style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', borderRadius: '16px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <span style={{ fontSize: '28px' }}>👥</span>
            <span style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>소속 직원 관리</span>
          </Card>
        </div>

        <div style={{ padding: '0 16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: 'var(--color-text-primary)' }}>
            최근 접수된 매물
          </h2>
          
          {listings.filter(l => l.status === '접수됨').length > 0 ? (
            listings.filter(l => l.status === '접수됨').slice(0, 3).map(listing => (
              <Card key={listing.id} clickable style={{ marginBottom: '12px', padding: '20px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', border: 'none' }} onClick={() => navigate('/broker/listings')}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '6px', color: 'var(--color-text-primary)' }}>{listing.buildingName} {listing.unitNumber}</div>
                    <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '12px' }}>👤</span> {listing.landlordName}
                    </div>
                  </div>
                  <span style={{ fontSize: '12px', background: '#FEE2E2', color: '#DC2626', padding: '4px 8px', borderRadius: '12px', fontWeight: 'bold' }}>NEW</span>
                </div>
              </Card>
            ))
          ) : (
            <Card style={{ padding: '40px 20px', textAlign: 'center', borderRadius: '16px', border: '1px dashed var(--color-border)', background: 'transparent', boxShadow: 'none' }}>
              <div style={{ color: 'var(--color-text-secondary)', fontSize: '15px' }}>
                현재 새로 접수된 매물이 없습니다.
              </div>
            </Card>
          )}
        </div>
      </div>
      <BottomTabBar role="broker" />
    </div>
  );
}

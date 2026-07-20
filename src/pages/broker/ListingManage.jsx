import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../../components/TopBar';
import Card from '../../components/Card';
import Button from '../../components/Button';
import StatusBadge from '../../components/StatusBadge';
import BottomTabBar from '../../components/BottomTabBar';
import { formatPhoneNumber } from '../../utils/formatters';
import { formatKoreanCurrency } from '../../utils/format';
import useBrokerStore from '../../stores/brokerStore';

export default function ListingManage() {
  const navigate = useNavigate();
  const { listings, updateListingStatus } = useBrokerStore();
  const [activeTab, setActiveTab] = useState('전체');

  const filteredListings = activeTab === '전체' 
    ? listings 
    : listings.filter(l => l.type === activeTab);

  const handleStatusChange = async (listingId, newStatus) => {
    try {
      await updateListingStatus(listingId, newStatus);
    } catch (error) {
      console.error('상태 변경 오류:', error);
      alert('상태 변경 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="page" style={{ background: '#f8fafc' }}>
      <TopBar title="매물 관리" showBack onBack={() => navigate('/broker/home')} />
      <div className="page-content" style={{ padding: '24px', paddingBottom: '80px', maxWidth: '800px', margin: '0 auto' }}>
        
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 8px 0', color: 'var(--color-text-primary)' }}>
            의뢰받은 매물 📋
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', margin: 0, lineHeight: '1.5' }}>
            임대인들이 내놓은 매물을 확인하고<br/>빠르게 중개를 성사시켜 보세요.
          </p>
        </div>

        {/* 탭 네비게이션 */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '16px' }}>
          {['전체', '일반', '급매', '예상밖'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '8px 16px', borderRadius: '20px',
                background: activeTab === tab ? 'var(--color-primary-600)' : 'var(--color-surface)',
                color: activeTab === tab ? 'white' : 'var(--color-text-secondary)',
                fontWeight: activeTab === tab ? 'bold' : 'normal',
                whiteSpace: 'nowrap', cursor: 'pointer',
                boxShadow: activeTab === tab ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                border: activeTab !== tab ? '1px solid var(--color-border)' : 'none'
              }}
            >
              {tab} 매물
            </button>
          ))}
        </div>

        {/* 리스트 영역 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredListings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-secondary)' }}>
              {listings.length === 0 
                ? '아직 의뢰받은 매물이 없습니다.\n임대인이 앱에서 방을 내놓으면 자동으로 표시됩니다.'
                : '해당하는 매물이 없습니다.'
              }
            </div>
          ) : (
            filteredListings.map(listing => (
              <Card key={listing.id} style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <StatusBadge 
                      status={listing.type === '급매' ? 'danger' : listing.type === '예상밖' ? 'warning' : 'info'} 
                      label={listing.type} 
                    />
                    <StatusBadge 
                      status={listing.status === '접수됨' ? 'warning' : listing.status === '중개중' ? 'info' : 'success'} 
                      label={listing.status} 
                    />
                  </div>
                  <span style={{ fontSize: '13px', color: 'var(--color-text-tertiary)' }}>{(listing.requestedAt || '').split('T')[0]} 접수</span>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', color: 'var(--color-text-primary)' }}>
                    {listing.buildingName} {listing.unitNumber}
                  </h3>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--color-primary-600)' }}>
                    보증금 {formatKoreanCurrency(listing.deposit)} / 월세 {formatKoreanCurrency(listing.monthlyRent)}
                  </div>
                </div>

                {listing.memo && (
                  <div style={{ background: 'var(--color-bg-secondary)', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                    💡 특이사항: {listing.memo}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
                  <div>
                    <div style={{ fontSize: '13px', color: 'var(--color-text-tertiary)' }}>임대인 연락처</div>
                    <div style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>
                      {listing.landlordName} ({formatPhoneNumber(listing.landlordPhone)})
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {listing.status === '접수됨' && (
                      <Button variant="primary" style={{ padding: '8px 12px', fontSize: '13px' }}
                        onClick={() => handleStatusChange(listing.id, '중개중')}>
                        중개 시작
                      </Button>
                    )}
                    {listing.status === '중개중' && (
                      <Button variant="primary" style={{ padding: '8px 12px', fontSize: '13px' }}
                        onClick={() => handleStatusChange(listing.id, '완료')}>
                        중개 완료
                      </Button>
                    )}
                    <Button variant="secondary" style={{ padding: '8px 12px', fontSize: '13px' }}
                      onClick={() => window.location.href = `tel:${(listing.landlordPhone || '').replace(/-/g, '')}`}>
                      📞
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
      <BottomTabBar role="broker" />
    </div>
  );
}

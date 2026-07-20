import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../../components/TopBar';
import Card from '../../components/Card';
import Button from '../../components/Button';
import BottomTabBar from '../../components/BottomTabBar';
import StatusBadge from '../../components/StatusBadge';
import { formatPhoneNumber } from '../../utils/formatters';
import useBrokerStore from '../../stores/brokerStore';

export default function ExpiringUnits() {
  const navigate = useNavigate();
  const { fetchExpiringUnits, saveMemo, loadMemos } = useBrokerStore();
  const [expiringUnits, setExpiringUnits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [memos, setMemos] = useState({});
  const [editingMemo, setEditingMemo] = useState({});

  useEffect(() => {
    const load = async () => {
      try {
        const [units, savedMemos] = await Promise.all([
          fetchExpiringUnits(),
          loadMemos()
        ]);
        setExpiringUnits(units);
        setMemos(savedMemos || {});
      } catch (error) {
        console.error('만기 임박 조회 오류:', error);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [fetchExpiringUnits, loadMemos]);

  const handleMemoSave = async (unitId, memoText) => {
    try {
      await saveMemo(unitId, memoText);
      setMemos(prev => ({ ...prev, [unitId]: { memo: memoText, updatedAt: new Date().toISOString() } }));
    } catch (err) {
      console.error('메모 저장 오류:', err);
    }
  };

  return (
    <div className="page" style={{ background: '#f8fafc' }}>
      <TopBar title="만기 임박 조회" showBack onBack={() => navigate('/broker/home')} />
      <div className="page-content" style={{ padding: '24px', paddingBottom: '80px', maxWidth: '800px', margin: '0 auto' }}>
        
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 8px 0', color: 'var(--color-text-primary)' }}>
            선제 영업 찬스 ⏳
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', margin: 0, lineHeight: '1.5' }}>
            계약 만료가 6개월 이내로 다가온 호실입니다.<br/>
            임대인에게 연락하여 재계약 여부를 미리 확인해 보세요!
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-secondary)' }}>
              ⏳ 만기 임박 호실을 조회 중입니다...
            </div>
          ) : expiringUnits.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-secondary)' }}>
              만기가 다가오는 호실이 없습니다.<br/>
              임대인이 앱에서 계약 정보를 등록하면 자동으로 표시됩니다.
            </div>
          ) : (
            expiringUnits.map(unit => (
              <Card key={unit.id} style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--color-text-primary)' }}>
                    {unit.buildingName} {unit.unitNumber}
                  </h3>
                  <StatusBadge 
                    status={unit.dDay <= 60 ? 'danger' : 'warning'} 
                    label={`D-${unit.dDay}`} 
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span style={{ color: 'var(--color-text-tertiary)' }}>계약 만료일</span>
                    <span style={{ fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>{unit.endDate}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span style={{ color: 'var(--color-text-tertiary)' }}>현재 세입자</span>
                    <span style={{ color: 'var(--color-text-secondary)' }}>{unit.tenantName}</span>
                  </div>
                </div>

                <div style={{ background: 'var(--color-primary-50)', padding: '16px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--color-primary-700)' }}>임대인 연락처</span>
                    <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--color-primary-700)' }}>
                      {unit.landlordName} ({formatPhoneNumber(unit.landlordPhone)})
                    </span>
                  </div>
                  
                  <Button variant="primary" fullWidth
                    onClick={() => {
                      if(window.confirm(`'${unit.landlordName}' 임대인님께 전화하시겠습니까?\n\n(영업 팁: "사장님, ${unit.unitNumber} 만기가 다가오는데, 재계약 하시나요? 아니면 제가 새로운 분 구해드릴까요?")`)) {
                        window.location.href = `tel:${(unit.landlordPhone || '').replace(/-/g, '')}`;
                      }
                    }}
                  >
                    📞 선제 영업 전화하기
                  </Button>
                </div>

                {/* 영업 메모 */}
                <div style={{ marginTop: '12px', background: '#FFFBEB', padding: '14px', borderRadius: '10px', border: '1px solid #FDE68A' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#92400E' }}>📝 영업 메모</span>
                    {memos[unit.id]?.updatedAt && (
                      <span style={{ fontSize: '11px', color: '#B45309' }}>
                        {memos[unit.id].updatedAt.split('T')[0]}
                      </span>
                    )}
                  </div>
                  <textarea
                    rows={2}
                    placeholder="예: 7/20 전화 - 재계약 의향 있음, 8월 초 다시 연락"
                    value={editingMemo[unit.id] !== undefined ? editingMemo[unit.id] : (memos[unit.id]?.memo || '')}
                    onChange={e => setEditingMemo(prev => ({ ...prev, [unit.id]: e.target.value }))}
                    onBlur={e => {
                      const val = e.target.value;
                      if (val !== (memos[unit.id]?.memo || '')) {
                        handleMemoSave(unit.id, val);
                      }
                      setEditingMemo(prev => { const n = {...prev}; delete n[unit.id]; return n; });
                    }}
                    style={{
                      width: '100%', padding: '10px', borderRadius: '8px',
                      border: '1px solid #FDE68A', fontSize: '14px',
                      background: 'white', resize: 'none', lineHeight: 1.5,
                      color: 'var(--color-text-primary)'
                    }}
                  />
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

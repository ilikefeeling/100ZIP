import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import usePropertyStore from '../../stores/propertyStore';
import TopBar from '../../components/TopBar';
import Card from '../../components/Card';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';
import './RentDetail.css';

/**
 * LL-005a 납부 상세 내역
 * 특정 호실의 월별 납부 이력 타임라인, 독촉/조정 기능 연결
 */
export default function RentDetail() {
  const navigate = useNavigate();
  const { buildingId, unitId } = useParams();
  const unit = usePropertyStore((s) => s.getUnit(buildingId, unitId));
  const building = usePropertyStore((s) => s.getBuilding(buildingId));

  if (!unit || !unit.contract) {
    return (
      <div className="page">
        <TopBar title="납부 상세" />
        <div className="page-content" style={{ padding: '40px', textAlign: 'center' }}>
          계약 정보가 없습니다.
        </div>
      </div>
    );
  }

  const contract = unit.contract;
  const rentTotal = (contract.monthlyRent || 0) + (contract.maintenanceFee || 0);

  // Mock 납부 이력 (최근 3개월) - 수동 처리를 위해 state로 변환
  const [mockRecords, setMockRecords] = useState([
    { id: 1, month: '7월', status: '미납', amount: rentTotal, date: '-' },
    { id: 2, month: '6월', status: '납부완료', amount: rentTotal, date: '06.25' },
    { id: 3, month: '5월', status: '납부완료', amount: rentTotal, date: '05.26' },
  ]);

  const handleMarkAsPaid = (id) => {
    if (window.confirm('실제 통장 입금 내역을 확인하셨나요?\n[납부 완료] 상태로 변경합니다.')) {
      setMockRecords(mockRecords.map(r => 
        r.id === id ? { ...r, status: '납부완료', date: new Date().toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' }).replace('.', '.').replace(' ', '') } : r
      ));
    }
  };

  const handleReceipt = (record) => {
    alert(`${record.month} 납부금(${record.amount.toLocaleString()}원)에 대한 영수증을 생성했습니다!\n\n(※ 실제 서비스에서는 카카오톡 전송 또는 이미지 저장 기능이 실행됩니다.)`);
  };

  return (
    <div className="page">
      <TopBar title={`${building.address} ${unit.unitNumber}`} />
      
      <div className="page-content rent-detail">
        <Card>
          <div className="rent-detail__summary">
            <h2 className="rent-detail__tenant">{contract.tenantName} 임차인</h2>
            <div className="rent-detail__amount-row">
              <span>월 납부금액</span>
              <span className="rent-detail__amount tabular-nums">
                {rentTotal.toLocaleString()}원
              </span>
            </div>
            <div className="rent-detail__actions">
              <Button
                variant="secondary"
                onClick={() => navigate(`/landlord/buildings/${buildingId}/units/${unitId}/rent/adjust`)}
              >
                금액 확인 / 조정
              </Button>
            </div>
          </div>
        </Card>

        <div className="rent-detail__history">
          <h3 className="rent-detail__history-title">납부 이력</h3>
          <div className="rent-detail__list">
            {mockRecords.map((record) => (
              <div key={record.id} className="rent-detail__item" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="rent-detail__item-left">
                    <span className="rent-detail__month">{record.month}분</span>
                    <span className="rent-detail__date">{record.date}</span>
                  </div>
                  <div className="rent-detail__item-right">
                    <span className="rent-detail__item-amount tabular-nums">
                      {record.amount.toLocaleString()}원
                    </span>
                    <StatusBadge
                      status={record.status === '납부완료' ? 'success' : 'warning'}
                      label={record.status}
                    />
                  </div>
                </div>
                
                {/* 액션 버튼 영역 */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px', justifyContent: 'flex-end' }}>
                  {record.status === '미납' && (
                    <button 
                      onClick={() => handleMarkAsPaid(record.id)}
                      style={{ background: 'var(--color-primary-100)', color: 'var(--color-primary-600)', border: 'none', padding: '6px 12px', borderRadius: '4px', fontSize: '18px', fontWeight: '600', cursor: 'pointer' }}
                    >
                      ✓ 수동 납부 확인
                    </button>
                  )}
                  {record.status === '납부완료' && (
                    <button 
                      onClick={() => handleReceipt(record)}
                      style={{ background: 'var(--color-surface-dim)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)', padding: '5px 11px', borderRadius: '4px', fontSize: '18px', fontWeight: '600', cursor: 'pointer' }}
                    >
                      🧾 영수증 발급
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 하단 독촉 버튼 (미납이 있는 경우만 활성화) */}
        <div className="rent-detail__footer">
          <Button
            variant={mockRecords.some(r => r.status === '미납') ? 'accent' : 'secondary'}
            disabled={!mockRecords.some(r => r.status === '미납')}
            onClick={() => alert(`[카카오톡 발송 미리보기]\n\n${contract.tenantName}님, ${mockRecords.find(r => r.status === '미납')?.month} 임차료 ${rentTotal.toLocaleString()}원이 미납되었습니다. 빠른 납부 부탁드립니다.\n\n(※ 실제로는 부드러운 어조의 카카오톡 알림톡이 전송됩니다.)`)}
          >
            미납 독촉 알림 보내기
          </Button>
        </div>
      </div>
    </div>
  );
}

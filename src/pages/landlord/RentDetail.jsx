import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import usePropertyStore from '../../stores/propertyStore';
import TopBar from '../../components/TopBar';
import Card from '../../components/Card';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';
import NotificationModal from '../../components/NotificationModal';
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

  const updateContract = usePropertyStore((s) => s.updateContract);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
  const rentRecords = contract.rentRecords || [];

  // MVP 테스트용: rentRecords가 비어있으면 초기 목업 데이터로 세팅 (백엔드 배치 역할 대체)
  if (rentRecords.length === 0) {
    const initialRecords = [
      { id: 1, month: '7월', status: '미납', date: '-', lastSentDate: null, reminderCount: 0 },
      { id: 2, month: '6월', status: '납부완료', date: '06.25', lastSentDate: null, reminderCount: 0 },
      { id: 3, month: '5월', status: '납부완료', date: '05.26', lastSentDate: null, reminderCount: 0 },
    ];
    // 컴포넌트 마운트 후 비동기로 업데이트하여 렌더링 중 상태 변경 경고 방지
    setTimeout(() => {
      updateContract(buildingId, unitId, { rentRecords: initialRecords });
    }, 0);
  }

  // Update records with actual amounts dynamically
  const records = rentRecords.map(r => ({ ...r, amount: rentTotal }));

  const handleMarkAsPaid = async (id) => {
    if (window.confirm('실제 통장 입금 내역을 확인하셨나요?\n[납부 완료] 상태로 변경합니다.')) {
      const updated = rentRecords.map(r => 
        r.id === id ? { ...r, status: '납부완료', date: new Date().toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' }).replace('.', '.').replace(' ', '') } : r
      );
      await updateContract(buildingId, unitId, { rentRecords: updated });
    }
  };

  const handleReceipt = (record) => {
    navigate(`/landlord/buildings/${buildingId}/units/${unitId}/rent/receipt/${record.id}`);
  };

  // 미납 타겟 찾기 및 쿨타임/횟수 제한/시간 제한 계산
  const targetRecord = records.find(r => r.status === '미납');
  let isCooldown = false;
  let isMaxCount = false;
  let isOutsideAllowedTime = false;
  let buttonText = '미납 독촉 알림 보내기';
  
  if (targetRecord) {
    const currentHour = new Date().getHours();
    
    // 알림톡 야간 발송 제한 (09:00 ~ 20:00 만 허용)
    if (currentHour < 9 || currentHour >= 20) {
      isOutsideAllowedTime = true;
      buttonText = '심야 발송 제한 (09:00~20:00 가능)';
    } else if (targetRecord.reminderCount >= 3) {
      // 알림톡 횟수 제한 (최대 3회)
      isMaxCount = true;
      buttonText = '월 최대 발송 횟수(3회) 초과';
    } else if (targetRecord.lastSentDate) {
      const lastDate = new Date(targetRecord.lastSentDate);
      const now = new Date();
      const diffTime = now.getTime() - lastDate.getTime();
      const cooldownMs = 3 * 24 * 60 * 60 * 1000; // 3일 쿨타임
      
      // 쿨타임 체크
      if (diffTime < cooldownMs) {
        isCooldown = true;
        const daysLeft = Math.ceil((cooldownMs - diffTime) / (1000 * 60 * 60 * 24));
        buttonText = `[쿨타임 중] ${daysLeft}일 후 재발송 가능`;
      }
    }
  }

  const handleSendReminder = async () => {
    if (!targetRecord) return;
    if (isOutsideAllowedTime) {
      alert('09:00부터 20:00까지만 독촉 알림을 발송할 수 있습니다.\n야간 발송은 임차인과의 분쟁(스토킹 처벌법 등) 소지가 있어 차단됩니다.');
      return;
    }
    
    setIsModalOpen(true);
  };

  const onConfirmSend = async () => {
    setIsModalOpen(false);
    // 발송 이력 업데이트 (실제 DB 반영)
    const updated = rentRecords.map(r => 
      r.id === targetRecord.id 
        ? { ...r, lastSentDate: new Date().toISOString(), reminderCount: (r.reminderCount || 0) + 1 }
        : r
    );
    await updateContract(buildingId, unitId, { rentRecords: updated });
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
            {records.map((record) => (
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
                
                {/* 마지막 발송일 표시 */}
                {record.lastSentDate && (
                  <div style={{ fontSize: '13px', color: 'var(--color-text-tertiary)', marginTop: '8px', textAlign: 'right' }}>
                    마지막 알림: {new Date(record.lastSentDate).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} ({record.reminderCount}/3회)
                  </div>
                )}
                
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

        <div className="rent-detail__footer">
          <Button
            variant={targetRecord && !isCooldown && !isMaxCount && !isOutsideAllowedTime ? 'accent' : 'secondary'}
            disabled={!targetRecord || isCooldown || isMaxCount || isOutsideAllowedTime}
            onClick={handleSendReminder}
          >
            {targetRecord ? buttonText : '미납 독촉 알림 보내기'}
          </Button>
        </div>
      </div>

      {targetRecord && (
        <NotificationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={onConfirmSend}
          title="임대료 납부 안내 (알림톡)"
          tenantName={contract.tenantName}
          message={`[100집 납부 안내]\n\n${contract.tenantName}님, 안녕하세요.\n${targetRecord.month} 임차료 ${rentTotal.toLocaleString()}원이 미납되었습니다.\n\n바쁘시겠지만, 확인 후 빠른 납부 부탁드립니다.\n감사합니다.`}
        />
      )}
    </div>
  );
}

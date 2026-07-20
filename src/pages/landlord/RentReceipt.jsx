import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import usePropertyStore from '../../stores/propertyStore';
import TopBar from '../../components/TopBar';
import Button from '../../components/Button';
import NotificationModal from '../../components/NotificationModal';
import './RentReceipt.css';

/**
 * 영수증 발급 화면
 * 납부 완료된 월세에 대한 영수증을 화면에 렌더링하고, PDF 다운로드(인쇄) 기능 제공
 */
export default function RentReceipt() {
  const navigate = useNavigate();
  const { buildingId, unitId, recordId } = useParams();
  
  const building = usePropertyStore((s) => s.getBuilding(buildingId));
  const unit = building?.units?.find((u) => u.id === unitId);
  const contract = unit?.contract;
  
  // records를 숫자로 매칭
  const record = contract?.rentRecords?.find((r) => r.id === parseInt(recordId, 10));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inviteLink, setInviteLink] = useState('');

  if (!unit || !contract || !record) {
    return (
      <div className="page">
        <TopBar title="영수증 발급" />
        <div className="page-content" style={{ padding: '40px', textAlign: 'center' }}>
          계약 정보 또는 납부 이력을 찾을 수 없습니다.
        </div>
      </div>
    );
  }

  const rentTotal = (contract.monthlyRent || 0) + (contract.maintenanceFee || 0);
  const today = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });

  const handleSendReceipt = () => {
    // 가상의 모바일 웹 영수증 링크
    const link = `${window.location.origin}/receipt/${buildingId}/${unitId}/${recordId}`;
    setInviteLink(link);
    setIsModalOpen(true);
  };

  const onConfirmSend = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="page">
      <TopBar title="월세 영수증" />
      <div className="page-content rent-receipt">
        
        <div className="rent-receipt__paper">
          <div className="rent-receipt__header">
            <h2>영 수 증</h2>
          </div>

          <div className="rent-receipt__body">
            <div className="rent-receipt__row">
              <span className="rent-receipt__label">성 명 (상호)</span>
              <span className="rent-receipt__value">{contract.tenantName} 귀하</span>
            </div>
            
            <div className="rent-receipt__row">
              <span className="rent-receipt__label">일 금</span>
              <span className="rent-receipt__value rent-receipt__amount">
                {rentTotal.toLocaleString()} 원정
              </span>
            </div>

            <div className="rent-receipt__row">
              <span className="rent-receipt__label">내 역</span>
              <span className="rent-receipt__value">
                {building?.name || building?.address} {unit?.unitNumber}호 {record.month}분 임대료 및 관리비
              </span>
            </div>

            <p className="rent-receipt__text">
              위 금액을 정히 영수함.
            </p>

            <div className="rent-receipt__date">
              {today}
            </div>

            <div className="rent-receipt__sender">
              <div className="rent-receipt__sender-info">
                임대인: {building.userId ? '(서명 생략)' : '임대인 성명'}
              </div>
            </div>
          </div>
        </div>

        <div className="rent-receipt__actions no-print">
          <Button variant="secondary" onClick={() => navigate(-1)}>뒤로 가기</Button>
          <div style={{ display: 'flex', gap: '8px', flex: 1 }}>
            <Button variant="primary" onClick={() => window.print()} style={{ flex: 1 }}>PDF 다운로드</Button>
            <Button variant="accent" onClick={handleSendReceipt} style={{ flex: 1 }}>알림톡 발송</Button>
          </div>
        </div>

      </div>

      <NotificationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={onConfirmSend}
        title="영수증 발송 (알림톡)"
        tenantName={contract.tenantName}
        message={`[100집 영수증 발급 안내]\n\n${contract.tenantName}님, 안녕하세요.\n${record.month} 임차료 ${rentTotal.toLocaleString()}원에 대한 영수증이 발급되었습니다.\n\n아래 링크를 눌러 확인해 주세요.\n${inviteLink}`}
      />
    </div>
  );
}

import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import usePropertyStore from '../../stores/propertyStore';
import TopBar from '../../components/TopBar';
import Button from '../../components/Button';
import './TenantRentAdjust.css';

/**
 * TN-005 금액 확인
 * 임대인이 청구한 내역(월세+관리비+추가요금) 확인 후 동의 또는 이의제기
 */
export default function TenantRentAdjust() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const buildings = usePropertyStore((s) => s.buildings);

  // 계약 정보 매칭
  let myContract = null;
  for (const b of buildings) {
    const unit = b.units?.find((u) => u.contract && u.contract.tenantName === user?.name);
    if (unit) {
      myContract = unit.contract;
      break;
    }
  }

  if (!myContract) return null;

  const baseRent = myContract.monthlyRent || 0;
  const maintenance = myContract.maintenanceFee || 0;

  // Mock 추가 요금
  const adjustments = [
    { type: '가스비', amount: 15000 }
  ];

  const totalAmount = baseRent + maintenance + adjustments.reduce((acc, cur) => acc + cur.amount, 0);

  const handleAccept = () => {
    alert('금액이 확정되었습니다. 이제 납부를 진행해주세요.');
    navigate('/tenant/payments', { replace: true });
  };

  const handleDispute = () => {
    const reason = window.prompt('조정이 필요한 사유를 입력해주세요. (예: 이번달 가스비가 중복 청구됨)');
    if (reason) {
      alert('임대인에게 조정 요청을 보냈습니다.');
      navigate('/tenant/payments', { replace: true });
    }
  };

  return (
    <div className="page">
      <TopBar title="이번 달 청구 금액 확인" />
      <div className="page-content t-rent-adjust">
        <div className="t-rent-adjust__header">
          <h2 className="t-rent-adjust__title">7월분 청구서 내역</h2>
          <p className="t-rent-adjust__desc">항목이 맞는지 확인해주세요.</p>
        </div>

        <div className="t-rent-adjust__breakdown">
          <div className="t-rent-adjust__item">
            <span className="t-rent-adjust__label">기본 월세</span>
            <span className="t-rent-adjust__value tabular-nums">{baseRent.toLocaleString()}원</span>
          </div>
          <div className="t-rent-adjust__item">
            <span className="t-rent-adjust__label">공용 관리비</span>
            <span className="t-rent-adjust__value tabular-nums">{maintenance.toLocaleString()}원</span>
          </div>
          
          {adjustments.map((adj, i) => (
            <div key={i} className="t-rent-adjust__item t-rent-adjust__item--added">
              <span className="t-rent-adjust__label">{adj.type}</span>
              <span className="t-rent-adjust__value tabular-nums">+{adj.amount.toLocaleString()}원</span>
            </div>
          ))}
        </div>

        <div className="t-rent-adjust__total">
          <span className="t-rent-adjust__total-label">총 청구 금액</span>
          <span className="t-rent-adjust__total-value tabular-nums">{totalAmount.toLocaleString()}원</span>
        </div>

        <div className="t-rent-adjust__footer">
          <div className="t-rent-adjust__actions">
            <Button variant="secondary" onClick={handleDispute}>
              금액이 이상해요 (조정 요청)
            </Button>
            <Button variant="primary" onClick={handleAccept}>
              맞아요 (확정하기)
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

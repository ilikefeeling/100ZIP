import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import usePropertyStore from '../../stores/propertyStore';
import TopBar from '../../components/TopBar';
import Button from '../../components/Button';
import './TenantMoveOutSettle.css';

export default function TenantMoveOutSettle() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const buildings = usePropertyStore((s) => s.buildings);
  const updateContract = usePropertyStore((s) => s.updateContract);

  let myContract = null;
  let myUnit = null;
  let myBuilding = null;

  for (const b of buildings) {
    const unit = b.units?.find((u) => u.contract && u.contract.tenantName === user?.name);
    if (unit) {
      myBuilding = b;
      myUnit = unit;
      myContract = unit.contract;
      break;
    }
  }

  if (!myContract || !myContract.moveOutSettle) {
    return (
      <div className="page">
        <TopBar title="퇴거 정산 내역" onBack={() => navigate(-1)} />
        <div className="page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p>정산 내역이 없습니다.</p>
        </div>
      </div>
    );
  }

  const {
    deposit,
    deductions,
    totalDeduction,
    returnAmount,
    tenantPaidItems,
    refundBank,
    refundAccount,
  } = myContract.moveOutSettle;

  const handleApprove = async () => {
    if (window.confirm('정산 내역에 동의하고 승인하시겠습니까?\n승인 시 임대인에게 최종 확정 알림이 전송됩니다.')) {
      // MVP: 승인 시 공실 처리 (status: 공실)
      await updateContract(myBuilding.id, myUnit.id, { status: '공실' });
      alert('정산 내역이 승인되었습니다.\n그동안 거주해 주셔서 감사합니다!');
      navigate('/tenant/home', { replace: true });
    }
  };

  return (
    <div className="page">
      <TopBar title="퇴거 정산 승인" onBack={() => navigate(-1)} />
      <div className="page-content tenant-move-out">
        <div className="tenant-move-out__header">
          <h2>임대인이 보낸<br/>정산 내역을 확인해주세요</h2>
          <p>{myBuilding.address} {myUnit.unitNumber}</p>
        </div>

        <div className="tenant-move-out__card">
          <div className="tenant-move-out__row">
            <span>보증금 원금</span>
            <strong>{deposit.toLocaleString()}원</strong>
          </div>
          
          <div className="tenant-move-out__divider" />
          
          <div className="tenant-move-out__section-title">차감 및 가산 내역</div>
          {deductions.length === 0 ? (
            <div className="tenant-move-out__empty-deduction">내역 없음</div>
          ) : (
            <div className="tenant-move-out__deductions">
              {deductions.map((d, i) => (
                <div key={i} className="tenant-move-out__deduction-item">
                  <span>{d.type}</span>
                  <span className={d.amount < 0 ? 'text-positive' : 'text-negative'}>
                    {d.amount < 0 ? '+' : '-'}{Math.abs(d.amount).toLocaleString()}원
                  </span>
                </div>
              ))}
            </div>
          )}
          
          <div className="tenant-move-out__divider" />
          
          <div className="tenant-move-out__total">
            <span>최종 반환 보증금</span>
            <strong>{returnAmount.toLocaleString()}원</strong>
          </div>
        </div>

        <div className="tenant-move-out__card">
          <div className="tenant-move-out__section-title">반환 받을 계좌</div>
          <div className="tenant-move-out__account">
            {refundBank} {refundAccount}
          </div>
        </div>

        <div className="tenant-move-out__actions">
          <Button variant="outline" onClick={() => alert('임대인에게 문의 메시지를 보냅니다. (개발중)')}>
            문의하기
          </Button>
          <Button variant="primary" onClick={handleApprove}>
            동의 및 승인하기
          </Button>
        </div>
      </div>
    </div>
  );
}

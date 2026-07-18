import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import usePropertyStore from '../../stores/propertyStore';
import TopBar from '../../components/TopBar';
import BottomTabBar from '../../components/BottomTabBar';
import StatusBadge from '../../components/StatusBadge';
import './TenantPayments.css';

/**
 * TN-004 납부내역
 * 임차인의 지난 납부 이력 타임라인 및 전자영수증 확인(Mock)
 */
export default function TenantPayments() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const buildings = usePropertyStore((s) => s.buildings);

  // MVP: 연결된 계약 찾기
  let myContract = null;
  let myUnit = null;
  for (const b of buildings) {
    const unit = b.units?.find((u) => u.contract && u.contract.tenantName === user?.name);
    if (unit) {
      myUnit = unit;
      myContract = unit.contract;
      break;
    }
  }

  if (!myContract) {
    return (
      <div className="page">
        <TopBar title="납부내역" showBack={false} />
        <div className="page-content" style={{ padding: '40px', textAlign: 'center' }}>
          연결된 계약이 없습니다.
        </div>
        <BottomTabBar role="tenant" />
      </div>
    );
  }

  const rentTotal = (myContract.monthlyRent || 0) + (myContract.maintenanceFee || 0);

  // Mock 납부 이력 (최근 6개월)
  const mockRecords = [
    { month: '7월', status: '미납', amount: rentTotal + 15000 /* 가스비 추가 예시 */, date: '-', details: '월세+가스비' },
    { month: '6월', status: '납부완료', amount: rentTotal, date: '06.25', details: '월세+관리비' },
    { month: '5월', status: '납부완료', amount: rentTotal, date: '05.26', details: '월세+관리비' },
    { month: '4월', status: '납부완료', amount: rentTotal, date: '04.25', details: '월세+관리비' },
  ];

  return (
    <div className="page">
      <TopBar title="납부내역" showBack={false} />
      
      <div className="page-content tenant-payments">
        <div className="tenant-payments__header">
          <h2 className="tenant-payments__title">최근 납부 이력</h2>
          <p className="tenant-payments__desc">영수증이 필요하면 항목을 눌러보세요.</p>
        </div>

        <div className="tenant-payments__list">
          {mockRecords.map((record, i) => (
            <div 
              key={i} 
              className="tenant-payments__item"
              onClick={() => {
                if (record.status === '납부완료') {
                  alert('전자 영수증 화면으로 이동합니다. (Mock)');
                } else if (record.month === '7월') {
                  // 이번달 미납건은 금액확인/조정 요청 화면으로 이동
                  navigate('/tenant/payments/adjust');
                }
              }}
            >
              <div className="tenant-payments__item-left">
                <span className="tenant-payments__month">{record.month}분 청구서</span>
                <span className="tenant-payments__details">{record.details}</span>
                <span className="tenant-payments__date">{record.date !== '-' ? `${record.date} 납부` : '납부기한 확인 요망'}</span>
              </div>
              <div className="tenant-payments__item-right">
                <span className="tenant-payments__item-amount tabular-nums">
                  {record.amount.toLocaleString()}원
                </span>
                <StatusBadge
                  status={record.status === '납부완료' ? 'success' : 'warning'}
                  label={record.status}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <BottomTabBar role="tenant" />
    </div>
  );
}

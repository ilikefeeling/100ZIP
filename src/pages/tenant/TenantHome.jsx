import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import usePropertyStore from '../../stores/propertyStore';
import BottomTabBar from '../../components/BottomTabBar';
import Card from '../../components/Card';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';
import './TenantHome.css';

/**
 * TN-001 임차인 홈
 * 내 계약 정보 요약 + 이달의 청구서
 * 서명이 안된 경우 상단에 서명 유도 배너
 */
export default function TenantHome() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const buildings = usePropertyStore((s) => s.buildings);

  // MVP: 임차인은 첫 번째 건물의 첫 번째 임대중 호실을 본인의 계약으로 간주
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

  // 연결된 계약이 없는 경우
  if (!myContract) {
    return (
      <div className="page">
        <div className="page-content tenant-home--empty">
          <div className="tenant-home__greeting" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '24px' }}>
            <div>
              <h1 className="tenant-home__hello" style={{ lineHeight: '1.2' }}>
                <span style={{ fontSize: '16px', fontWeight: '500', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>안녕하세요,</span>
                <strong>{user?.name || '임차인'}</strong>님
              </h1>
            </div>
            <button
              onClick={async () => {
                if (window.confirm('로그아웃 하시겠습니까?')) {
                  await logout();
                  navigate('/login', { replace: true });
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
          <div className="tenant-home__empty-icon">✉️</div>
          <p className="tenant-home__empty-text">
            아직 연결된 계약이 없습니다.<br />임대인이 보낸 링크를 다시 확인해주세요.
          </p>
        </div>
        <BottomTabBar role="tenant" />
      </div>
    );
  }

  const needsSignature = !myContract.tenantSigned;
  const needsSettleConfirm = myContract.status === '정산대기';
  const rentTotal = (myContract.monthlyRent || 0) + (myContract.maintenanceFee || 0);

  return (
    <div className="page">
      <div className="page-content tenant-home">
        <div className="tenant-home__greeting" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="tenant-home__hello" style={{ lineHeight: '1.2' }}>
              <span style={{ fontSize: '16px', fontWeight: '500', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>안녕하세요,</span>
              <strong>{user?.name || '임차인'}</strong>님
            </h1>
            <p className="tenant-home__sub">{myBuilding.address} {myUnit.unitNumber}</p>
          </div>
          <button
            onClick={async () => {
              if (window.confirm('로그아웃 하시겠습니까?')) {
                await logout();
                navigate('/login', { replace: true });
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

        {/* 서명 요청 배너 */}
        {needsSignature && (
          <div className="tenant-home__banner" onClick={() => navigate('/tenant/sign')}>
            <div className="tenant-home__banner-content">
              <span className="tenant-home__banner-icon">✍️</span>
              <div className="tenant-home__banner-text">
                <p className="tenant-home__banner-title">전자서명이 필요해요</p>
                <p className="tenant-home__banner-desc">계약서를 확인하고 서명해주세요</p>
              </div>
            </div>
            <span className="tenant-home__banner-arrow">→</span>
          </div>
        )}

        {/* 정산 대기 배너 */}
        {needsSettleConfirm && (
          <div className="tenant-home__banner" style={{ background: 'var(--color-primary-50)' }} onClick={() => navigate('/tenant/move-out-settle')}>
            <div className="tenant-home__banner-content">
              <span className="tenant-home__banner-icon">💰</span>
              <div className="tenant-home__banner-text">
                <p className="tenant-home__banner-title" style={{ color: 'var(--color-primary-700)' }}>퇴거 정산 확인이 필요해요</p>
                <p className="tenant-home__banner-desc">임대인이 보낸 정산 내역을 승인해주세요</p>
              </div>
            </div>
            <span className="tenant-home__banner-arrow" style={{ color: 'var(--color-primary-500)' }}>→</span>
          </div>
        )}

        {/* 이달의 청구서 */}
        <Card>
          <div className="tenant-home__bill">
            <div className="tenant-home__bill-header">
              <h2 className="tenant-home__bill-title">이번 달 청구금액</h2>
              <StatusBadge status="warning" label="미납" />
            </div>
            <div className="tenant-home__bill-amount tabular-nums">
              {rentTotal.toLocaleString()}원
            </div>
            <div className="tenant-home__bill-desc">
              월세 {myContract.monthlyRent.toLocaleString()} + 관리비 {myContract.maintenanceFee.toLocaleString()}
            </div>
            <Button variant="primary">납부하기</Button>
          </div>
        </Card>

        {/* 입주키트 퀵버튼 */}
        <div className="tenant-home__quick">
          <h3 className="tenant-home__quick-title">우리집 정보</h3>
          <div className="tenant-home__quick-grid">
            <button className="tenant-home__quick-btn" onClick={() => navigate('/tenant/kit')}>
              <span className="tenant-home__quick-icon">🔐</span>
              <span>입주키트 보기</span>
            </button>
            <button className="tenant-home__quick-btn" onClick={() => alert('계약서 원본 보기 (준비중)')}>
              <span className="tenant-home__quick-icon">📜</span>
              <span>계약서 보기</span>
            </button>
          </div>
        </div>

      </div>
      <BottomTabBar role="tenant" />
    </div>
  );
}

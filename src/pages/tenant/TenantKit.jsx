import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import usePropertyStore from '../../stores/propertyStore';
import TopBar from '../../components/TopBar';
import Card from '../../components/Card';
import './TenantKit.css';

/**
 * TN-002 입주키트 확인
 * 임대인이 작성한 비밀번호, 쓰레기 배출, 연락망 등 확인
 */
export default function TenantKit() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const buildings = usePropertyStore((s) => s.buildings);

  // 현재 연결된 계약/호실 찾기 (TenantHome과 동일 로직)
  let myUnit = null;
  let myBuilding = null;
  for (const b of buildings) {
    const unit = b.units?.find((u) => u.contract && u.contract.tenantName === user?.name);
    if (unit) {
      myUnit = unit;
      myBuilding = b;
      break;
    }
  }

  if (!myUnit || !myUnit.contract?.kit) {
    return (
      <div className="page">
        <TopBar title="우리집 정보" />
        <div className="page-content" style={{ padding: '40px', textAlign: 'center' }}>
          입주키트 정보가 없습니다.
        </div>
      </div>
    );
  }

  const kit = myUnit.contract.kit;

  return (
    <div className="page">
      <TopBar title="우리집 정보 (입주키트)" />
      <div className="page-content tenant-kit">
        
        {/* 비밀번호 */}
        <Card>
          <div className="tenant-kit__section">
            <h2 className="tenant-kit__title">
              <span className="tenant-kit__icon">🔐</span> 비밀번호
            </h2>
            <div className="tenant-kit__row">
              <span className="tenant-kit__label">공동현관/호실</span>
              <span className="tenant-kit__value">{kit.access?.doorCode || '-'}</span>
            </div>
            <div className="tenant-kit__row">
              <span className="tenant-kit__label">와이파이</span>
              <span className="tenant-kit__value">{kit.access?.wifiCode || '-'}</span>
            </div>
          </div>
        </Card>

        {/* 안내사항 */}
        <Card>
          <div className="tenant-kit__section">
            <h2 className="tenant-kit__title">
              <span className="tenant-kit__icon">📌</span> 안내사항
            </h2>
            <div className="tenant-kit__row">
              <span className="tenant-kit__label">쓰레기 배출</span>
              <span className="tenant-kit__value">{kit.specialTerms?.trashInfo || '-'}</span>
            </div>
            <div className="tenant-kit__row">
              <span className="tenant-kit__label">주차</span>
              <span className="tenant-kit__value">{kit.specialTerms?.parkingInfo || '-'}</span>
            </div>
            <div className="tenant-kit__row">
              <span className="tenant-kit__label">공통 고지</span>
              <span className="tenant-kit__value">{kit.specialTerms?.commonNotice || '-'}</span>
            </div>
          </div>
        </Card>

        {/* 임차료 수납 계좌 */}
        <Card>
          <div className="tenant-kit__section">
            <h2 className="tenant-kit__title">
              <span className="tenant-kit__icon">💰</span> 임차료 수납 계좌
            </h2>
            <div className="tenant-kit__row">
              <span className="tenant-kit__label">은행</span>
              <span className="tenant-kit__value">{myBuilding?.rentBank || '-'}</span>
            </div>
            <div className="tenant-kit__row">
              <span className="tenant-kit__label">계좌번호</span>
              <span className="tenant-kit__value">{myBuilding?.rentAccount || '-'}</span>
            </div>
            <div className="tenant-kit__row">
              <span className="tenant-kit__label">월세 입금일</span>
              <span className="tenant-kit__value">
                {myUnit.contract?.rentPaymentDay 
                  ? `매월 ${myUnit.contract.rentPaymentDay}일 (${myUnit.contract.rentPaymentType === 'prepaid' ? '선불' : '후불'})` 
                  : '-'}
              </span>
            </div>
          </div>
        </Card>

        {/* 비상 연락망 */}
        <Card>
          <div className="tenant-kit__section">
            <h2 className="tenant-kit__title">
              <span className="tenant-kit__icon">📞</span> 연락망
            </h2>
            <div className="tenant-kit__contact">
              <span className="tenant-kit__contact-name">임대인 (건물주)</span>
              <button
                className="tenant-kit__call-btn"
                onClick={() => window.location.href = 'tel:010-0000-0000'}
              >
                전화하기
              </button>
            </div>
            <p className="tenant-kit__contact-desc">수리 및 관리 문의</p>
          </div>
        </Card>

      </div>
    </div>
  );
}

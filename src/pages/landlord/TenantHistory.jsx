import { useParams, useNavigate } from 'react-router-dom';
import usePropertyStore from '../../stores/propertyStore';
import TopBar from '../../components/TopBar';
import Card from '../../components/Card';
import Button from '../../components/Button';
import CurrencyDisplay from '../../components/CurrencyDisplay';
import StatusBadge from '../../components/StatusBadge';
import { formatKoreanCurrency } from '../../utils/format';
import './TenantHistory.css';

export default function TenantHistory() {
  const { buildingId, unitId } = useParams();
  const navigate = useNavigate();
  
  const unit = usePropertyStore((s) => s.getUnit(buildingId, unitId));
  const updateUnit = usePropertyStore((s) => s.updateUnit);

  if (!unit) return null;

  const history = unit.contractHistory || [];

  const handleAddMockData = async () => {
    const mockHistory = [
      {
        id: `ctr_${Date.now()}_1`,
        tenantName: '홍길동',
        deposit: 10000000,
        monthlyRent: 500000,
        startDate: '2023-01-01',
        endDate: '2024-01-01',
        status: '정산완료',
        deductions: 50000, // mock
      },
      {
        id: `ctr_${Date.now()}_2`,
        tenantName: '이순신',
        deposit: 5000000,
        monthlyRent: 400000,
        startDate: '2021-05-01',
        endDate: '2022-05-01',
        status: '정산완료',
        deductions: 0,
      }
    ];

    await updateUnit(buildingId, unitId, { contractHistory: mockHistory });
    alert('테스트용 과거 이력이 추가되었습니다.');
  };

  return (
    <div className="page">
      <TopBar title="임차 이력 보기" onBack={() => navigate(-1)} />
      <div className="page-content tenant-history">
        {history.length === 0 ? (
          <div className="tenant-history__empty">
            <span className="tenant-history__empty-icon">📜</span>
            <p className="tenant-history__empty-text">과거 임차 이력이 없습니다.</p>
            <Button variant="outline" onClick={handleAddMockData}>
              테스트용 가짜 이력 추가
            </Button>
          </div>
        ) : (
          <div className="tenant-history__list">
            {history.map((contract) => (
              <Card key={contract.id} className="tenant-history__card">
                <div className="tenant-history__header">
                  <span className="tenant-history__tenant-name">{contract.tenantName || '이름 없음'}</span>
                  <StatusBadge 
                    status={contract.status === '정산완료' ? 'success' : 'neutral'} 
                    label={contract.status || '종료'}
                  />
                </div>
                <div className="tenant-history__period">
                  {contract.startDate} ~ {contract.endDate}
                </div>
                
                <div style={{ margin: 'var(--space-2) 0', borderTop: '1px solid var(--color-border)' }} />

                <div className="tenant-history__row">
                  <span className="tenant-history__label">보증금</span>
                  <span className="tenant-history__value"><CurrencyDisplay amount={contract.deposit} /></span>
                </div>
                <div className="tenant-history__row">
                  <span className="tenant-history__label">월세</span>
                  <span className="tenant-history__value"><CurrencyDisplay amount={contract.monthlyRent} /></span>
                </div>
                {contract.deductions !== undefined && (
                  <div className="tenant-history__row">
                    <span className="tenant-history__label">퇴거 차감액 (수리비 등)</span>
                    <span className="tenant-history__value tabular-nums" style={{ color: 'var(--color-danger)' }}>
                      - {Number(contract.deductions).toLocaleString()}원
                    </span>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

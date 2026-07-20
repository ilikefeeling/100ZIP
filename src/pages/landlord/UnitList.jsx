import { useNavigate, useParams } from 'react-router-dom';
import usePropertyStore from '../../stores/propertyStore';
import TopBar from '../../components/TopBar';
import Card from '../../components/Card';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';
import './UnitList.css';

/**
 * LL-002a 호실 목록
 * 건물 상단 요약 + 호실 카드 그리드(2열)
 * 미입력 슬롯은 "정보 입력하기" 흐린 카드
 */
export default function UnitList() {
  const navigate = useNavigate();
  const { buildingId } = useParams();
  const building = usePropertyStore((s) => s.getBuilding(buildingId));

  if (!building) {
    return (
      <div className="page">
        <TopBar title="호실 목록" />
        <div className="page-content" style={{ textAlign: 'center', paddingTop: '20vh' }}>
          <p>건물을 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  const units = building.units || [];
  const totalSlots = building.totalUnitCount || 0;
  const emptySlots = Math.max(0, totalSlots - units.length);
  const vacantCount = units.filter((u) => u.status === '공실').length;
  const rentedCount = units.filter((u) => u.status === '임대중' && u.contract?.status !== '대기').length;
  const pendingCount = units.filter((u) => u.contract?.status === '대기').length;

  return (
    <div className="page">
      <TopBar title="호실 목록" />
      <div className="page-content unit-list">
        {/* 건물 요약 */}
        <div className="unit-list__summary">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h2 className="unit-list__address">{building.address}</h2>
            <button 
              onClick={() => navigate(`/landlord/buildings/${buildingId}/settings`)} 
              style={{
                background: 'var(--color-primary-100)',
                border: '1px solid var(--color-primary-600)',
                borderRadius: '16px',
                fontSize: '16px',
                fontWeight: 'bold',
                color: 'var(--color-primary-900)',
                padding: '6px 16px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                boxShadow: '0 2px 6px rgba(30,58,95,0.15)'
              }}
            >
              건물 상세
            </button>
          </div>
          <div className="unit-list__stats">
            {rentedCount > 0 && <StatusBadge status="success" label={`임대중 ${rentedCount}`} />}
            {pendingCount > 0 && <StatusBadge status="warning" label={`승인대기 ${pendingCount}`} />}
            {vacantCount > 0 && <StatusBadge status="danger" label={`공실 ${vacantCount}`} />}
            <span className="unit-list__total">{building.buildingType} · 총 {totalSlots}호실</span>
          </div>
        </div>

        {/* 호실 그리드 */}
        <div className="unit-list__grid">
          {units.map((unit) => (
            <Card
              key={unit.id}
              clickable
              onClick={() => navigate(`/landlord/buildings/${buildingId}/units/${unit.id}`)}
            >
              <div className="unit-list__card">
                <span className="unit-list__card-number">{unit.unitNumber}</span>
                <StatusBadge
                  status={unit.contract?.status === '대기' ? 'warning' : unit.status === '임대중' ? 'success' : 'danger'}
                  label={unit.contract?.status === '대기' ? '승인대기' : unit.status}
                />
                <span className="unit-list__card-area">{unit.exclusiveArea}㎡</span>
                <div style={{ marginTop: '8px', font: 'var(--font-heading-2)', color: 'var(--color-primary-600)' }}>
                  {unit.status === '공실' ? '계약 등록하기 →' : '상세 보기 →'}
                </div>
              </div>
            </Card>
          ))}
          {/* 미입력 빈 슬롯 */}
          {Array.from({ length: emptySlots }, (_, i) => (
            <Card
              key={`empty-${i}`}
              sunken
              clickable
              onClick={() => navigate(`/landlord/buildings/${buildingId}/units/new`)}
            >
              <div className="unit-list__card unit-list__card--empty">
                <span className="unit-list__card-plus">+</span>
                <span className="unit-list__card-hint">정보 입력하기</span>
              </div>
            </Card>
          ))}
        </div>

        {/* 하단 네비게이션 영역 */}
        <div style={{ marginTop: '32px', paddingBottom: '32px' }}>
          <Button variant="secondary" onClick={() => navigate('/landlord')}>
            전체 건물 목록으로
          </Button>
        </div>
      </div>
    </div>
  );
}

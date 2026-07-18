import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import usePropertyStore from '../../stores/propertyStore';
import TopBar from '../../components/TopBar';
import BottomTabBar from '../../components/BottomTabBar';
import Card from '../../components/Card';
import StatusBadge from '../../components/StatusBadge';
import CurrencyDisplay from '../../components/CurrencyDisplay';
import './RentList.css';

/**
 * LL-005 납부 관리
 * 이달의 수납 현황 (완료/미납/예정) + 전체 호실 납부 리스트
 */
export default function RentList() {
  const navigate = useNavigate();
  const buildings = usePropertyStore((s) => s.buildings);
  const [filter, setFilter] = useState('all'); // all, unpaid, paid

  // 모든 임대중인 호실의 계약 데이터 추출 (Mock 납부 상태 포함)
  const allContracts = buildings.flatMap((b) =>
    (b.units || [])
      .filter((u) => u.status === '임대중' && u.contract)
      .map((u) => ({
        buildingId: b.id,
        buildingName: b.address,
        unitId: u.id,
        unitNumber: u.unitNumber,
        ...u.contract,
        // Mock 데이터: 실제론 rentRecords 배열 등에서 판단
        paymentStatus: Math.random() > 0.5 ? '납부완료' : (Math.random() > 0.5 ? '미납' : '확인대기'),
      }))
  );

  const stats = {
    total: allContracts.length,
    paid: allContracts.filter(c => c.paymentStatus === '납부완료').length,
    unpaid: allContracts.filter(c => c.paymentStatus === '미납').length,
    waiting: allContracts.filter(c => c.paymentStatus === '확인대기').length,
  };

  const filteredContracts = allContracts.filter((c) => {
    if (filter === 'unpaid') return c.paymentStatus === '미납';
    if (filter === 'paid') return c.paymentStatus === '납부완료';
    return true;
  });

  return (
    <div className="page">
      <TopBar title="납부 관리" showBack={false} />
      
      <div className="page-content rent-list">
        {/* 요약 대시보드 */}
        <div className="rent-list__dashboard">
          <h2 className="rent-list__month">이번 달 수납 현황</h2>
          <div className="rent-list__stats-grid">
            <div className="rent-list__stat-box" onClick={() => setFilter('all')}>
              <span className="rent-list__stat-label">전체</span>
              <span className="rent-list__stat-value">{stats.total}건</span>
            </div>
            <div className="rent-list__stat-box rent-list__stat-box--warning" onClick={() => setFilter('unpaid')}>
              <span className="rent-list__stat-label">미납</span>
              <span className="rent-list__stat-value">{stats.unpaid}건</span>
            </div>
            <div className="rent-list__stat-box rent-list__stat-box--success" onClick={() => setFilter('paid')}>
              <span className="rent-list__stat-label">완료</span>
              <span className="rent-list__stat-value">{stats.paid}건</span>
            </div>
          </div>
        </div>

        {/* 필터 탭 */}
        <div className="rent-list__tabs">
          <button
            className={`rent-list__tab ${filter === 'all' ? 'rent-list__tab--active' : ''}`}
            onClick={() => setFilter('all')}
          >
            전체
          </button>
          <button
            className={`rent-list__tab ${filter === 'unpaid' ? 'rent-list__tab--active' : ''}`}
            onClick={() => setFilter('unpaid')}
          >
            미납/대기
          </button>
          <button
            className={`rent-list__tab ${filter === 'paid' ? 'rent-list__tab--active' : ''}`}
            onClick={() => setFilter('paid')}
          >
            납부완료
          </button>
        </div>

        {/* 리스트 */}
        <div className="rent-list__items">
          {filteredContracts.length === 0 ? (
            <div className="rent-list__empty">해당하는 내역이 없습니다.</div>
          ) : (
            filteredContracts.map((c) => (
              <Card
                key={c.id}
                clickable
                onClick={() => navigate(`/landlord/buildings/${c.buildingId}/units/${c.unitId}/rent`)}
              >
                <div className="rent-list__card">
                  <div className="rent-list__card-header">
                    <span className="rent-list__card-title">
                      {c.buildingName} {c.unitNumber}
                    </span>
                    <StatusBadge
                      status={
                        c.paymentStatus === '납부완료' ? 'success' :
                        c.paymentStatus === '미납' ? 'warning' : 'neutral'
                      }
                      label={c.paymentStatus}
                    />
                  </div>
                  <div className="rent-list__card-body">
                    <div className="rent-list__card-row">
                      <span className="rent-list__card-label">임차인</span>
                      <span className="rent-list__card-value">{c.tenantName}</span>
                    </div>
                    <div className="rent-list__card-row">
                      <span className="rent-list__card-label">임대료</span>
                      <span className="rent-list__card-value tabular-nums"><CurrencyDisplay amount={c.monthlyRent} /></span>
                    </div>
                    <div className="rent-list__card-row">
                      <span className="rent-list__card-label">관리비</span>
                      <span className="rent-list__card-value tabular-nums">{c.maintenanceFee > 0 ? <CurrencyDisplay amount={c.maintenanceFee} /> : '-'}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      <BottomTabBar role="landlord" />
    </div>
  );
}

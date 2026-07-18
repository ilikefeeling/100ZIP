import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import usePropertyStore from '../../stores/propertyStore';
import TopBar from '../../components/TopBar';
import Card from '../../components/Card';
import Button from '../../components/Button';
import './BrokerShareView.css';

export default function BrokerShareView() {
  const { buildingId } = useParams();
  const getBuildingForGuest = usePropertyStore((s) => s.getBuildingForGuest);

  const [loading, setLoading] = useState(true);
  const [building, setBuilding] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const bData = await getBuildingForGuest(buildingId);
        if (!bData) throw new Error('건물 정보를 찾을 수 없습니다.');
        setBuilding(bData);
      } catch (err) {
        console.error(err);
        setError(err.message || '데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [buildingId, getBuildingForGuest]);

  if (loading) {
    return (
      <div className="page">
        <TopBar title="건물 정보" showBack={false} />
        <div className="page-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <p>건물 정보를 불러오는 중입니다...</p>
        </div>
      </div>
    );
  }

  if (error || !building) {
    return (
      <div className="page">
        <TopBar title="건물 정보 오류" showBack={false} />
        <div className="page-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '16px' }}>
          <p style={{ color: 'var(--color-danger-500)' }}>{error || '건물 정보를 찾을 수 없습니다.'}</p>
        </div>
      </div>
    );
  }

  // 공실 목록 필터링
  const vacantUnits = (building.units || []).filter(u => u.status === '공실');

  // 임대인 연락처 (건물 등록 시 저장된 정보가 없으므로 우선은 건물 데이터의 gasContactPhone, electricContactPhone 등을 통해 간접 유추하거나 없으면 알림창만)
  // 실제로는 user doc을 가져와야 하지만, 비회원 접근이라 firestore rules상 불가능함.
  // 따라서 건물 데이터에 landlordPhone 필드가 있다고 가정하고 표시 (등록 시점에 저장하도록 별도 조치 필요)
  const landlordPhone = building.landlordPhone || '';

  const handleCallLandlord = () => {
    if (landlordPhone) {
      window.location.href = `tel:${landlordPhone}`;
    } else {
      alert('임대인 연락처가 등록되지 않았습니다.');
    }
  };

  return (
    <div className="page broker-share-view">
      <TopBar title="방 내놓기 (중개사용)" showBack={false} />
      
      <div className="page-content">
        {/* 건물 기본 정보 */}
        <div className="broker-share__header">
          <h1 className="broker-share__title">{building.address}</h1>
          <p className="broker-share__subtitle">{building.buildingType || '건물'}</p>
        </div>

        {/* 공실 목록 */}
        <section className="broker-share__section">
          <h2 className="broker-share__section-title">현재 공실 목록 ({vacantUnits.length}개)</h2>
          {vacantUnits.length === 0 ? (
            <Card>
              <p className="broker-share__empty-text">현재 공실이 없습니다.</p>
            </Card>
          ) : (
            <div className="broker-share__unit-list">
              {vacantUnits.map((unit) => (
                <Card key={unit.id} className="broker-share__unit-card">
                  <div className="unit-card__header">
                    <h3>{unit.name}호</h3>
                    <span className="badge vacant">공실</span>
                  </div>
                  <div className="unit-card__body">
                    <div className="info-row">
                      <span className="label">보증금/월세</span>
                      <span className="value highlight">
                        {unit.deposit?.toLocaleString() || 0} / {unit.rent?.toLocaleString() || 0}만 원
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="label">관리비</span>
                      <span className="value">{unit.maintenanceFee?.toLocaleString() || 0}만 원</span>
                    </div>
                    {/* 방 비번 노출 (대표님 승인 사항) */}
                    <div className="info-row">
                      <span className="label">호실 비번</span>
                      <span className="value password">{unit.doorCode || '미등록'}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* 건물 편의 정보 (공동현관 비번 등) */}
        <section className="broker-share__section">
          <h2 className="broker-share__section-title">건물 정보</h2>
          <Card>
            <ul className="broker-share__info-list">
              {building.commonDoorCode && (
                <li>
                  <span className="label">공동현관 비번</span>
                  <span className="value password">{building.commonDoorCode}</span>
                </li>
              )}
              {building.commonWifiCode && (
                <li>
                  <span className="label">공용 와이파이</span>
                  <span className="value">{building.commonWifiCode}</span>
                </li>
              )}
              {building.parkingInfo && (
                <li>
                  <span className="label">주차 공간</span>
                  <span className="value">{building.parkingInfo}</span>
                </li>
              )}
              {building.trashInfo && (
                <li>
                  <span className="label">분리수거</span>
                  <span className="value">{building.trashInfo}</span>
                </li>
              )}
            </ul>
          </Card>
        </section>

      </div>

      <div className="broker-share__footer">
        <Button variant="primary" onClick={handleCallLandlord} fullWidth>
          임대인에게 전화걸기
        </Button>
      </div>
    </div>
  );
}

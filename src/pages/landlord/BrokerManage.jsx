import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import usePropertyStore from '../../stores/propertyStore';
import TopBar from '../../components/TopBar';
import Card from '../../components/Card';
import Button from '../../components/Button';
import './BrokerManage.css';

export default function BrokerManage() {
  const navigate = useNavigate();
  const { buildingId } = useParams();
  const building = usePropertyStore(s => s.getBuilding(buildingId));
  const addBroker = usePropertyStore(s => s.addBroker);
  const removeBroker = usePropertyStore(s => s.removeBroker);
  const getAllBrokerOffices = usePropertyStore(s => s.getAllBrokerOffices);

  const [isAdding, setIsAdding] = useState(false);
  const [officeName, setOfficeName] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  
  const [existingOffices, setExistingOffices] = useState([]);

  useEffect(() => {
    // 임대인이 등록한 모든 사무소명 가져오기 (초기 로드 시)
    const offices = getAllBrokerOffices();
    // '임대인 직거래' 옵션이 없으면 추가
    if (!offices.includes('임대인 직거래')) {
      offices.unshift('임대인 직거래');
    }
    setExistingOffices(offices);
  }, [getAllBrokerOffices]);

  if (!building) return null;

  const brokers = building.brokers || [];

  const handleAdd = async () => {
    if (!officeName || !phone) {
      alert('사무소명(또는 직거래)과 연락처를 입력해주세요.');
      return;
    }
    await addBroker(buildingId, { officeName, name, phone });
    
    // 로컬 상태 업데이트
    if (!existingOffices.includes(officeName)) {
      setExistingOffices([...existingOffices, officeName]);
    }
    
    setOfficeName('');
    setName('');
    setPhone('');
    setIsAdding(false);
  };

  const handleRemove = async (brokerId) => {
    if (window.confirm('이 주거래 중개사를 삭제하시겠습니까?')) {
      await removeBroker(buildingId, brokerId);
    }
  };

  return (
    <div className="page broker-manage">
      <TopBar title="주거래 중개사사무소 관리" onBack={() => navigate(-1)} />
      
      <div className="page-content">
        <div className="broker-manage__header">
          <h2 className="broker-manage__title">내 주거래 중개사사무소</h2>
          <p className="broker-manage__desc">
            공실이 발생했을 때 한 번에 방을 내놓을 수 있습니다.
          </p>
        </div>

        <Card className="broker-manage__share-card">
          <div className="share-card__content">
            <p>중개사에게 공실 및 건물 정보(비번 포함)를 공유하여 쉽게 영업하도록 도와주세요.</p>
            <Button 
              variant="primary" 
              onClick={() => {
                const url = `${window.location.origin}/share/broker/${buildingId}`;
                navigator.clipboard.writeText(url);
                alert('중개사 공유용 링크가 복사되었습니다.\n카카오톡 등에 붙여넣기 하세요.');
              }}
              fullWidth
              style={{ marginTop: '12px' }}
            >
              공실/비번 정보 중개사 공유하기
            </Button>
          </div>
        </Card>

        <div className="broker-manage__list">
          {brokers.length === 0 ? (
            <Card>
              <div className="broker-manage__empty">
                아직 등록된 주거래 중개사사무소가 없습니다.<br/>
                + 버튼을 눌러 추가해보세요.
              </div>
            </Card>
          ) : (
            brokers.map(broker => (
              <Card key={broker.id}>
                <div className="broker-item">
                  <div className="broker-item__info">
                    <span className="broker-item__office">{broker.officeName}</span>
                    {broker.name && <span className="broker-item__name">{broker.name}</span>}
                    <span className="broker-item__phone">{broker.phone}</span>
                  </div>
                  <button 
                    className="broker-item__delete"
                    onClick={() => handleRemove(broker.id)}
                  >
                    삭제
                  </button>
                </div>
              </Card>
            ))
          )}
        </div>

        {!isAdding ? (
          <button className="broker-manage__add-btn" onClick={() => setIsAdding(true)}>
            + 주거래 중개사사무소 추가
          </button>
        ) : (
          <Card>
            <div className="broker-manage__add-form">
              <h3 className="broker-manage__add-title">새 주거래처 등록</h3>
              
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <select 
                  className="broker-manage__input"
                  style={{ flex: 1 }}
                  value={existingOffices.includes(officeName) ? officeName : '직접 입력'}
                  onChange={(e) => {
                    if (e.target.value !== '직접 입력') {
                      setOfficeName(e.target.value);
                    } else {
                      setOfficeName('');
                    }
                  }}
                >
                  <option value="" disabled>사무소 선택</option>
                  {existingOffices.map((office, idx) => (
                    <option key={idx} value={office}>{office}</option>
                  ))}
                  <option value="직접 입력">직접 입력...</option>
                </select>
                
                {/* 직접 입력 시에만 텍스트 인풋 표시 */}
                {(!existingOffices.includes(officeName) || officeName === '') && (
                  <input 
                    className="broker-manage__input"
                    style={{ flex: 1 }}
                    placeholder="사무소명 직접 입력"
                    value={officeName}
                    onChange={(e) => setOfficeName(e.target.value)}
                  />
                )}
              </div>

              <input 
                className="broker-manage__input"
                placeholder="담당자 이름 (선택)"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input 
                className="broker-manage__input"
                placeholder="연락처 (필수, 예: 010-1234-5678)"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <div className="broker-manage__add-actions">
                <Button variant="secondary" onClick={() => setIsAdding(false)}>취소</Button>
                <Button variant="primary" onClick={handleAdd}>등록 완료</Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

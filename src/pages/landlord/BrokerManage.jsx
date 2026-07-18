import { useState } from 'react';
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

  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  if (!building) return null;

  const brokers = building.brokers || [];

  const handleAdd = async () => {
    if (!name || !phone) {
      alert('이름과 연락처를 입력해주세요.');
      return;
    }
    await addBroker(buildingId, { name, phone });
    setName('');
    setPhone('');
    setIsAdding(false);
  };

  const handleRemove = async (brokerId) => {
    if (window.confirm('이 단골 중개사를 삭제하시겠습니까?')) {
      await removeBroker(buildingId, brokerId);
    }
  };

  return (
    <div className="page broker-manage">
      <TopBar title="단골 중개사 관리" onBack={() => navigate(-1)} />
      
      <div className="page-content">
        <div className="broker-manage__header">
          <h2 className="broker-manage__title">내 단골 중개사 목록</h2>
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
                아직 등록된 단골 중개사가 없습니다.<br/>
                + 버튼을 눌러 중개사를 추가해보세요.
              </div>
            </Card>
          ) : (
            brokers.map(broker => (
              <Card key={broker.id}>
                <div className="broker-item">
                  <div className="broker-item__info">
                    <span className="broker-item__name">{broker.name}</span>
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
            + 단골 중개사 추가하기
          </button>
        ) : (
          <Card>
            <div className="broker-manage__add-form">
              <h3 className="broker-manage__add-title">새 중개사 등록</h3>
              <input 
                className="broker-manage__input"
                placeholder="중개사(부동산) 이름"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input 
                className="broker-manage__input"
                placeholder="연락처 (예: 010-1234-5678)"
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

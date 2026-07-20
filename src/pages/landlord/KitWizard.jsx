import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import usePropertyStore from '../../stores/propertyStore';
import TopBar from '../../components/TopBar';
import Button from '../../components/Button';
import ProgressBar from '../../components/ProgressBar';
import Card from '../../components/Card';
import NotificationModal from '../../components/NotificationModal';
import { formatPhoneNumber } from '../../utils/formatters';
import './KitWizard.css';

/**
 * LL-004 입주키트 생성 위자드
 * 순차 카드: 공동현관/호실 비밀번호 → 시설물 안내 → 쓰레기 배출 등 특약 → 연락망
 */
export default function KitWizard() {
  const navigate = useNavigate();
  const { buildingId, unitId } = useParams();
  const updateKit = usePropertyStore((s) => s.updateKit);
  const building = usePropertyStore((s) => s.getBuilding(buildingId));
  const unit = usePropertyStore((s) => s.getUnit(buildingId, unitId));

  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const [commonDoorCode, setCommonDoorCode] = useState(building?.commonDoorCode || '');
  const [unitDoorCode, setUnitDoorCode] = useState('');
  const [wifiCode, setWifiCode] = useState(building?.commonWifiCode || '');
  
  const [otherCommonCode, setOtherCommonCode] = useState(building?.otherCommonCode || '');
  
  const [trashInfo, setTrashInfo] = useState(building?.trashInfo || '');
  const [parkingInfo, setParkingInfo] = useState(building?.parkingInfo || '');
  
  const [commonNotice, setCommonNotice] = useState(building?.commonNotice || '');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inviteLink, setInviteLink] = useState('');

  useEffect(() => {
    if (building) {
      if (!commonDoorCode && building.commonDoorCode) setCommonDoorCode(building.commonDoorCode);
      if (!wifiCode && building.commonWifiCode) setWifiCode(building.commonWifiCode);
      if (!otherCommonCode && building.otherCommonCode) setOtherCommonCode(building.otherCommonCode);
      if (!trashInfo && building.trashInfo) setTrashInfo(building.trashInfo);
      if (!parkingInfo && building.parkingInfo) setParkingInfo(building.parkingInfo);
      if (!commonNotice && building.commonNotice) setCommonNotice(building.commonNotice);
    }
  }, [building]);
  const [additionalContacts, setAdditionalContacts] = useState([]);

  const handleAddContact = () => {
    setAdditionalContacts([...additionalContacts, { name: '', phone: '' }]);
  };

  const handleContactChange = (index, field, value) => {
    const newContacts = [...additionalContacts];
    newContacts[index][field] = value;
    setAdditionalContacts(newContacts);
  };

  const handleRemoveContact = (index) => {
    const newContacts = [...additionalContacts];
    newContacts.splice(index, 1);
    setAdditionalContacts(newContacts);
  };

  const handleComplete = async () => {
    // 1. 상태 업데이트
    const doorCode = `공동현관: ${commonDoorCode || '없음'}, 호실: ${unitDoorCode || '없음'}`;
    await Promise.all([
      updateKit(buildingId, unitId, 'access', { commonDoorCode, unitDoorCode, doorCode, wifiCode, otherCommonCode }),
      updateKit(buildingId, unitId, 'specialTerms', { trashInfo, parkingInfo, commonNotice, additionalContacts })
    ]);
    
    // 2. 모의 공유 링크 생성
    const link = `${window.location.origin}/invite/${buildingId}/${unitId}`;
    setInviteLink(link);
    setIsModalOpen(true);
  };

  const onConfirmSend = () => {
    setIsModalOpen(false);
    navigate(`/landlord/buildings/${buildingId}/units/${unitId}`, { replace: true });
  };

  return (
    <div className="page">
      <TopBar title="입주키트 작성" />
      <ProgressBar current={step} total={totalSteps} />

      <div className="page-content kit-wiz">
        <div style={{ backgroundColor: 'var(--color-surface-sunken)', padding: '16px', borderRadius: '8px', marginBottom: '24px', fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
          💡 <strong>안심하세요!</strong><br />
          여기서 작성하는 공동현관 비밀번호 등의 입주키트 정보는 세입자가 <strong>전자서명을 완료하고, 보증금 입금이 확인되기 전까지는 자물쇠로 잠겨서 보이지 않습니다.</strong> 지금은 전자서명 요청을 보내기 위해 미리 작성해 두는 단계입니다.
        </div>

        {step === 1 && (
          <div className="kit-wiz__step">
            <h2 className="kit-wiz__question">비밀번호를 알려주세요</h2>
            <div className="kit-wiz__inputs">
              <div className="kit-wiz__label-input">
                <label>공동현관 비밀번호 (건물 공용)</label>
                <input
                  className="kit-wiz__input"
                  placeholder="예: 1234*"
                  value={commonDoorCode}
                  onChange={(e) => setCommonDoorCode(e.target.value)}
                />
              </div>
              <div className="kit-wiz__label-input">
                <label>호실 비밀번호 (선택)</label>
                <input
                  className="kit-wiz__input"
                  placeholder="예: 1234*"
                  value={unitDoorCode}
                  onChange={(e) => setUnitDoorCode(e.target.value)}
                />
              </div>
            </div>
            <p className="kit-wiz__hint">세입자가 언제든 앱에서 확인할 수 있습니다.</p>
          </div>
        )}

        {step === 2 && (
          <div className="kit-wiz__step">
            <h2 className="kit-wiz__question">도어락 마스터 비밀번호가 있나요?</h2>
            <div className="kit-wiz__inputs">
              <div className="kit-wiz__label-input">
                <label>마스터 비밀번호 (선택)</label>
                <input
                  className="kit-wiz__input"
                  placeholder="임대인 전용 (세입자에게는 보이지 않습니다)"
                  value={doorCode}
                  onChange={(e) => setDoorCode(e.target.value)}
                />
              </div>
            </div>
            <p className="kit-wiz__hint">퇴거 시 비밀번호 초기화를 위해 임대인님만 볼 수 있게 저장됩니다.</p>
          </div>
        )}

        {step === 3 && (
          <div className="kit-wiz__step">
            <h2 className="kit-wiz__question">공용 와이파이가 있나요?</h2>
            <div className="kit-wiz__inputs">
              <div className="kit-wiz__label-input">
                <label>와이파이 비밀번호 (선택)</label>
                <input
                  className="kit-wiz__input"
                  placeholder="예: U+NetXXXX / 1234567890"
                  value={wifiCode}
                  onChange={(e) => setWifiCode(e.target.value)}
                />
              </div>
            </div>
            <p className="kit-wiz__hint">건물에 공용 와이파이가 있다면 입력해주세요.</p>
          </div>
        )}

        {step === 4 && (
          <div className="kit-wiz__step">
            <h2 className="kit-wiz__question">건물 이용 규칙을 알려주세요</h2>
            <div className="kit-wiz__inputs">
              <div className="kit-wiz__label-input">
                <label>쓰레기 분리수거장 위치</label>
                <input
                  className="kit-wiz__input"
                  placeholder="예: 1층 주차장 안쪽 펜스"
                  value={trashInfo}
                  onChange={(e) => setTrashInfo(e.target.value)}
                />
              </div>
              <div className="kit-wiz__label-input">
                <label>주차 규정 (선택)</label>
                <input
                  className="kit-wiz__input"
                  placeholder="예: 호실당 1대 무료, 이중주차 시 연락처 필수"
                  value={parkingInfo}
                  onChange={(e) => setParkingInfo(e.target.value)}
                />
              </div>
              <div className="kit-wiz__label-input">
                <label>기타 공지사항 (선택)</label>
                <textarea
                  className="kit-wiz__input kit-wiz__textarea"
                  placeholder="예: 옥상 흡연 절대 금지, 밤 10시 이후 세탁기 사용 자제"
                  value={commonNotice}
                  onChange={(e) => setCommonNotice(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="kit-wiz__step">
            <h2 className="kit-wiz__question">비상 연락망</h2>
            <div className="kit-wiz__contact-list">
              <Card>
                <div style={{ padding: '8px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 600 }}>건물 관리인 (본인)</div>
                  <div style={{ color: 'var(--color-success-600)', fontSize: '18px', fontWeight: 'bold' }}>
                    ✓ 자동 등록됨
                  </div>
                </div>
              </Card>
              {(building?.gasContactName || building?.gasContactPhone || building?.gasContact) && (
                <Card>
                  <div style={{ padding: '8px 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontWeight: 600 }}>도시가스 고객센터</div>
                      <div style={{ color: 'var(--color-success-600)', fontSize: '18px', fontWeight: 'bold' }}>
                        ✓ 자동 등록됨
                      </div>
                    </div>
                    <div style={{ color: 'var(--color-text-secondary)', fontSize: '20px', marginTop: '4px' }}>
                      {building.gasContactName} {building.gasContactPhone}
                      {(!building.gasContactName && !building.gasContactPhone) ? building.gasContact : ''}
                    </div>
                  </div>
                </Card>
              )}
              {(building?.electricContactName || building?.electricContactPhone || building?.electricContact) && (
                <Card>
                  <div style={{ padding: '8px 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontWeight: 600 }}>한국전력 고객센터</div>
                      <div style={{ color: 'var(--color-success-600)', fontSize: '18px', fontWeight: 'bold' }}>
                        ✓ 자동 등록됨
                      </div>
                    </div>
                    <div style={{ color: 'var(--color-text-secondary)', fontSize: '20px', marginTop: '4px' }}>
                      {building.electricContactName} {building.electricContactPhone}
                      {(!building.electricContactName && !building.electricContactPhone) ? building.electricContact : ''}
                    </div>
                  </div>
                </Card>
              )}
              {(building?.otherContactName || building?.otherContactPhone || building?.otherContact) && (
                <Card>
                  <div style={{ padding: '8px 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontWeight: 600 }}>기타 연락처 (관리인 등)</div>
                      <div style={{ color: 'var(--color-success-600)', fontSize: '18px', fontWeight: 'bold' }}>
                        ✓ 자동 등록됨
                      </div>
                    </div>
                    <div style={{ color: 'var(--color-text-secondary)', fontSize: '20px', marginTop: '4px' }}>
                      {building.otherContactName} {building.otherContactPhone}
                      {(!building.otherContactName && !building.otherContactPhone) ? building.otherContact : ''}
                    </div>
                  </div>
                </Card>
              )}
              {additionalContacts.map((contact, index) => (
                <Card key={index}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '8px 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontWeight: 600 }}>추가 연락처 {index + 1}</div>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveContact(index)}
                        style={{ background: 'none', border: 'none', color: 'var(--color-danger-600)', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}
                      >
                        삭제
                      </button>
                    </div>
                    <input
                      className="kit-wiz__input"
                      placeholder="명칭 (예: 엘리베이터 수리)"
                      value={contact.name}
                      onChange={(e) => handleContactChange(index, 'name', e.target.value)}
                    />
                    <input
                      className="kit-wiz__input"
                      type="tel"
                      placeholder="전화번호 (예: 010-1234-5678)"
                      value={contact.phone}
                      onChange={(e) => handleContactChange(index, 'phone', formatPhoneNumber(e.target.value))}
                      maxLength={13}
                    />
                  </div>
                </Card>
              ))}
              <button className="kit-wiz__add-btn" type="button" onClick={handleAddContact}>+ 관리사무소 / 수리기사 추가</button>
            </div>
          </div>
        )}

        <div className="kit-wiz__footer">
          {step < totalSteps ? (
            <Button variant="primary" onClick={() => setStep(step + 1)}>
              다음
            </Button>
          ) : (
            <Button variant="accent" onClick={handleComplete}>
              전자서명 요청 링크 생성하기
            </Button>
          )}
          {step < totalSteps && (
            <button className="kit-wiz__skip" onClick={() => setStep(step + 1)}>
              이 항목 건너뛰기
            </button>
          )}
        </div>
      </div>

      <NotificationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={onConfirmSend}
        title="전자서명 요청 및 입주키트 발송"
        tenantName={unit?.contract?.tenantName || '임차인'}
        message={`[100집 전자서명 요청]\n\n${building?.name || ''} ${unit?.unitNumber || ''} 입주를 환영합니다!\n\n전자서명을 완료하시면 계약이 성립되며, 보증금 입금이 확인되면 공동현관 비밀번호 등 입주키트가 자동으로 공개됩니다.\n\n아래 링크를 눌러 계약 정보를 확인하고 서명을 진행해 주세요.\n${inviteLink}`}
      />
    </div>
  );
}

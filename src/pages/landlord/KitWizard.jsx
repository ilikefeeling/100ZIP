import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import usePropertyStore from '../../stores/propertyStore';
import TopBar from '../../components/TopBar';
import Button from '../../components/Button';
import ProgressBar from '../../components/ProgressBar';
import Card from '../../components/Card';
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
    const inviteLink = `${window.location.origin}/invite/${buildingId}/${unitId}`;
    
    // 3. 네이티브 공유 또는 SMS 전송 유도
    const tenantPhone = unit?.contract?.tenantPhone;
    const message = `[건물주] ${building?.name || ''} ${unit?.unitNumber || ''} 입주키트(비밀번호, 이용안내)가 도착했습니다.\n링크를 눌러 확인해 주세요.\n${inviteLink}`;

    try {
      await navigator.clipboard.writeText(message);
    } catch (err) {}

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
      if (navigator.share) {
        try {
          await navigator.share({
            title: '입주키트 안내',
            text: message
          });
        } catch (error) {
          if (error.name !== 'AbortError') {
            window.location.href = `sms:${tenantPhone ? tenantPhone.replace(/-/g, '') : ''}?body=${encodeURIComponent(message)}`;
          }
        }
      } else {
        window.location.href = `sms:${tenantPhone ? tenantPhone.replace(/-/g, '') : ''}?body=${encodeURIComponent(message)}`;
      }
    } else {
      alert("초대 메시지가 복사되었습니다!\n\nPC를 사용 중이시네요. PC 카카오톡이나 메시지 앱 대화창에 '붙여넣기(Ctrl+V)' 해서 보내주시면 됩니다.");
    }
    
    navigate(`/landlord/buildings/${buildingId}/units/${unitId}`, { replace: true });
  };

  return (
    <div className="page">
      <TopBar title="입주키트 작성" />
      <ProgressBar current={step} total={totalSteps} />

      <div className="page-content kit-wiz">
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
                <label>호실 비밀번호</label>
                <input
                  className="kit-wiz__input"
                  placeholder="예: 5678*"
                  value={unitDoorCode}
                  onChange={(e) => setUnitDoorCode(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="kit-wiz__label-input">
                <label>와이파이 비밀번호 (선택)</label>
                <input
                  className="kit-wiz__input"
                  placeholder="예: 12345678"
                  value={wifiCode}
                  onChange={(e) => setWifiCode(e.target.value)}
                />
              </div>
              <div className="kit-wiz__label-input">
                <label>기타 공용 비밀번호 (분리수거장 등)</label>
                <input
                  className="kit-wiz__input"
                  placeholder="예: 분리수거장 1111*"
                  value={otherCommonCode}
                  onChange={(e) => setOtherCommonCode(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="kit-wiz__step">
            <h2 className="kit-wiz__question">기본 시설물 사용법</h2>
            <p className="kit-wiz__desc">보일러, 에어컨 등 작동법을 적어주시면 세입자 문의가 줄어듭니다.</p>
            <div className="kit-wiz__inputs">
              <textarea
                className="kit-wiz__textarea"
                rows={4}
                placeholder="예: 보일러는 외출 모드로 유지해주세요."
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="kit-wiz__step">
            <h2 className="kit-wiz__question">건물 규정 및 공지</h2>
            <div className="kit-wiz__inputs">
              <div className="kit-wiz__label-input">
                <label>쓰레기 / 재활용 배출 안내</label>
                <input
                  className="kit-wiz__input"
                  placeholder="예: 화/목 저녁 8시, 전봇대 앞"
                  value={trashInfo}
                  onChange={(e) => setTrashInfo(e.target.value)}
                />
              </div>
              <div className="kit-wiz__label-input">
                <label>주차 규정</label>
                <input
                  className="kit-wiz__input"
                  placeholder="예: 지정 주차구역 3번 사용"
                  value={parkingInfo}
                  onChange={(e) => setParkingInfo(e.target.value)}
                />
              </div>
              <div className="kit-wiz__label-input">
                <label>공통 고지 사항</label>
                <textarea
                  className="kit-wiz__textarea"
                  rows={2}
                  placeholder="예: 옥상 사용 불가, 밤 10시 이후 세탁 자제"
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
              초대 링크 생성하기
            </Button>
          )}
          {step < totalSteps && (
            <button className="kit-wiz__skip" onClick={() => setStep(step + 1)}>
              이 항목 건너뛰기
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

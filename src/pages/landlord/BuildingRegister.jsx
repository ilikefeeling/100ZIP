import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import usePropertyStore from '../../stores/propertyStore';
import useAuthStore from '../../stores/authStore';
import TopBar from '../../components/TopBar';
import Card from '../../components/Card';
import NumPad from '../../components/NumPad';
import Button from '../../components/Button';
import ProgressBar from '../../components/ProgressBar';
import { formatPhoneNumber } from '../../utils/formatters';
import './BuildingRegister.css';

/**
 * LL-002 건물 등록
 * 순차 카드: 주소 → 건물유형 → 총 호실수 → 사진
 */

import { uploadCompressedImage } from '../../utils/imageUpload';

const BUILDING_TYPES = ['원룸', '다가구', '오피스텔', '상가주택'];

const GAS_COMPANIES = [
  '코원에너지서비스', '예스코', '서울도시가스', '귀뚜라미에너지', 
  '삼천리', '대륜E&S', '인천도시가스', 'CNCITY에너지', 
  '충청에너지서비스', '참빛충북도시가스', '미래엔서해에너지', 'JB(주)',
  '대성에너지', '해양에너지', '부산도시가스', '경동도시가스', '직접 입력'
];

export default function BuildingRegister() {
  const navigate = useNavigate();
  const addBuilding = usePropertyStore((s) => s.addBuilding);
  const updateBuilding = usePropertyStore((s) => s.updateBuilding);
  const user = useAuthStore((s) => s.user);

  const [step, setStep] = useState(1);
  const [address, setAddress] = useState('');
  const [buildingType, setBuildingType] = useState('');
  const [totalUnits, setTotalUnits] = useState('');
  
  // 공용 시설 및 보안
  const [commonDoorCode, setCommonDoorCode] = useState('');
  const [commonWifiCode, setCommonWifiCode] = useState('');
  const [otherCommonCode, setOtherCommonCode] = useState('');
  const [trashInfo, setTrashInfo] = useState('');
  const [parkingInfo, setParkingInfo] = useState('');

  // 연락처 및 고지사항
  const [gasContactName, setGasContactName] = useState('');
  const [gasContactPhone, setGasContactPhone] = useState('');
  const [electricContactName, setElectricContactName] = useState('한국전력공사');
  const [electricContactPhone, setElectricContactPhone] = useState('');
  const [otherContactName, setOtherContactName] = useState('');
  const [otherContactPhone, setOtherContactPhone] = useState('');
  const [commonNotice, setCommonNotice] = useState('');

  // 임차료 수납 계좌
  const [rentBank, setRentBank] = useState('');
  const [rentAccount, setRentAccount] = useState('');

  // 사진 업로드
  const [mainPhoto, setMainPhoto] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const totalSteps = 7;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleComplete = async () => {
    setIsUploading(true);
    try {
      const buildingId = await addBuilding({
        landlordPhone: user?.phoneNumber || '',
        address: address || '서울시 강남구 테헤란로 123',
        buildingType,
        totalUnitCount: parseInt(totalUnits) || 1,
        commonDoorCode,
        commonWifiCode,
        otherCommonCode,
        trashInfo,
        parkingInfo,
        gasContactName,
        gasContactPhone,
        electricContactName,
        electricContactPhone,
        otherContactName,
        otherContactPhone,
        commonNotice,
        rentBank,
        rentAccount,
      });

      if (mainPhoto) {
        const path = `buildings/${buildingId}/mainPhoto_${Date.now()}.webp`;
        const url = await uploadCompressedImage(mainPhoto, path);
        await updateBuilding(buildingId, { mainPhotoUrl: url });
      }

      navigate(`/landlord/buildings/${buildingId}/units`, { replace: true });
    } catch (error) {
      console.error('Building registration failed:', error);
      alert('건물 등록에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsUploading(false);
    }
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMainPhoto(file);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1: return address.trim().length > 0;
      case 2: return buildingType !== '';
      case 3: return totalUnits !== '' && parseInt(totalUnits) > 0;
      case 4: return true; 
      case 5: return true; 
      case 6: return rentBank.trim().length > 0 && rentAccount.trim().length > 0;
      case 7: return true;
      default: return false;
    }
  };

  return (
    <div className="page">
      <TopBar title="건물 등록" />
      <ProgressBar current={step} total={totalSteps} />

      <div className="page-content bld-reg">
        {/* Step 1: 주소 */}
        {step === 1 && (
          <div className="bld-reg__step" key="step1">
            <h2 className="bld-reg__question">주소를 입력해주세요</h2>
            <div className="bld-reg__address-input">
              <input
                type="text"
                className="bld-reg__text-input"
                placeholder="예: 서울시 강남구 테헤란로 123"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                autoFocus
              />
              <p className="bld-reg__hint">도로명 또는 지번 주소를 입력해주세요</p>
            </div>
          </div>
        )}

        {/* Step 2: 건물유형 */}
        {step === 2 && (
          <div className="bld-reg__step" key="step2">
            <h2 className="bld-reg__question">어떤 건물인가요?</h2>
            <div className="bld-reg__type-grid">
              {BUILDING_TYPES.map((type) => (
                <Card
                  key={type}
                  clickable
                  selected={buildingType === type}
                  onClick={() => setBuildingType(type)}
                >
                  <div className="bld-reg__type-card">
                    <span className="bld-reg__type-icon">
                      {type === '원룸' ? '🏠' : type === '다가구' ? '🏢' : type === '오피스텔' ? '🏙️' : '🏪'}
                    </span>
                    <span className="bld-reg__type-label">{type}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: 총 호실수 */}
        {step === 3 && (
          <div className="bld-reg__step" key="step3">
            <h2 className="bld-reg__question">총 몇 호실인가요?</h2>
            <NumPad
              value={totalUnits}
              onChange={setTotalUnits}
              maxLength={3}
              placeholder="호실 수를 입력해주세요"
              unit="호실"
            />
          </div>
        )}

        {/* Step 4: 건물 공용 정보 */}
        {step === 4 && (
          <div className="bld-reg__step" key="step4">
            <h2 className="bld-reg__question">공용 시설 및 보안 정보</h2>
            <p className="bld-reg__hint" style={{ textAlign: 'center', marginBottom: '24px' }}>한 번만 입력해두면 입주키트에 자동으로 채워집니다.</p>
            <div className="bld-reg__inputs" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '0 16px', overflowY: 'auto', maxHeight: '50vh' }}>
              <div className="bld-reg__label-input" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '20px', color: 'var(--color-text-secondary)' }}>공동현관 비밀번호 (선택)</label>
                <input
                  type="text"
                  className="bld-reg__text-input"
                  placeholder="예: 1234*"
                  value={commonDoorCode}
                  onChange={(e) => setCommonDoorCode(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="bld-reg__label-input" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '20px', color: 'var(--color-text-secondary)' }}>와이파이 비밀번호 (선택)</label>
                <input
                  type="text"
                  className="bld-reg__text-input"
                  placeholder="예: 12345678"
                  value={commonWifiCode}
                  onChange={(e) => setCommonWifiCode(e.target.value)}
                />
              </div>
              <div className="bld-reg__label-input" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '20px', color: 'var(--color-text-secondary)' }}>기타 공용 비밀번호 (분리수거장 등)</label>
                <input
                  type="text"
                  className="bld-reg__text-input"
                  placeholder="예: 분리수거장 1111*"
                  value={otherCommonCode}
                  onChange={(e) => setOtherCommonCode(e.target.value)}
                />
              </div>
              <div className="bld-reg__label-input" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '20px', color: 'var(--color-text-secondary)' }}>건물 주차 규정</label>
                <input
                  type="text"
                  className="bld-reg__text-input"
                  placeholder="예: 지정 주차구역 3번 사용"
                  value={parkingInfo}
                  onChange={(e) => setParkingInfo(e.target.value)}
                />
              </div>
              <div className="bld-reg__label-input" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '20px', color: 'var(--color-text-secondary)' }}>쓰레기 / 재활용 배출 안내</label>
                <input
                  type="text"
                  className="bld-reg__text-input"
                  placeholder="예: 화/목 저녁 8시, 전봇대 앞"
                  value={trashInfo}
                  onChange={(e) => setTrashInfo(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 5: 연락처 및 고지사항 */}
        {step === 5 && (
          <div className="bld-reg__step" key="step5">
            <h2 className="bld-reg__question">연락처 및 고지사항</h2>
            <div className="bld-reg__inputs" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '0 16px', overflowY: 'auto', maxHeight: '50vh' }}>
              <div className="bld-reg__label-input" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '20px', color: 'var(--color-text-secondary)' }}>도시가스 고객센터</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select
                    className="bld-reg__text-input"
                    style={{ flex: 1 }}
                    value={gasContactName}
                    onChange={(e) => setGasContactName(e.target.value)}
                    autoFocus
                  >
                    <option value="">회사 선택</option>
                    {GAS_COMPANIES.map(company => (
                      <option key={company} value={company}>{company}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    className="bld-reg__text-input"
                    placeholder="전화번호 (예: 1588-5788)"
                    style={{ flex: 1 }}
                    value={gasContactPhone}
                    onChange={(e) => setGasContactPhone(formatPhoneNumber(e.target.value))}
                    maxLength={13}
                  />
                </div>
              </div>
              <div className="bld-reg__label-input" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '20px', color: 'var(--color-text-secondary)' }}>한국전력 고객센터</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    className="bld-reg__text-input"
                    value="한국전력공사"
                    style={{ flex: 1, backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-tertiary)' }}
                    readOnly
                  />
                  <input
                    type="text"
                    className="bld-reg__text-input"
                    placeholder="전화번호 (예: 국번없이 123)"
                    style={{ flex: 1 }}
                    value={electricContactPhone}
                    onChange={(e) => setElectricContactPhone(formatPhoneNumber(e.target.value))}
                    maxLength={13}
                  />
                </div>
              </div>
              <div className="bld-reg__label-input" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '20px', color: 'var(--color-text-secondary)' }}>기타 연락처 (건물 관리인 등)</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    className="bld-reg__text-input"
                    placeholder="명칭 (예: 관리소장)"
                    style={{ flex: 1 }}
                    value={otherContactName}
                    onChange={(e) => setOtherContactName(e.target.value)}
                  />
                  <input
                    type="text"
                    className="bld-reg__text-input"
                    placeholder="전화번호 (예: 010-1234-5678)"
                    style={{ flex: 1 }}
                    value={otherContactPhone}
                    onChange={(e) => setOtherContactPhone(formatPhoneNumber(e.target.value))}
                    maxLength={13}
                  />
                </div>
              </div>
              <div className="bld-reg__label-input" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '20px', color: 'var(--color-text-secondary)' }}>공통 고지 사항</label>
                <textarea
                  className="bld-reg__text-input"
                  style={{ height: '80px', resize: 'none' }}
                  placeholder="예: 옥상 사용 불가, 밤 10시 이후 세탁 자제"
                  value={commonNotice}
                  onChange={(e) => setCommonNotice(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 6: 수납 계좌 */}
        {step === 6 && (
          <div className="bld-reg__step" key="step6">
            <h2 className="bld-reg__question">임차료 수납 계좌 등록</h2>
            <div className="bld-reg__inputs" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '0 16px' }}>
              <div className="bld-reg__label-input" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '20px', color: 'var(--color-text-secondary)' }}>은행명</label>
                <input
                  type="text"
                  className="bld-reg__text-input"
                  placeholder="예: 신한은행, 카카오뱅크"
                  value={rentBank}
                  onChange={(e) => setRentBank(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="bld-reg__label-input" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '20px', color: 'var(--color-text-secondary)' }}>임차료 수납 계좌번호</label>
                <input
                  className="bld-reg__text-input"
                  type="text"
                  placeholder="'-' 없이 숫자만 입력"
                  value={rentAccount}
                  onChange={(e) => setRentAccount(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 7: 사진 */}
        {step === 7 && (
          <div className="bld-reg__step" key="step7">
            <h2 className="bld-reg__question">건물 사진을 등록해주세요</h2>
            <p className="bld-reg__hint" style={{ textAlign: 'center', marginBottom: '16px' }}>최대 1장 (대표 사진)</p>
            <div className="bld-reg__photo" style={{ position: 'relative' }}>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handlePhotoSelect} 
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                id="building-photo-upload"
              />
              {mainPhoto ? (
                <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3', borderRadius: '16px', overflow: 'hidden' }}>
                  <img 
                    src={URL.createObjectURL(mainPhoto)} 
                    alt="Selected" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                  <button 
                    onClick={(e) => { e.stopPropagation(); setMainPhoto(null); document.getElementById('building-photo-upload').value = ''; }}
                    style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="bld-reg__camera-btn" style={{ pointerEvents: 'none' }}>
                  <span className="bld-reg__camera-icon">📷</span>
                  <span>사진 선택하기</span>
                </div>
              )}
              {!mainPhoto && <p className="bld-reg__hint">사진은 나중에 추가할 수도 있어요</p>}
            </div>
          </div>
        )}

        {/* 하단 버튼 */}
        <div className="bld-reg__footer">
          {step < totalSteps ? (
            <Button
              variant="primary"
              disabled={!canProceed()}
              onClick={handleNext}
            >
              다음
            </Button>
          ) : (
            <Button
              variant="accent"
              disabled={isUploading}
              onClick={handleComplete}
            >
              {isUploading ? '업로드 중...' : '건물 등록 완료'}
            </Button>
          )}
          {step > 1 && (
            <button className="bld-reg__skip" onClick={() => step === 7 ? handleComplete() : handleNext()}>
              {step === 7 ? '사진 없이 완료' : '건너뛰기'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

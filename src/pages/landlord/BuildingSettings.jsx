import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import usePropertyStore from '../../stores/propertyStore';
import TopBar from '../../components/TopBar';
import Button from '../../components/Button';
import { formatPhoneNumber } from '../../utils/formatters';
import './BuildingSettings.css';

const BUILDING_TYPES = ['원룸', '다가구', '오피스텔', '상가주택'];

const GAS_COMPANIES = [
  '코원에너지서비스', '예스코', '서울도시가스', '귀뚜라미에너지', 
  '삼천리', '대륜E&S', '인천도시가스', 'CNCITY에너지', 
  '충청에너지서비스', '참빛충북도시가스', '미래엔서해에너지', 'JB(주)',
  '대성에너지', '해양에너지', '부산도시가스', '경동도시가스', '직접 입력'
];

export default function BuildingSettings() {
  const navigate = useNavigate();
  const { buildingId } = useParams();
  const building = usePropertyStore((s) => s.getBuilding(buildingId));
  const updateBuilding = usePropertyStore((s) => s.updateBuilding);
  const deleteBuilding = usePropertyStore((s) => s.deleteBuilding);

  // Form State
  const [address, setAddress] = useState('');
  const [buildingType, setBuildingType] = useState('');
  const [totalUnits, setTotalUnits] = useState('');
  const [commonDoorCode, setCommonDoorCode] = useState('');
  const [commonWifiCode, setCommonWifiCode] = useState('');
  const [otherCommonCode, setOtherCommonCode] = useState('');
  const [trashInfo, setTrashInfo] = useState('');
  const [parkingInfo, setParkingInfo] = useState('');
  const [gasContactName, setGasContactName] = useState('');
  const [gasContactPhone, setGasContactPhone] = useState('');
  const [electricContactName, setElectricContactName] = useState('');
  const [electricContactPhone, setElectricContactPhone] = useState('');
  const [otherContactName, setOtherContactName] = useState('');
  const [otherContactPhone, setOtherContactPhone] = useState('');
  const [commonNotice, setCommonNotice] = useState('');
  const [rentBank, setRentBank] = useState('');
  const [rentAccount, setRentAccount] = useState('');

  // Delete Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');

  useEffect(() => {
    if (building) {
      setAddress(building.address || '');
      setBuildingType(building.buildingType || '');
      setTotalUnits(building.totalUnitCount?.toString() || '');
      setCommonDoorCode(building.commonDoorCode || '');
      setCommonWifiCode(building.commonWifiCode || '');
      setOtherCommonCode(building.otherCommonCode || '');
      setTrashInfo(building.trashInfo || '');
      setParkingInfo(building.parkingInfo || '');
      setGasContactName(building.gasContactName || '');
      setGasContactPhone(building.gasContactPhone || building.gasContact || '');
      setElectricContactName(building.electricContactName || '한국전력공사');
      setElectricContactPhone(building.electricContactPhone || building.electricContact || '');
      setOtherContactName(building.otherContactName || '');
      setOtherContactPhone(building.otherContactPhone || building.otherContact || '');
      setCommonNotice(building.commonNotice || '');
      setRentBank(building.rentBank || '');
      setRentAccount(building.rentAccount || '');
    } else {
      navigate('/landlord', { replace: true });
    }
  }, [building, navigate]);

  const handleSave = async () => {
    await updateBuilding(buildingId, {
      address,
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
    alert('건물 정보가 저장되었습니다.');
    navigate(-1);
  };

  const handleDelete = async () => {
    if (deleteInput === '삭제합니다') {
      await deleteBuilding(buildingId);
      setShowDeleteModal(false);
      navigate('/landlord', { replace: true });
    }
  };

  if (!building) return null;

  return (
    <div className="page">
      <TopBar title="건물 상세" />
      <div className="page-content bld-settings" style={{ overflowY: 'auto' }}>
        
        {/* 1. 기본 정보 */}
        <div className="bld-settings__section">
          <h2 className="bld-settings__section-title">기본 정보</h2>
          <div className="bld-settings__inputs">
            <div className="bld-settings__label-input">
              <label>건물 주소</label>
              <input
                className="bld-settings__text-input"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            <div className="bld-settings__label-input">
              <label>건물 유형</label>
              <div className="bld-settings__type-grid">
                {BUILDING_TYPES.map((type) => (
                  <div
                    key={type}
                    className={`bld-settings__type-card ${buildingType === type ? 'selected' : ''}`}
                    onClick={() => setBuildingType(type)}
                  >
                    <span className="bld-settings__type-icon">
                      {type === '원룸' ? '🏠' : type === '다가구' ? '🏢' : type === '오피스텔' ? '🏙️' : '🏪'}
                    </span>
                    <span className="bld-settings__type-label">{type}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bld-settings__label-input">
              <label>총 호실 수</label>
              <input
                type="number"
                className="bld-settings__text-input"
                value={totalUnits}
                onChange={(e) => setTotalUnits(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* 2. 공용 시설 및 보안 */}
        <div className="bld-settings__section">
          <h2 className="bld-settings__section-title">공용 시설 및 보안</h2>
          <div className="bld-settings__inputs">
            <div className="bld-settings__label-input">
              <label>공동현관 비밀번호</label>
              <input
                className="bld-settings__text-input"
                value={commonDoorCode}
                onChange={(e) => setCommonDoorCode(e.target.value)}
              />
            </div>
            <div className="bld-settings__label-input">
              <label>와이파이 비밀번호</label>
              <input
                className="bld-settings__text-input"
                value={commonWifiCode}
                onChange={(e) => setCommonWifiCode(e.target.value)}
              />
            </div>
            <div className="bld-settings__label-input">
              <label>기타 공용 비밀번호 (분리수거장 등)</label>
              <input
                className="bld-settings__text-input"
                value={otherCommonCode}
                onChange={(e) => setOtherCommonCode(e.target.value)}
              />
            </div>
            <div className="bld-settings__label-input">
              <label>건물 주차 규정</label>
              <input
                className="bld-settings__text-input"
                value={parkingInfo}
                onChange={(e) => setParkingInfo(e.target.value)}
              />
            </div>
            <div className="bld-settings__label-input">
              <label>쓰레기 / 재활용 배출 안내</label>
              <input
                className="bld-settings__text-input"
                value={trashInfo}
                onChange={(e) => setTrashInfo(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* 3. 연락처 및 고지사항 */}
        <div className="bld-settings__section">
          <h2 className="bld-settings__section-title">연락처 및 고지사항</h2>
          <div className="bld-settings__inputs">
            <div className="bld-settings__label-input">
              <label>도시가스 고객센터</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <select
                  className="bld-settings__text-input"
                  style={{ flex: 1 }}
                  value={gasContactName}
                  onChange={(e) => setGasContactName(e.target.value)}
                >
                  <option value="">회사 선택</option>
                  {GAS_COMPANIES.map(company => (
                    <option key={company} value={company}>{company}</option>
                  ))}
                </select>
                <input
                  className="bld-settings__text-input"
                  placeholder="전화번호"
                  style={{ flex: 1 }}
                  value={gasContactPhone}
                  onChange={(e) => setGasContactPhone(formatPhoneNumber(e.target.value))}
                  maxLength={13}
                />
              </div>
            </div>
            <div className="bld-settings__label-input">
              <label>한국전력 고객센터</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  className="bld-settings__text-input"
                  value="한국전력공사"
                  style={{ flex: 1, backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-tertiary)' }}
                  readOnly
                />
                <input
                  className="bld-settings__text-input"
                  placeholder="전화번호"
                  style={{ flex: 1 }}
                  value={electricContactPhone}
                  onChange={(e) => setElectricContactPhone(formatPhoneNumber(e.target.value))}
                  maxLength={13}
                />
              </div>
            </div>
            <div className="bld-settings__label-input">
              <label>기타 연락처 (관리인 등)</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  className="bld-settings__text-input"
                  placeholder="명칭"
                  style={{ flex: 1 }}
                  value={otherContactName}
                  onChange={(e) => setOtherContactName(e.target.value)}
                />
                <input
                  className="bld-settings__text-input"
                  placeholder="전화번호"
                  style={{ flex: 1 }}
                  value={otherContactPhone}
                  onChange={(e) => setOtherContactPhone(formatPhoneNumber(e.target.value))}
                  maxLength={13}
                />
              </div>
            </div>
            <div className="bld-settings__label-input">
              <label>공통 고지 사항</label>
              <textarea
                className="bld-settings__textarea"
                value={commonNotice}
                onChange={(e) => setCommonNotice(e.target.value)}
              />
            </div>
            <div className="bld-settings__label-input">
              <label>임차료 수납 은행</label>
              <input
                className="bld-settings__text-input"
                value={rentBank}
                placeholder="예: 신한은행"
                onChange={(e) => setRentBank(e.target.value)}
              />
            </div>
            <div className="bld-settings__label-input">
              <label>임차료 수납 계좌번호</label>
              <input
                className="bld-settings__text-input"
                value={rentAccount}
                placeholder="예: 110-123-456789"
                onChange={(e) => setRentAccount(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="bld-settings__footer">
          <Button variant="primary" onClick={handleSave}>
            저장하기
          </Button>
        </div>

        <div className="bld-settings__danger-zone">
          <h2 className="bld-settings__danger-title">Danger Zone</h2>
          <p className="bld-settings__danger-desc">
            건물을 삭제하면 관련된 모든 호실, 계약, 입주키트 정보가 영구적으로 삭제됩니다.
          </p>
          <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
            이 건물 삭제하기
          </Button>
        </div>
      </div>

      {showDeleteModal && (
        <div className="bld-settings__modal-overlay">
          <div className="bld-settings__modal">
            <h3 className="bld-settings__modal-title">정말 삭제하시겠습니까?</h3>
            <p className="bld-settings__modal-desc">
              삭제를 진행하시려면 아래에 <span className="bld-settings__modal-highlight">'삭제합니다'</span> 라고 입력해주세요.
            </p>
            <input
              className="bld-settings__text-input"
              placeholder="삭제합니다"
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
            />
            <div className="bld-settings__modal-actions">
              <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                취소
              </Button>
              <Button 
                variant="danger" 
                disabled={deleteInput !== '삭제합니다'}
                onClick={handleDelete}
              >
                삭제 확인
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

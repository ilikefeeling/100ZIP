import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import usePropertyStore from '../../stores/propertyStore';
import TopBar from '../../components/TopBar';
import Card from '../../components/Card';
import NumPad from '../../components/NumPad';
import Button from '../../components/Button';
import ProgressBar from '../../components/ProgressBar';
import './UnitRegister.css';

/**
 * LL-002b 호실 등록
 * 순차 카드: 호실번호 → 전용면적 → 구조 → 옵션 → 특기사항
 */

const STRUCTURE_TYPES = ['원룸', '투룸', '쓰리룸이상'];
const OPTION_ITEMS = [
  { id: 'aircon', icon: '❄️', label: '에어컨' },
  { id: 'fridge', icon: '🧊', label: '냉장고' },
  { id: 'washer', icon: '🧺', label: '세탁기' },
  { id: 'closet', icon: '🗄️', label: '붙박이장' },
  { id: 'stove', icon: '🔥', label: '가스레인지' },
  { id: 'elevator', icon: '🛗', label: '엘리베이터' },
];
const SPECIAL_PRESETS = ['반려동물가능', '주차가능', '없음'];

export default function UnitRegister() {
  const navigate = useNavigate();
  const { buildingId } = useParams();
  const addUnit = usePropertyStore((s) => s.addUnit);
  const building = usePropertyStore((s) => s.getBuilding(buildingId));

  const [step, setStep] = useState(1);
  const [unitNumber, setUnitNumber] = useState('');
  const [area, setArea] = useState('');
  const [structure, setStructure] = useState('');
  const [options, setOptions] = useState([]);
  const [selectedSpecials, setSelectedSpecials] = useState([]);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customNote, setCustomNote] = useState('');
  const [showCustomOption, setShowCustomOption] = useState(false);
  const [customOption, setCustomOption] = useState('');

  const totalSteps = 5;

  const toggleOption = (id) => {
    setOptions((prev) =>
      prev.includes(id) ? prev.filter((o) => o !== id) : [...prev, id]
    );
  };

  const toggleSpecial = (preset) => {
    if (preset === '없음') {
      setSelectedSpecials(['없음']);
      return;
    }
    
    setSelectedSpecials((prev) => {
      const filtered = prev.filter((p) => p !== '없음');
      if (filtered.includes(preset)) {
        return filtered.filter((p) => p !== preset);
      }
      return [...filtered, preset];
    });
  };

  const handleComplete = async () => {
    let finalNotes = [...selectedSpecials];
    if (showCustomInput && customNote.trim()) {
      finalNotes.push(customNote.trim());
    }

    await addUnit(buildingId, {
      unitNumber: unitNumber || `${(building?.units?.length || 0) + 1}01호`,
      floor: parseInt(unitNumber) ? Math.floor(parseInt(unitNumber) / 100) : 1,
      exclusiveArea: parseFloat(area) || 0,
      structureType: structure,
      options: [
        ...options.map((id) => OPTION_ITEMS.find((o) => o.id === id)?.label).filter(Boolean),
        ...(showCustomOption && customOption.trim() ? [customOption.trim()] : [])
      ],
      specialNotes: finalNotes.join(', '),
    });
    navigate(`/landlord/buildings/${buildingId}/units`, { replace: true });
  };

  return (
    <div className="page">
      <TopBar title="호실 등록" />
      <ProgressBar current={step} total={totalSteps} />

      <div className="page-content unit-reg">
        {/* Step 1: 호실번호 */}
        {step === 1 && (
          <div className="unit-reg__step" key="s1">
            <h2 className="unit-reg__question">호실 번호를 확인해주세요</h2>
            <input
              type="text"
              className="unit-reg__input"
              placeholder="예: 101호"
              value={unitNumber}
              onChange={(e) => setUnitNumber(e.target.value)}
              autoFocus
            />
          </div>
        )}

        {/* Step 2: 전용면적 */}
        {step === 2 && (
          <div className="unit-reg__step" key="s2">
            <h2 className="unit-reg__question">전용면적이 어떻게 되나요?</h2>
            <NumPad
              value={area}
              onChange={setArea}
              maxLength={5}
              placeholder="면적을 입력해주세요"
              unit="㎡"
              allowDecimal={true}
            />
          </div>
        )}

        {/* Step 3: 구조 */}
        {step === 3 && (
          <div className="unit-reg__step" key="s3">
            <h2 className="unit-reg__question">구조는요?</h2>
            <div className="unit-reg__cards-row">
              {STRUCTURE_TYPES.map((type) => (
                <Card
                  key={type}
                  clickable
                  selected={structure === type}
                  onClick={() => setStructure(type)}
                >
                  <div className="unit-reg__card-label">{type}</div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: 옵션 */}
        {step === 4 && (
          <div className="unit-reg__step" key="s4">
            <h2 className="unit-reg__question">어떤 옵션이 있나요?</h2>
            <div className="unit-reg__option-grid">
              {OPTION_ITEMS.map((item) => (
                <Card
                  key={item.id}
                  clickable
                  selected={options.includes(item.id)}
                  onClick={() => toggleOption(item.id)}
                >
                  <div className="unit-reg__option-card">
                    <span className="unit-reg__option-icon">{item.icon}</span>
                    <span className="unit-reg__option-label">{item.label}</span>
                  </div>
                </Card>
              ))}
              <button
                className={`unit-reg__custom-btn ${showCustomOption ? 'unit-reg__custom-btn--active' : ''}`}
                onClick={() => setShowCustomOption(!showCustomOption)}
                style={{
                  background: showCustomOption ? 'var(--color-primary-100)' : 'transparent',
                  borderColor: showCustomOption ? 'var(--color-primary-600)' : 'var(--color-border)',
                  color: showCustomOption ? 'var(--color-primary-600)' : 'var(--color-text-secondary)',
                  gridColumn: '1 / -1',
                  marginTop: '12px'
                }}
              >
                + 직접 입력
              </button>
            </div>
            {showCustomOption && (
              <input
                type="text"
                className="unit-reg__input"
                style={{ marginTop: '12px' }}
                placeholder="예: 전자레인지, 침대 등"
                value={customOption}
                onChange={(e) => setCustomOption(e.target.value)}
              />
            )}
          </div>
        )}

        {/* Step 5: 특기사항 */}
        {step === 5 && (
          <div className="unit-reg__step" key="s5">
            <h2 className="unit-reg__question">특이사항이 있나요?</h2>
            <div className="unit-reg__special-list">
              {SPECIAL_PRESETS.map((preset) => (
                <Card
                  key={preset}
                  clickable
                  selected={selectedSpecials.includes(preset)}
                  onClick={() => toggleSpecial(preset)}
                >
                  <div className="unit-reg__card-label">{preset}</div>
                </Card>
              ))}
              <button
                className={`unit-reg__custom-btn ${showCustomInput ? 'unit-reg__custom-btn--active' : ''}`}
                onClick={() => setShowCustomInput(!showCustomInput)}
                style={{
                  background: showCustomInput ? 'var(--color-primary-100)' : 'transparent',
                  borderColor: showCustomInput ? 'var(--color-primary-600)' : 'var(--color-border)',
                  color: showCustomInput ? 'var(--color-primary-600)' : 'var(--color-text-secondary)',
                }}
              >
                직접 입력
              </button>
            </div>
            {showCustomInput && (
              <textarea
                className="unit-reg__textarea"
                placeholder="특이사항을 입력해주세요"
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                rows={3}
              />
            )}
          </div>
        )}

        {/* 하단 */}
        <div className="unit-reg__footer">
          {step < totalSteps ? (
            <Button variant="primary" onClick={() => setStep(step + 1)}>
              다음
            </Button>
          ) : (
            <Button variant="accent" onClick={handleComplete}>
              호실 등록 완료
            </Button>
          )}
          <button className="unit-reg__skip" onClick={() => step < totalSteps ? setStep(step + 1) : handleComplete()}>
            건너뛰기
          </button>
        </div>
      </div>
    </div>
  );
}

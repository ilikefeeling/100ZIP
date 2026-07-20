import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import usePropertyStore from '../../stores/propertyStore';
import TopBar from '../../components/TopBar';
import Card from '../../components/Card';
import NumPad from '../../components/NumPad';
import Button from '../../components/Button';
import ProgressBar from '../../components/ProgressBar';
import { uploadCompressedImage } from '../../utils/imageUpload';
import './UnitRegister.css';

/**
 * LL-002b 호실 등록
 * 순차 카드: 호실번호 → 전용면적 → 구조 → 옵션 → 특기사항 → 사진(최대 3장)
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
  const updateUnit = usePropertyStore((s) => s.updateUnit);
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
  
  const [customOptionsList, setCustomOptionsList] = useState([]);
  const [customNotesList, setCustomNotesList] = useState([]);

  // 사진 업로드 (최대 3장)
  const [photos, setPhotos] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const totalSteps = 6;

  // 임시 저장 불러오기
  useEffect(() => {
    const draft = sessionStorage.getItem(`unitDraft_${buildingId}`);
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        if (parsed.step) setStep(parsed.step);
        if (parsed.unitNumber) setUnitNumber(parsed.unitNumber);
        if (parsed.area) setArea(parsed.area);
        if (parsed.structure) setStructure(parsed.structure);
        if (parsed.options) setOptions(parsed.options);
        if (parsed.selectedSpecials) setSelectedSpecials(parsed.selectedSpecials);
        if (parsed.customOptionsList) setCustomOptionsList(parsed.customOptionsList);
        if (parsed.customNotesList) setCustomNotesList(parsed.customNotesList);
      } catch (e) {}
    }
  }, [buildingId]);

  // 자동 임시 저장
  useEffect(() => {
    if (step > 1 || unitNumber || area) {
      sessionStorage.setItem(`unitDraft_${buildingId}`, JSON.stringify({
        step, unitNumber, area, structure, options, selectedSpecials, customOptionsList, customNotesList
      }));
    }
  }, [step, unitNumber, area, structure, options, selectedSpecials, customOptionsList, customNotesList, buildingId]);

  const handleAddCustomOption = () => {
    if (customOption.trim() && !customOptionsList.includes(customOption.trim())) {
      setCustomOptionsList([...customOptionsList, customOption.trim()]);
    }
    setCustomOption('');
  };

  const handleRemoveCustomOption = (opt) => {
    setCustomOptionsList(customOptionsList.filter(o => o !== opt));
  };

  const handleAddCustomNote = () => {
    if (customNote.trim() && !customNotesList.includes(customNote.trim())) {
      setCustomNotesList([...customNotesList, customNote.trim()]);
    }
    setCustomNote('');
  };

  const handleRemoveCustomNote = (note) => {
    setCustomNotesList(customNotesList.filter(n => n !== note));
  };

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

  const handlePhotoSelect = (e) => {
    const files = Array.from(e.target.files);
    if (photos.length + files.length > 3) {
      alert('사진은 최대 3장까지만 등록할 수 있습니다.');
      return;
    }
    setPhotos([...photos, ...files].slice(0, 3));
  };

  const removePhoto = (index) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleComplete = async () => {
    setIsUploading(true);
    try {
      let finalNotes = [...selectedSpecials, ...customNotesList];
      if (showCustomInput && customNote.trim()) {
        finalNotes.push(customNote.trim());
      }

      const unitId = await addUnit(buildingId, {
        unitNumber: unitNumber || `${(building?.units?.length || 0) + 1}01호`,
        floor: parseInt(unitNumber) ? Math.floor(parseInt(unitNumber) / 100) : 1,
        exclusiveArea: parseFloat(area) || 0,
        structureType: structure,
        options: [
          ...options.map((id) => OPTION_ITEMS.find((o) => o.id === id)?.label).filter(Boolean),
          ...customOptionsList,
          ...(showCustomOption && customOption.trim() ? [customOption.trim()] : [])
        ],
        specialNotes: finalNotes.join(', '),
      });
      
      sessionStorage.removeItem(`unitDraft_${buildingId}`);

      // 사진 업로드 병렬 처리
      if (photos.length > 0) {
        const uploadPromises = photos.map((photo, index) => {
          const path = `buildings/${buildingId}/units/${unitId}/photo_${Date.now()}_${index}.webp`;
          return uploadCompressedImage(photo, path);
        });
        const uploadedUrls = await Promise.all(uploadPromises);
        await updateUnit(buildingId, unitId, { photoUrls: uploadedUrls });
      }

      navigate(`/landlord/buildings/${buildingId}/units`, { replace: true });
    } catch (error) {
      console.error('Unit registration failed:', error);
      alert('호실 등록에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="page">
      <TopBar title="호실 등록" onBack={handleBack} />
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
              {customOptionsList.map((opt) => (
                <Card key={opt} clickable selected onClick={() => handleRemoveCustomOption(opt)}>
                  <div className="unit-reg__option-card">
                    <span className="unit-reg__option-icon">✨</span>
                    <span className="unit-reg__option-label">{opt}</span>
                  </div>
                </Card>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <input
                  type="text"
                  className="unit-reg__input"
                  style={{ flex: 1 }}
                  placeholder="예: 전자레인지, 침대 등"
                  value={customOption}
                  onChange={(e) => setCustomOption(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomOption();
                    }
                  }}
                />
                <Button variant="primary" fullWidth={false} onClick={handleAddCustomOption} style={{ padding: '0 24px', whiteSpace: 'nowrap' }}>추가</Button>
              </div>
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
              {customNotesList.map((note) => (
                <Card key={note} clickable selected onClick={() => handleRemoveCustomNote(note)}>
                  <div className="unit-reg__card-label">{note}</div>
                </Card>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <input
                  type="text"
                  className="unit-reg__input"
                  style={{ flex: 1 }}
                  placeholder="특이사항을 입력해주세요"
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomNote();
                    }
                  }}
                />
                <Button variant="primary" fullWidth={false} onClick={handleAddCustomNote} style={{ padding: '0 24px', whiteSpace: 'nowrap' }}>추가</Button>
              </div>
          </div>
        )}

        {/* Step 6: 사진 */}
        {step === 6 && (
          <div className="unit-reg__step" key="s6">
            <h2 className="unit-reg__question">호실 사진을 등록해주세요</h2>
            <p className="unit-reg__hint" style={{ textAlign: 'center', marginBottom: '16px' }}>최대 3장 (방, 화장실 등)</p>
            
            <div className="unit-reg__photo-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              {photos.map((photo, index) => (
                <div key={index} style={{ position: 'relative', aspectRatio: '4/3', borderRadius: '12px', overflow: 'hidden' }}>
                  <img 
                    src={URL.createObjectURL(photo)} 
                    alt={`Selected ${index + 1}`} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                  <button 
                    onClick={() => removePhoto(index)}
                    style={{ position: 'absolute', top: '6px', right: '6px', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}
                  >
                    ✕
                  </button>
                </div>
              ))}
              
              {photos.length < 3 && (
                <div style={{ position: 'relative', aspectRatio: '4/3', borderRadius: '12px', backgroundColor: 'var(--color-bg-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed var(--color-border)' }}>
                  <input 
                    type="file" 
                    accept="image/*" 
                    multiple
                    onChange={handlePhotoSelect} 
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '24px', marginBottom: '4px' }}>📷</span>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>{photos.length}/3 추가</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 하단 */}
        <div className="unit-reg__footer">
          {step < totalSteps ? (
            <Button variant="primary" onClick={() => setStep(step + 1)}>
              다음
            </Button>
          ) : (
            <Button variant="accent" disabled={isUploading} onClick={handleComplete}>
              {isUploading ? '업로드 중...' : '호실 등록 완료'}
            </Button>
          )}
          {step > 1 && (
            <button className="unit-reg__skip" onClick={() => step < totalSteps ? setStep(step + 1) : handleComplete()}>
              {step === totalSteps ? '사진 없이 완료' : '건너뛰기'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

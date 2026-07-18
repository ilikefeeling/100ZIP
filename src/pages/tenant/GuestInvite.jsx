import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import usePropertyStore from '../../stores/propertyStore';
import TopBar from '../../components/TopBar';
import Button from '../../components/Button';
import './TenantSign.css';

/**
 * 비회원용 게스트 서명 화면 (/invite/:buildingId/:unitId)
 * 로그인 없이 URL 파라미터만으로 호실 정보를 조회하고 서명을 완료합니다.
 */
export default function GuestInvite() {
  const navigate = useNavigate();
  const { buildingId, unitId } = useParams();
  const getBuildingForGuest = usePropertyStore((s) => s.getBuildingForGuest);
  const updateContractForGuest = usePropertyStore((s) => s.updateContractForGuest);

  const [loading, setLoading] = useState(true);
  const [myBuilding, setMyBuilding] = useState(null);
  const [myUnit, setMyUnit] = useState(null);
  const [myContract, setMyContract] = useState(null);
  const [error, setError] = useState('');

  const [hasSigned, setHasSigned] = useState(false);
  const canvasRef = useRef(null);
  let isDrawing = false;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const building = await getBuildingForGuest(buildingId);
        if (!building) throw new Error('건물 정보를 찾을 수 없습니다.');

        const unit = building.units?.find((u) => u.id === unitId);
        if (!unit || !unit.contract) throw new Error('해당 호실의 계약 정보를 찾을 수 없습니다.');
        
        // 상태에 따른 렌더링 처리는 UI에서 담당 (에러로 차단하지 않음)

        setMyBuilding(building);
        setMyUnit(unit);
        setMyContract(unit.contract);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [buildingId, unitId, getBuildingForGuest]);

  if (loading) {
    return (
      <div className="page">
        <TopBar title="입주키트 및 서명" />
        <div className="page-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <p>계약 정보를 불러오는 중입니다...</p>
        </div>
      </div>
    );
  }

  if (error || !myContract) {
    return (
      <div className="page">
        <TopBar title="오류" />
        <div className="page-content" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '60vh', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
          <p style={{ fontWeight: 'bold' }}>{error || '잘못된 접근입니다.'}</p>
        </div>
      </div>
    );
  }

  const handleStart = (e) => {
    isDrawing = true;
    draw(e);
  };

  const handleEnd = () => {
    if (!isDrawing) return;
    isDrawing = false;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    setHasSigned(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000';

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
  };

  const handleSubmit = async () => {
    try {
      await updateContractForGuest(myBuilding.id, myUnit.id, {
        tenantSigned: true,
        status: '서명완료'
      });
      alert('전자서명이 완료되었습니다.\n임대인이 보증금 입금을 확인하면 입주키트가 공개됩니다.');
      // 성공 시 브라우저 창을 닫으라고 안내하거나, 가상의 완료 페이지로 전환
      navigate('/role-select');
    } catch (err) {
      alert('서명 저장 중 오류가 발생했습니다. 다시 시도해 주세요.');
    }
  };

  return (
    <div className="page">
      <TopBar title="입주키트 및 서명" hideBack />
      <div className="page-content tenant-sign">
        <div className="tenant-sign__info">
          <h2 className="tenant-sign__heading">계약 정보를 확인해주세요</h2>
          <div className="tenant-sign__table">
            <div className="tenant-sign__row">
              <span>임차인 명</span>
              <strong>{myContract.tenantName}</strong>
            </div>
            <div className="tenant-sign__row">
              <span>목적물</span>
              <strong>{myBuilding.address} {myUnit.unitNumber}</strong>
            </div>
            <div className="tenant-sign__row">
              <span>보증금 / 월세</span>
              <strong>{Number(myContract.deposit).toLocaleString()}원 / {Number(myContract.monthlyRent).toLocaleString()}원</strong>
            </div>
            <div className="tenant-sign__row">
              <span>계약기간</span>
              <strong>{myContract.startDate} ~ {myContract.endDate}</strong>
            </div>
            <div className="tenant-sign__row" style={{ flexWrap: 'wrap', gap: '8px' }}>
               <span style={{ width: '100%', marginBottom: '4px' }}>입주키트 및 이용안내</span>
               {myContract.status === '확정' ? (
                 <div style={{ backgroundColor: 'var(--color-surface-sunken)', padding: '12px', borderRadius: '8px', width: '100%', fontSize: '14px', whiteSpace: 'pre-wrap' }}>
                   {myBuilding.commonDoorCode && `[공동현관] ${myBuilding.commonDoorCode}\n`}
                   {myBuilding.commonWifiCode && `[와이파이] ${myBuilding.commonWifiCode}\n`}
                   {myBuilding.trashDisposalInfo && `[쓰레기 배출] ${myBuilding.trashDisposalInfo}\n`}
                   {myBuilding.parkingInfo && `[주차] ${myBuilding.parkingInfo}\n`}
                   {myBuilding.commonNotice && `\n[안내사항]\n${myBuilding.commonNotice}`}
                 </div>
               ) : (
                 <div style={{ backgroundColor: 'var(--color-surface-sunken)', padding: '20px 12px', borderRadius: '8px', width: '100%', fontSize: '14px', textAlign: 'center', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                   <span style={{ fontSize: '24px' }}>🔒</span>
                   <span>보증금 입금 및 임대인 확인 후<br />공동현관 비밀번호 등 입주키트가 공개됩니다.</span>
                 </div>
               )}
            </div>
          </div>
        </div>

        {myContract.status === '대기' ? (
          <>
            <div className="tenant-sign__pad">
              <div className="tenant-sign__pad-header">
                <h3>서명하기</h3>
                {hasSigned && (
                  <button className="tenant-sign__clear-btn" onClick={clearSignature}>
                    지우기
                  </button>
                )}
              </div>
              <div className="tenant-sign__canvas-wrapper">
                <canvas
                  ref={canvasRef}
                  width={320}
                  height={160}
                  className="tenant-sign__canvas"
                  onMouseDown={handleStart}
                  onMouseUp={handleEnd}
                  onMouseMove={draw}
                  onMouseLeave={handleEnd}
                  onTouchStart={handleStart}
                  onTouchEnd={handleEnd}
                  onTouchMove={draw}
                />
                {!hasSigned && (
                  <div className="tenant-sign__canvas-hint">이곳에 서명해주세요</div>
                )}
              </div>
            </div>

            <div className="tenant-sign__footer">
              <Button variant="accent" disabled={!hasSigned} onClick={handleSubmit}>
                동의하고 서명 완료하기
              </Button>
            </div>
          </>
        ) : (
          <div style={{ marginTop: '24px', padding: '24px', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-card)', border: '1px solid var(--color-primary-200)', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📝</div>
            <h3 style={{ margin: '0 0 8px 0' }}>전자서명 완료</h3>
            <p style={{ margin: 0, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
              {myContract.status === '서명완료' 
                ? '보증금이 입금되고 임대인이 확인하면\n입주키트가 공개됩니다.'
                : '계약이 확정되었습니다.\n입주를 진심으로 환영합니다! 🎉'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

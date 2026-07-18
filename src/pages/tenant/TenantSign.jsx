import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import usePropertyStore from '../../stores/propertyStore';
import TopBar from '../../components/TopBar';
import Button from '../../components/Button';
import './TenantSign.css';

/**
 * TN-003 전자서명
 * 서명 패드 (canvas) + 계약 주요 내용 확인
 */
export default function TenantSign() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const buildings = usePropertyStore((s) => s.buildings);
  const updateContract = usePropertyStore((s) => s.updateContract);

  const [hasSigned, setHasSigned] = useState(false);
  const canvasRef = useRef(null);
  let isDrawing = false;

  // 계약 정보 매칭
  let myContract = null;
  let myUnit = null;
  let myBuilding = null;

  for (const b of buildings) {
    const unit = b.units?.find((u) => u.contract && u.contract.tenantName === user?.name);
    if (unit) {
      myBuilding = b;
      myUnit = unit;
      myContract = unit.contract;
      break;
    }
  }

  if (!myContract) return null;

  const handleStart = (e) => {
    isDrawing = true;
    draw(e);
  };

  const handleEnd = () => {
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
    
    // 마우스 및 터치 좌표 지원
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
    const canvas = canvasRef.current;
    // 배경을 흰색으로 하고 이미지를 추출할 수도 있지만, 현재는 투명 배경 PNG로 저장
    const signatureDataUrl = canvas.toDataURL('image/png');

    // 1. 서명 상태 업데이트
    await updateContract(myBuilding.id, myUnit.id, {
      tenantSigned: true,
      status: '확정', // 쌍방 서명 완료로 간주
      signatureDataUrl: signatureDataUrl,
      signedAt: new Date().toISOString()
    });
    // 2. 홈으로 이동
    alert('전자서명이 완료되었습니다.\n입주를 환영합니다! 🎉');
    navigate('/tenant/home', { replace: true });
  };

  return (
    <div className="page">
      <TopBar title="전자서명" />
      <div className="page-content tenant-sign">
        <div className="tenant-sign__info">
          <h2 className="tenant-sign__heading">계약 정보를 확인해주세요</h2>
          <div className="tenant-sign__table">
            <div className="tenant-sign__row">
              <span>목적물</span>
              <strong>{myBuilding.address} {myUnit.unitNumber}</strong>
            </div>
            <div className="tenant-sign__row">
              <span>보증금 / 월세</span>
              <strong>{myContract.deposit.toLocaleString()} / {myContract.monthlyRent.toLocaleString()}</strong>
            </div>
            <div className="tenant-sign__row">
              <span>계약기간</span>
              <strong>{myContract.startDate} ~ {myContract.endDate}</strong>
            </div>
          </div>
        </div>

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
            서명 완료하기
          </Button>
        </div>
      </div>
    </div>
  );
}

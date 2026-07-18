import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import usePropertyStore from '../../stores/propertyStore';
import TopBar from '../../components/TopBar';
import NumPad from '../../components/NumPad';
import Button from '../../components/Button';
import './MoveOutSettle.css';

/**
 * LL-007 퇴거 정산
 * 미납금/공과금/수리비 등을 보증금에서 차감 계산 후 공실 전환
 */
export default function MoveOutSettle() {
  const navigate = useNavigate();
  const { buildingId, unitId } = useParams();
  const unit = usePropertyStore((s) => s.getUnit(buildingId, unitId));
  const updateUnit = usePropertyStore((s) => s.updateUnit);
  const updateContract = usePropertyStore((s) => s.updateContract);

  const [step, setStep] = useState('list'); // 'list' | 'add_deduction'
  const [deductionType, setDeductionType] = useState('가스요금 정산');
  const [deductionAmount, setDeductionAmount] = useState('');
  const [deductionMemo, setDeductionMemo] = useState('');
  const [deductionPhoto, setDeductionPhoto] = useState(false);
  
  const [refundBank, setRefundBank] = useState('신한은행');
  const [refundAccount, setRefundAccount] = useState('110-123-456789');

  const [deductions, setDeductions] = useState([]);

  // 월세/관리비 일할 정산용 state
  const [prorateType, setProrateType] = useState(unit?.contract?.rentPaymentType || 'prepaid'); // 'prepaid' (선불) | 'postpaid' (후불)
  const [prorateBaseAmount, setProrateBaseAmount] = useState(0);
  const [prorateDays, setProrateDays] = useState('');
  

  const [tenantPaidItems, setTenantPaidItems] = useState({
    gas: false,
    electric: false,
    water: false,
    internet: false,
    waste: false
  });

  const handleTenantPaidChange = (item) => {
    setTenantPaidItems(prev => ({ ...prev, [item]: !prev[item] }));
  };

  if (!unit || !unit.contract) return null;

  const deposit = unit.contract.deposit || 0;
  const totalDeduction = deductions.reduce((acc, cur) => acc + cur.amount, 0);
  const returnAmount = deposit - totalDeduction;

  const monthlyRent = unit.contract.monthlyRent || 0;
  const maintenanceFee = unit.contract.maintenanceFee || 0;
  const defaultProrateBase = monthlyRent + maintenanceFee;


  const handleAddDeduction = () => {
    if (deductionType === '월세/관리비 일할 정산') {
      if (!prorateDays) {
        alert('정산 일수를 입력해주세요.');
        return;
      }
      const baseAmt = parseInt(prorateBaseAmount) || defaultProrateBase;
      const days = parseInt(prorateDays) || 0;
      let calculatedAmt = Math.floor((baseAmt / 30) * days / 10) * 10;
      
      // 선불이면 반환해줘야 하므로 보증금 증가 (음수 차감)
      // 후불이면 받아야 하므로 보증금 차감 (양수 차감)
      const finalAmount = prorateType === 'prepaid' ? -calculatedAmt : calculatedAmt;
      
      setDeductions([...deductions, { 
        type: `${deductionType} (${prorateType === 'prepaid' ? '선불' : '후불'} ${days}일)`,
        amount: finalAmount,
        memo: deductionMemo,
        photo: deductionPhoto
      }]);
    } else {
      if (deductionAmount !== '') {
        setDeductions([...deductions, { 
          type: deductionType, 
          amount: parseInt(deductionAmount) || 0,
          memo: deductionMemo,
          photo: deductionPhoto
        }]);
      }
    }
    setStep('list');
    setDeductionAmount('');
    setDeductionMemo('');
    setProrateDays('');
    setDeductionPhoto(false);
  };

  const handleComplete = async () => {
    if (window.confirm(`반환할 보증금은 ${returnAmount.toLocaleString()}원입니다.\n입력하신 정산 내역을 임차인에게 전송하시겠습니까?`)) {
      // 1. 계약 종료 대기 혹은 임차인 확인 대기 상태로 변경 및 정산 데이터 저장
      await updateContract(buildingId, unitId, {
        status: '정산대기',
        moveOutSettle: {
          deposit,
          deductions,
          totalDeduction,
          returnAmount,
          tenantPaidItems,
          refundBank,
          refundAccount,
        }
      });
      
      alert('임차인에게 퇴거 정산 내역이 성공적으로 전송되었습니다!\n(임차인이 확인 및 동의 후 공실로 전환됩니다.)');
      navigate(`/landlord/buildings/${buildingId}/units`, { replace: true });
    }
  };

  if (step === 'add_deduction') {
    return (
      <div className="page">
        <TopBar title="차감 항목 추가" onBack={() => setStep('list')} />
        <div className="page-content move-out__utility">
          <h2 className="move-out__heading">{deductionType} 입력</h2>
          <div className="move-out__select-row">
            <select
              className="move-out__select"
              value={deductionType}
              onChange={(e) => setDeductionType(e.target.value)}
            >
              <option value="가스요금 정산">가스요금 정산</option>
              <option value="수도요금 정산">수도요금 정산</option>
              <option value="전기요금 정산">전기요금 정산</option>
              <option value="사전 정산 완료 (개별납부)">사전 정산 완료 (개별납부)</option>
              <option value="월세/관리비 일할 정산">월세/관리비 일할 정산</option>
              <option value="미납 월세">미납 월세</option>
              <option value="미납 관리비">미납 관리비</option>
              <option value="청소비">청소비</option>
              <option value="파손 수리비">파손 수리비</option>
              <option value="폐기물 처리비">폐기물 처리비</option>
              <option value="기타">기타</option>
            </select>
          </div>
          {['가스요금 정산', '수도요금 정산', '전기요금 정산'].includes(deductionType) && (
            <button 
              onClick={() => alert('계량기 지침량을 입력하여 요금을 자동 계산하는 기능은 현재 개발 중입니다.\n정산된 금액을 직접 입력해주세요.')}
              style={{
                width: '100%',
                padding: '12px',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-primary-300)',
                color: 'var(--color-primary-700)',
                borderRadius: 'var(--radius-button)',
                marginBottom: '16px',
                fontWeight: '600',
                fontSize: '15px'
              }}
            >
              지침량 기반 요금 계산기 (개발중)
            </button>
          )}
          {deductionType === '월세/관리비 일할 정산' ? (
            <div className="move-out__prorate-calculator">
              <div className="move-out__prorate-group">
                <label className="move-out__prorate-label">정산 대상 금액 (월세+관리비)</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="number"
                    className="move-out__input"
                    style={{ flex: 1 }}
                    value={prorateBaseAmount || defaultProrateBase}
                    onChange={(e) => setProrateBaseAmount(e.target.value)}
                  />
                  <span>원</span>
                </div>
              </div>
              
              <div className="move-out__prorate-group">
                <label className="move-out__prorate-label">정산 기준</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    className={`move-out__prorate-btn ${prorateType === 'prepaid' ? 'active' : ''}`}
                    onClick={() => setProrateType('prepaid')}
                  >
                    선불 (환불액 계산)
                  </button>
                  <button 
                    className={`move-out__prorate-btn ${prorateType === 'postpaid' ? 'active' : ''}`}
                    onClick={() => setProrateType('postpaid')}
                  >
                    후불 (청구액 계산)
                  </button>
                </div>
                <p className="move-out__prorate-hint">
                  {prorateType === 'prepaid' 
                    ? '* 선불: 안 살고 나가는 일수만큼 환불 (보증금 반환액 증가)'
                    : '* 후불: 살고 나가는 일수만큼 청구 (보증금 반환액 차감)'}
                </p>
              </div>

              <div className="move-out__prorate-group">
                <label className="move-out__prorate-label">정산 일수</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="number"
                    className="move-out__input"
                    style={{ flex: 1 }}
                    placeholder="예: 5"
                    value={prorateDays}
                    onChange={(e) => setProrateDays(e.target.value)}
                  />
                  <span>일</span>
                </div>
              </div>

              <div className="move-out__prorate-result">
                <span>자동 계산 금액:</span>
                <strong>
                  {(prorateDays ? Math.floor(( (parseInt(prorateBaseAmount) || defaultProrateBase) / 30) * parseInt(prorateDays) / 10) * 10 : 0).toLocaleString()}원
                </strong>
              </div>
            </div>
          ) : (
            <NumPad
              value={deductionAmount}
              onChange={setDeductionAmount}
              maxLength={8}
              placeholder="차감할 금액 입력"
              unit="원"
              isCurrency={true}
            />
          )}
          <div className="move-out__extra-inputs">
            <input
              className="move-out__input"
              placeholder="상세 사유 / 메모 (선택)"
              value={deductionMemo}
              onChange={(e) => setDeductionMemo(e.target.value)}
            />
            <button 
              className="move-out__photo-upload"
              onClick={() => {
                alert('사진 첨부 다이얼로그 팝업 (MVP 모의)');
                setDeductionPhoto(true);
              }}
            >
              📷 {deductionPhoto ? '사진 첨부 완료 (1장)' : '영수증/파손내역 사진 첨부'}
            </button>
          </div>
          <div className="move-out__footer">
            <Button variant="primary" disabled={deductionAmount === ''} onClick={handleAddDeduction}>
              추가하기
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <TopBar title="퇴거 정산" />
      <div className="page-content move-out">
        <div className="move-out__breakdown">
          <h2 className="move-out__section-title">반환 보증금 계산</h2>
          <div className="move-out__item">
            <span className="move-out__label">기존 보증금</span>
            <span className="move-out__value tabular-nums">{deposit.toLocaleString()}원</span>
          </div>
          
          <div className="move-out__divider" />

          {deductions.map((deduction, i) => (
            <div key={i} className="move-out__item move-out__item--deduction" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="move-out__label">
                  {deduction.type}
                  <button 
                    className="move-out__remove-btn" 
                    onClick={() => setDeductions(deductions.filter((_, idx) => idx !== i))}
                    aria-label="삭제"
                  >
                    ✕
                  </button>
                </span>
                <span className="move-out__value tabular-nums">
                  {deduction.amount > 0 ? '-' : '+'} {Math.abs(deduction.amount).toLocaleString()}원
                </span>
              </div>
              {(deduction.memo || deduction.photo) && (
                <span className="move-out__memo-display">
                  {deduction.memo && `↳ ${deduction.memo}`}
                  {deduction.photo && (deduction.memo ? ' (📷첨부됨)' : '↳ 📷사진 첨부됨')}
                </span>
              )}
            </div>
          ))}

          <button className="move-out__add-btn" onClick={() => setStep('add_deduction')}>
            + 청소비 / 수리비 등 차감항목 추가
          </button>
        </div>

        <div style={{ marginTop: '24px', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', padding: '20px', borderRadius: '12px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--color-text-primary)' }}>임차인 개별 완납/해지 확인</h3>
          <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', marginBottom: '20px', lineHeight: '1.5' }}>
            임차인이 본인 명의로 직접 정산 및 해지한 항목을 체크해주세요.<br/>
            체크된 항목은 정산 내역서에 <strong>'완납(해지) 확인됨'</strong>으로 함께 기록됩니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {[
              { id: 'gas', label: '도시가스 요금 완납' },
              { id: 'electric', label: '전기 요금 완납' },
              { id: 'water', label: '수도 요금 완납' },
              { id: 'internet', label: '인터넷/TV 해지·이전' },
              { id: 'waste', label: '대형폐기물 처리 완료' },
            ].map(item => (
              <label key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '16px', fontWeight: '500', cursor: 'pointer', color: 'var(--color-text-primary)' }}>
                <input 
                  type="checkbox" 
                  checked={tenantPaidItems[item.id]} 
                  onChange={() => handleTenantPaidChange(item.id)} 
                  style={{ width: '24px', height: '24px', accentColor: 'var(--color-primary-500)' }}
                />
                {item.label}
              </label>
            ))}
          </div>
        </div>

        <div className="move-out__total">
          <span className="move-out__total-label">최종 반환 금액</span>
          <span className="move-out__total-value tabular-nums">{returnAmount.toLocaleString()}원</span>
        </div>

        <div className="move-out__refund-section">
          <h3 className="move-out__refund-title">보증금 환불 계좌 (임차인)</h3>
          <div className="move-out__refund-input-group">
            <input
              className="move-out__input move-out__refund-bank"
              placeholder="은행명"
              value={refundBank}
              onChange={(e) => setRefundBank(e.target.value)}
            />
            <input
              className="move-out__input"
              placeholder="계좌번호"
              value={refundAccount}
              onChange={(e) => setRefundAccount(e.target.value)}
            />
          </div>
          <p style={{ fontSize: '18px', color: 'var(--color-text-secondary)', marginTop: '8px' }}>
            * 계약 시 등록된 임차인 계좌가 자동으로 불러와집니다.
          </p>
        </div>

        <div className="move-out__footer" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)', textAlign: 'center', lineHeight: '1.5', padding: '0 16px' }}>
            입력하신 정산 내역은 임차인에게 전송되며,<br/>
            <strong>임차인의 확인 및 동의 절차</strong>를 거쳐야<br/>
            분쟁 없이 퇴거 정산이 최종 완료됩니다.
          </div>
          <Button variant="primary" onClick={handleComplete}>
            임차인에게 정산 내역 전송 및 확인 요청
          </Button>
        </div>
      </div>
    </div>
  );
}

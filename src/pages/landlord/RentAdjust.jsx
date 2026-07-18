import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import usePropertyStore from '../../stores/propertyStore';
import TopBar from '../../components/TopBar';
import NumPad from '../../components/NumPad';
import Button from '../../components/Button';
import './RentAdjust.css';

/**
 * LL-006 금액 확인 및 조정
 * 당월 청구 금액 상세 항목 (월세, 공용관리비 등) + 가스/수도 등 추가요금 입력 (숫자패드)
 */
export default function RentAdjust() {
  const navigate = useNavigate();
  const { buildingId, unitId } = useParams();
  const unit = usePropertyStore((s) => s.getUnit(buildingId, unitId));
  const contract = unit?.contract;

  const [step, setStep] = useState('list'); // 'list' | 'add_utility'
  const [utilityType, setUtilityType] = useState('가스요금');
  const [utilityAmount, setUtilityAmount] = useState('');
  const [utilityMemo, setUtilityMemo] = useState('');
  const [utilityPhoto, setUtilityPhoto] = useState(false);
  
  const [adjustments, setAdjustments] = useState([]);

  if (!contract) return null;

  const baseRent = contract.monthlyRent || 0;
  const maintenance = contract.maintenanceFee || 0;
  
  const totalAmount = baseRent + maintenance + adjustments.reduce((acc, cur) => acc + cur.amount, 0);

  const handleAddUtility = () => {
    if (utilityAmount) {
      setAdjustments([...adjustments, { 
        type: utilityType, 
        amount: parseInt(utilityAmount),
        memo: utilityMemo,
        photo: utilityPhoto
      }]);
    }
    setStep('list');
    setUtilityAmount('');
    setUtilityMemo('');
    setUtilityPhoto(false);
  };

  if (step === 'add_utility') {
    return (
      <div className="page">
        <TopBar title="추가 금액 입력" onBack={() => setStep('list')} />
        <div className="page-content rent-adjust__utility">
          <h2 className="rent-adjust__heading">{utilityType} 추가하기</h2>
          <div className="rent-adjust__select-row">
            <select
              className="rent-adjust__select"
              value={utilityType}
              onChange={(e) => setUtilityType(e.target.value)}
            >
              <option value="가스요금">가스요금</option>
              <option value="수도요금">수도요금</option>
              <option value="전기요금">전기요금</option>
              <option value="인터넷/TV요금">인터넷/TV요금</option>
              <option value="청소비">청소비</option>
              <option value="기타">기타</option>
            </select>
          </div>
          {['가스요금', '수도요금', '전기요금'].includes(utilityType) && (
            <button 
              onClick={() => alert('계량기 지침량을 입력하여 요금을 자동 계산하는 기능은 현재 개발 중입니다.\n추가할 요금을 직접 입력해주세요.')}
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
          <NumPad
            value={utilityAmount}
            onChange={setUtilityAmount}
            maxLength={7}
            placeholder="금액 입력"
            unit="원"
            isCurrency={true}
          />
          <div className="rent-adjust__extra-inputs">
            <input
              className="rent-adjust__input"
              placeholder="상세 사유 / 메모 (선택)"
              value={utilityMemo}
              onChange={(e) => setUtilityMemo(e.target.value)}
            />
            <button 
              className="rent-adjust__photo-upload"
              onClick={() => {
                alert('사진 첨부 다이얼로그 팝업 (MVP 모의)');
                setUtilityPhoto(true);
              }}
            >
              📷 {utilityPhoto ? '고지서/영수증 사진 첨부 완료' : '고지서/영수증 사진 첨부'}
            </button>
          </div>
          <div className="rent-adjust__footer">
            <Button variant="primary" disabled={!utilityAmount} onClick={handleAddUtility}>
              추가하기
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <TopBar title="금액 확인 및 조정" />
      <div className="page-content rent-adjust">
        <div className="rent-adjust__breakdown">
          <div className="rent-adjust__item">
            <span className="rent-adjust__label">기본 월세</span>
            <span className="rent-adjust__value tabular-nums">{baseRent.toLocaleString()}원</span>
          </div>
          <div className="rent-adjust__item">
            <span className="rent-adjust__label">공용 관리비</span>
            <span className="rent-adjust__value tabular-nums">{maintenance.toLocaleString()}원</span>
          </div>
          
          {adjustments.map((adj, i) => (
            <div key={i} className="rent-adjust__item rent-adjust__item--added" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="rent-adjust__label">
                  {adj.type}
                  <button className="rent-adjust__remove-btn" onClick={() => setAdjustments(adjustments.filter((_, idx) => idx !== i))}>
                    ✕
                  </button>
                </span>
                <span className="rent-adjust__value tabular-nums">+{adj.amount.toLocaleString()}원</span>
              </div>
              {(adj.memo || adj.photo) && (
                <span className="rent-adjust__memo-display">
                  {adj.memo && `↳ ${adj.memo}`}
                  {adj.photo && (adj.memo ? ' (📷첨부됨)' : '↳ 📷사진 첨부됨')}
                </span>
              )}
            </div>
          ))}

          <button className="rent-adjust__add-btn" onClick={() => setStep('add_utility')}>
            + 가스/수도 등 추가요금 입력
          </button>
        </div>

        <div className="rent-adjust__total">
          <span className="rent-adjust__total-label">이번 달 청구금액</span>
          <span className="rent-adjust__total-value tabular-nums">{totalAmount.toLocaleString()}원</span>
        </div>

        <div className="rent-adjust__footer" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)', textAlign: 'center', lineHeight: '1.5', padding: '0 16px' }}>
            추가된 청구 내역은 임차인에게 전송되며,<br/>
            <strong>임차인의 확인 및 동의 절차</strong>를 거쳐야<br/>
            최종 청구 금액으로 확정되어 분쟁을 예방할 수 있습니다.
          </div>
          <Button variant="accent" onClick={() => {
            alert(`[금액 조정 확정 및 알림]\n임차인(${contract.tenantName}님)에게 이번 달 청구 금액(${totalAmount.toLocaleString()}원)과 상세 내역이 포함된 알림이 발송되었습니다.\n임차인이 확인 후 동의하면 최종 확정됩니다.`);
            navigate(-1);
          }}>
            임차인에게 청구 내역 전송 및 확인 요청
          </Button>
        </div>
      </div>
    </div>
  );
}

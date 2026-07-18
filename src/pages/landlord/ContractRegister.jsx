import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import usePropertyStore from '../../stores/propertyStore';
import TopBar from '../../components/TopBar';
import NumPad from '../../components/NumPad';
import Button from '../../components/Button';
import ProgressBar from '../../components/ProgressBar';
import { formatPhoneNumber } from '../../utils/formatters';
import { getKoreanAmount } from '../../utils/format';
import './ContractRegister.css';

/**
 * LL-003a 계약 등록
 * 순차 카드: 임차인 이름/연락처 → 보증금 → 월세/관리비 → 계약기간
 */
export default function ContractRegister() {
  const navigate = useNavigate();
  const { buildingId, unitId } = useParams();
  const addContract = usePropertyStore((s) => s.addContract);

  const [step, setStep] = useState(1);
  const totalSteps = 5;

  const [tenantName, setTenantName] = useState('');
  const [tenantPhone, setTenantPhone] = useState('');
  const [deposit, setDeposit] = useState('');
  const [rent, setRent] = useState('');
  const [maintenanceFee, setMaintenanceFee] = useState('');
  const [rentPaymentType, setRentPaymentType] = useState('prepaid'); // 'prepaid' | 'postpaid'
  const [contractDate, setContractDate] = useState(new Date().toISOString().split('T')[0]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [periodType, setPeriodType] = useState('1year');

  const [brokerName, setBrokerName] = useState('');
  const [brokerPhone, setBrokerPhone] = useState('');
  const [brokerFee, setBrokerFee] = useState('');
  const [isBrokerFeePaid, setIsBrokerFeePaid] = useState(false);

  const calculateEndDate = (start, years) => {
    if (!start) return '';
    const d = new Date(start);
    if (isNaN(d.getTime())) return '';
    d.setFullYear(d.getFullYear() + years);
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  };

  const handleStartDateChange = (e) => {
    const newStart = e.target.value;
    setStartDate(newStart);
    if (periodType === '1year') {
      setEndDate(calculateEndDate(newStart, 1));
    } else if (periodType === '2year') {
      setEndDate(calculateEndDate(newStart, 2));
    }
  };

  const handlePeriodClick = (type) => {
    setPeriodType(type);
    if (type === '1year' && startDate) {
      setEndDate(calculateEndDate(startDate, 1));
    } else if (type === '2year' && startDate) {
      setEndDate(calculateEndDate(startDate, 2));
    }
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
    setPeriodType('custom');
  };

  const handleComplete = async () => {
    await addContract(buildingId, unitId, {
      tenantName,
      tenantPhone,
      deposit: parseInt(deposit) || 0,
      monthlyRent: parseInt(rent) || 0,
      maintenanceFee: parseInt(maintenanceFee) || 0,
      rentPaymentType,
      rentPaymentDay: startDate ? parseInt(startDate.split('-')[2], 10) : null,
      contractDate,
      startDate,
      endDate,
      broker: {
        name: brokerName.trim(),
        phone: brokerPhone.trim(),
        fee: parseInt(brokerFee) || 0,
        isPaid: isBrokerFeePaid,
        paidDate: isBrokerFeePaid ? new Date().toISOString() : null
      }
    });
    // 계약 등록 후 바로 입주키트 작성으로 유도
    navigate(`/landlord/buildings/${buildingId}/units/${unitId}/kit/new`, { replace: true });
  };

  const canProceed = () => {
    switch (step) {
      case 1: return tenantName.trim().length > 0 && tenantPhone.trim().length >= 10;
      case 2: return deposit.length > 0;
      case 3: return rent.length > 0;
      case 4: return startDate && endDate;
      case 5: return true; // Broker info is optional
      default: return false;
    }
  };

  return (
    <div className="page">
      <TopBar title="계약 등록" />
      <ProgressBar current={step} total={totalSteps} />

      <div className="page-content contract-reg">
        {step === 1 && (
          <div className="contract-reg__step" key="s1">
            <h2 className="contract-reg__question">임차인 정보를 입력해주세요</h2>
            <div className="contract-reg__inputs">
              <input
                className="contract-reg__input"
                placeholder="이름 (예: 홍길동)"
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
                autoFocus
              />
              <input
                className="contract-reg__input"
                type="tel"
                placeholder="연락처 (예: 010-1234-5678)"
                value={tenantPhone}
                onChange={(e) => setTenantPhone(formatPhoneNumber(e.target.value))}
                maxLength={13}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="contract-reg__step" key="s2">
            <h2 className="contract-reg__question">보증금은 얼마인가요?</h2>
            <NumPad
              value={deposit}
              onChange={setDeposit}
              maxLength={10}
              placeholder="보증금 입력"
              unit="원"
              isCurrency={true}
            />
          </div>
        )}

        {step === 3 && (
          <div className="contract-reg__step" key="s3">
            <h2 className="contract-reg__question">월세와 관리비를 입력해주세요</h2>
            <div className="contract-reg__inputs">
              <div className="contract-reg__label-input">
                <label>월세</label>
                <input
                  className="contract-reg__input tabular-nums"
                  type="text"
                  inputMode="numeric"
                  placeholder="예: 500,000"
                  value={rent ? parseInt(rent.toString().replace(/,/g, '')).toLocaleString() : ''}
                  onChange={(e) => {
                    const rawValue = e.target.value.replace(/,/g, '').replace(/[^0-9]/g, '');
                    setRent(rawValue);
                  }}
                  autoFocus
                />
                {rent && (
                  <div className="amount-korean-helper">
                    <span className="amount-korean-label">= 금</span>
                    <span className="amount-korean-text">{getKoreanAmount(rent)}</span>
                  </div>
                )}
              </div>
              <div className="contract-reg__label-input">
                <label>관리비 (선택)</label>
                <input
                  className="contract-reg__input tabular-nums"
                  type="text"
                  inputMode="numeric"
                  placeholder="예: 50,000"
                  value={maintenanceFee ? parseInt(maintenanceFee.toString().replace(/,/g, '')).toLocaleString() : ''}
                  onChange={(e) => {
                    const rawValue = e.target.value.replace(/,/g, '').replace(/[^0-9]/g, '');
                    setMaintenanceFee(rawValue);
                  }}
                />
                {maintenanceFee && (
                  <div className="amount-korean-helper">
                    <span className="amount-korean-label">= 금</span>
                    <span className="amount-korean-text">{getKoreanAmount(maintenanceFee)}</span>
                  </div>
                )}
              </div>
              <div className="contract-reg__label-input" style={{ marginTop: '16px' }}>
                <label>월세 납부 방식</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    className={`contract-reg__period-btn ${rentPaymentType === 'prepaid' ? 'active' : ''}`}
                    onClick={() => setRentPaymentType('prepaid')}
                  >
                    매월 선불
                  </button>
                  <button 
                    className={`contract-reg__period-btn ${rentPaymentType === 'postpaid' ? 'active' : ''}`}
                    onClick={() => setRentPaymentType('postpaid')}
                  >
                    매월 후불
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="contract-reg__step" key="s4">
            <h2 className="contract-reg__question">계약 기간을 설정해주세요</h2>
            <div className="contract-reg__inputs">
              <div className="contract-reg__label-input" style={{ marginBottom: '16px' }}>
                <label>계약 체결일</label>
                <input
                  className="contract-reg__input"
                  type="date"
                  value={contractDate}
                  onChange={(e) => setContractDate(e.target.value)}
                />
              </div>

              <div className="contract-reg__label-input">
                <label>입주일 (계약 시작일)</label>
                <input
                  className="contract-reg__input"
                  type="date"
                  value={startDate}
                  onChange={handleStartDateChange}
                />
              </div>

              <div className="contract-reg__period-chips">
                <button
                  className={`contract-reg__period-chip ${periodType === '1year' ? 'active' : ''}`}
                  onClick={() => handlePeriodClick('1year')}
                >
                  1년
                </button>
                <button
                  className={`contract-reg__period-chip ${periodType === '2year' ? 'active' : ''}`}
                  onClick={() => handlePeriodClick('2year')}
                >
                  2년
                </button>
                <button
                  className={`contract-reg__period-chip ${periodType === 'custom' ? 'active' : ''}`}
                  onClick={() => handlePeriodClick('custom')}
                >
                  직접 설정
                </button>
              </div>

              <div className="contract-reg__label-input">
                <label>만기일 (계약 종료일)</label>
                <input
                  className="contract-reg__input"
                  type="date"
                  value={endDate}
                  onChange={handleEndDateChange}
                  readOnly={periodType !== 'custom'}
                  style={periodType !== 'custom' ? { backgroundColor: 'var(--color-background)', color: 'var(--color-text-secondary)' } : {}}
                />
              </div>

              {startDate && (
                <div style={{ marginTop: '16px', padding: '16px', backgroundColor: 'var(--color-surface)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                  <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
                    💡 <strong>월세 입금일 자동 확정</strong>
                  </p>
                  <p style={{ fontSize: '15px', fontWeight: '500' }}>
                    매월 <span style={{ color: 'var(--color-primary-600)', fontSize: '18px', fontWeight: '700' }}>{parseInt(startDate.split('-')[2], 10)}</span>일 
                    ({rentPaymentType === 'prepaid' ? '선불' : '후불'})
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="contract-reg__step" key="s5">
            <h2 className="contract-reg__question">중개사무소 정보 (선택)</h2>
            <div className="contract-reg__inputs">
              <input
                className="contract-reg__input"
                placeholder="부동산 이름 (예: 황금공인중개사)"
                value={brokerName}
                onChange={(e) => setBrokerName(e.target.value)}
                autoFocus
              />
              <input
                className="contract-reg__input"
                type="tel"
                placeholder="중개사 연락처"
                value={brokerPhone}
                onChange={(e) => setBrokerPhone(formatPhoneNumber(e.target.value))}
                maxLength={13}
              />
              <div className="contract-reg__label-input" style={{ marginTop: '16px' }}>
                <label>중개수수료</label>
                <input
                  className="contract-reg__input tabular-nums"
                  type="text"
                  inputMode="numeric"
                  placeholder="예: 300,000"
                  value={brokerFee ? parseInt(brokerFee.toString().replace(/,/g, '')).toLocaleString() : ''}
                  onChange={(e) => {
                    const rawValue = e.target.value.replace(/,/g, '').replace(/[^0-9]/g, '');
                    setBrokerFee(rawValue);
                  }}
                />
                {brokerFee && (
                  <div className="amount-korean-helper">
                    <span className="amount-korean-label">= 금</span>
                    <span className="amount-korean-text">{getKoreanAmount(brokerFee)}</span>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px', padding: '12px', background: 'var(--color-surface)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                <input 
                  type="checkbox" 
                  id="isPaid" 
                  checked={isBrokerFeePaid} 
                  onChange={(e) => setIsBrokerFeePaid(e.target.checked)}
                  style={{ width: '20px', height: '20px', accentColor: 'var(--color-primary)' }}
                />
                <label htmlFor="isPaid" style={{ fontSize: '16px', fontWeight: '500', cursor: 'pointer' }}>중개수수료 지급 완료</label>
              </div>
            </div>
          </div>
        )}

        <div className="contract-reg__footer">
          {step < totalSteps ? (
            <Button
              variant="primary"
              disabled={!canProceed()}
              onClick={() => setStep(step + 1)}
            >
              다음
            </Button>
          ) : (
            <Button
              variant="accent"
              disabled={!canProceed()}
              onClick={handleComplete}
            >
              다음 (입주키트 작성)
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

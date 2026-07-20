import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
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
  const getBuilding = usePropertyStore((s) => s.getBuilding);
  const addContract = usePropertyStore((s) => s.addContract);
  const buildings = usePropertyStore((s) => s.buildings);
  const user = useAuthStore((s) => s.user);

  const [step, setStep] = useState(1);
  const totalSteps = 5;

  const [tenantName, setTenantName] = useState('');
  const [tenantPhone, setTenantPhone] = useState('');
  const [deposit, setDeposit] = useState('');
  const [rent, setRent] = useState('');
  const [maintenanceFee, setMaintenanceFee] = useState('');
  const [rentPaymentType, setRentPaymentType] = useState('prepaid'); // prepaid, postpaid
  const [contractDate, setContractDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [periodType, setPeriodType] = useState('custom');

  const [brokerName, setBrokerName] = useState('');
  const [brokerPhone, setBrokerPhone] = useState('');
  const [brokerFee, setBrokerFee] = useState('');
  const [brokerFeeStatus, setBrokerFeeStatus] = useState('unpaid'); // 'unpaid', 'scheduled', 'paid'
  const [expectedPaidDate, setExpectedPaidDate] = useState('');
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(false);

  const [activeField, setActiveField] = useState('rent'); // 'rent' or 'maintenanceFee'

  const existingBrokers = useMemo(() => {
    const brokers = [];
    const seen = new Set();
    
    // 1. 주거래 중개사 (내 프로필에 등록된 목록 - LandlordBrokerManage 연동)
    if (user && user.brokers) {
      user.brokers.forEach(brk => {
        if (brk.name && !seen.has(brk.name)) {
          seen.add(brk.name);
          brokers.push({ officeName: brk.name, phone: brk.phone || '' });
        }
      });
    }

    // 2. 과거 계약에 입력했던 중개사 목록
    (buildings || []).forEach(b => {
      if (b.units) {
        b.units.forEach(u => {
          // 현재 임대중인 계약
          if (u.contract && u.contract.broker && u.contract.broker.name) {
            const officeName = u.contract.broker.name;
            if (!seen.has(officeName) && officeName !== '임대인 직접 진행') {
              seen.add(officeName);
              brokers.push({ officeName, phone: u.contract.broker.phone || '' });
            }
          }
          // 과거 계약들
          if (u.contractHistory) {
            u.contractHistory.forEach(c => {
              if (c.broker && c.broker.name) {
                const officeName = c.broker.name;
                if (!seen.has(officeName) && officeName !== '임대인 직접 진행') {
                  seen.add(officeName);
                  brokers.push({ officeName, phone: c.broker.phone || '' });
                }
              }
            });
          }
        });
      }
    });
    return brokers;
  }, [buildings, user]);

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
        status: brokerFeeStatus,
        expectedPaidDate: brokerFeeStatus === 'scheduled' ? expectedPaidDate : null,
        isNotificationEnabled: brokerFeeStatus === 'scheduled' ? isNotificationEnabled : false,
        isPaid: brokerFeeStatus === 'paid',
        paidDate: brokerFeeStatus === 'paid' ? new Date().toISOString() : null
      }
    });
    // 계약 등록 후 바로 입주키트 작성으로 유도
    navigate(`/landlord/buildings/${buildingId}/units/${unitId}/kit/new`, { replace: true });
  };

  const canProceed = () => {
    switch (step) {
      case 1: return tenantName.trim().length > 0 && tenantPhone.trim().length >= 10;
      case 2: return deposit.length > 0;
      case 3: return rent.length > 0 && maintenanceFee.length > 0;
      case 4: return startDate && endDate;
      case 5: return true; // Broker info is optional
      default: return false;
    }
  };

  return (
    <div className="page">
      <TopBar 
        title="계약 등록" 
        onBack={() => {
          if (step > 1) {
            setStep(step - 1);
          } else {
            navigate(-1);
          }
        }}
      />
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
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              <div 
                onClick={() => setActiveField('rent')}
                style={{ 
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '20px 20px', 
                  borderRadius: '16px', 
                  border: activeField === 'rent' ? '2px solid var(--color-primary-600)' : '1px solid var(--color-border)',
                  background: activeField === 'rent' ? 'var(--color-primary-100)' : 'var(--color-surface)',
                  cursor: 'pointer'
                }}
              >
                <div style={{ fontSize: '24px', color: 'var(--color-text-secondary)', fontWeight: '600' }}>월세</div>
                <div style={{ fontSize: '36px', fontWeight: 'bold', color: rent ? 'var(--color-text-primary)' : 'var(--color-text-disabled)' }}>
                  {rent ? `${parseInt(rent).toLocaleString()}원` : '입력'}
                </div>
              </div>
              <div 
                onClick={() => setActiveField('maintenanceFee')}
                style={{ 
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '20px 20px', 
                  borderRadius: '16px', 
                  border: activeField === 'maintenanceFee' ? '2px solid var(--color-primary-600)' : '1px solid var(--color-border)',
                  background: activeField === 'maintenanceFee' ? 'var(--color-primary-100)' : 'var(--color-surface)',
                  cursor: 'pointer'
                }}
              >
                <div style={{ fontSize: '24px', color: 'var(--color-text-secondary)', fontWeight: '600' }}>관리비</div>
                <div style={{ fontSize: '36px', fontWeight: 'bold', color: maintenanceFee ? 'var(--color-text-primary)' : 'var(--color-text-disabled)' }}>
                  {maintenanceFee ? `${parseInt(maintenanceFee).toLocaleString()}원` : '입력'}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '22px', fontWeight: '700', marginBottom: '16px', color: 'var(--color-text-secondary)' }}>월세 납부 방식</label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={() => setRentPaymentType('prepaid')}
                  style={{ 
                    flex: 1, 
                    padding: '24px 20px', 
                    borderRadius: '12px',
                    border: rentPaymentType === 'prepaid' ? '2px solid var(--color-primary-600)' : '1px solid var(--color-border)',
                    background: rentPaymentType === 'prepaid' ? 'var(--color-primary-100)' : 'white',
                    color: rentPaymentType === 'prepaid' ? 'var(--color-primary-800)' : 'var(--color-text-primary)',
                    fontWeight: rentPaymentType === 'prepaid' ? 'bold' : '500',
                    fontSize: '22px'
                  }}
                >
                  매월 선불
                </button>
                <button 
                  onClick={() => setRentPaymentType('postpaid')}
                  style={{ 
                    flex: 1, 
                    padding: '24px 20px', 
                    borderRadius: '12px',
                    border: rentPaymentType === 'postpaid' ? '2px solid var(--color-primary-600)' : '1px solid var(--color-border)',
                    background: rentPaymentType === 'postpaid' ? 'var(--color-primary-100)' : 'white',
                    color: rentPaymentType === 'postpaid' ? 'var(--color-primary-800)' : 'var(--color-text-primary)',
                    fontWeight: rentPaymentType === 'postpaid' ? 'bold' : '500',
                    fontSize: '22px'
                  }}
                >
                  매월 후불
                </button>
              </div>
            </div>

            <NumPad
              value={activeField === 'rent' ? rent : maintenanceFee}
              onChange={activeField === 'rent' ? setRent : setMaintenanceFee}
              maxLength={10}
              placeholder={activeField === 'rent' ? '월세 입력' : '관리비 입력 (없으면 0)'}
              unit="원"
              isCurrency={true}
            />
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
                <div style={{ marginTop: '24px', padding: '24px', backgroundColor: 'var(--color-surface)', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
                  <p style={{ fontSize: '18px', color: 'var(--color-text-secondary)', marginBottom: '12px' }}>
                    💡 <strong>월세 입금일 자동 확정</strong>
                  </p>
                  <p style={{ fontSize: '22px', fontWeight: '500' }}>
                    매월 <span style={{ color: 'var(--color-primary-600)', fontSize: '28px', fontWeight: '700' }}>{parseInt(startDate.split('-')[2], 10)}</span>일 
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
              {/* 주거래 중개사 칩(버튼) 목록 */}
              <div style={{ marginBottom: '24px' }}>
                <p style={{ fontSize: '18px', fontWeight: '600', color: 'var(--color-text-secondary)', marginBottom: '12px' }}>
                  등록된 주거래 중개사 선택
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setBrokerName('임대인 직접 진행');
                      setBrokerPhone('');
                    }}
                    style={{
                      padding: '16px 20px',
                      borderRadius: '12px',
                      border: brokerName === '임대인 직접 진행' ? '2px solid var(--color-primary-600)' : '1px solid var(--color-border)',
                      background: brokerName === '임대인 직접 진행' ? 'var(--color-primary-100)' : 'var(--color-surface)',
                      color: brokerName === '임대인 직접 진행' ? 'var(--color-primary-800)' : 'var(--color-text-secondary)',
                      fontSize: '18px',
                      fontWeight: brokerName === '임대인 직접 진행' ? '700' : '500',
                      textAlign: 'left',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    임대인 직접 진행
                  </button>
                  
                  {existingBrokers.map((brk, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setBrokerName(brk.officeName);
                        setBrokerPhone(formatPhoneNumber(brk.phone || ''));
                      }}
                      style={{
                        padding: '16px 20px',
                        borderRadius: '12px',
                        border: brokerName === brk.officeName ? '2px solid var(--color-primary-600)' : '1px solid var(--color-border)',
                        background: brokerName === brk.officeName ? 'var(--color-primary-100)' : 'var(--color-surface)',
                        color: brokerName === brk.officeName ? 'var(--color-primary-800)' : 'var(--color-text-secondary)',
                        fontSize: '18px',
                        fontWeight: brokerName === brk.officeName ? '700' : '500',
                        textAlign: 'left',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <span>{brk.officeName}</span>
                      {brk.phone && (
                        <span style={{ fontSize: '15px', color: brokerName === brk.officeName ? 'var(--color-primary-600)' : 'var(--color-text-tertiary)', fontWeight: 'normal' }}>
                          {formatPhoneNumber(brk.phone)}
                        </span>
                      )}
                    </button>
                  ))}
                  
                  <button
                    type="button"
                    onClick={() => {
                      setBrokerName('');
                      setBrokerPhone('');
                    }}
                    style={{
                      padding: '16px 20px',
                      borderRadius: '12px',
                      border: brokerName !== '임대인 직접 진행' && existingBrokers.every(b => b.officeName !== brokerName) ? '2px solid var(--color-primary-600)' : '1px solid var(--color-border)',
                      background: brokerName !== '임대인 직접 진행' && existingBrokers.every(b => b.officeName !== brokerName) ? 'var(--color-primary-100)' : 'var(--color-surface)',
                      color: brokerName !== '임대인 직접 진행' && existingBrokers.every(b => b.officeName !== brokerName) ? 'var(--color-primary-800)' : 'var(--color-text-secondary)',
                      fontSize: '18px',
                      fontWeight: brokerName !== '임대인 직접 진행' && existingBrokers.every(b => b.officeName !== brokerName) ? '700' : '500',
                      textAlign: 'left',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    직접 입력
                  </button>
                </div>
              </div>

              {/* 중개사무소 이름 및 연락처 입력 (항상 표시) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input
                  className="contract-reg__input"
                  placeholder="중개사무소 이름 (선택사항)"
                  value={brokerName}
                  onChange={(e) => setBrokerName(e.target.value)}
                />
                <input
                  className="contract-reg__input"
                  type="tel"
                  placeholder="중개사 연락처 (선택사항)"
                  value={brokerPhone}
                  onChange={(e) => setBrokerPhone(formatPhoneNumber(e.target.value))}
                  maxLength={13}
                />
              </div>
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
              <div style={{ marginTop: '24px' }}>
                <label style={{ display: 'block', fontSize: '18px', fontWeight: '700', marginBottom: '12px', color: 'var(--color-text-secondary)' }}>수수료 지급 상태</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setBrokerFeeStatus('unpaid')}
                    style={{
                      flex: 1,
                      padding: '16px 12px',
                      borderRadius: '12px',
                      border: brokerFeeStatus === 'unpaid' ? '2px solid var(--color-primary-600)' : '1px solid var(--color-border)',
                      background: brokerFeeStatus === 'unpaid' ? 'var(--color-primary-100)' : 'var(--color-surface)',
                      color: brokerFeeStatus === 'unpaid' ? 'var(--color-primary-800)' : 'var(--color-text-primary)',
                      fontWeight: brokerFeeStatus === 'unpaid' ? 'bold' : '500',
                      fontSize: '18px'
                    }}
                  >
                    미지급
                  </button>
                  <button
                    type="button"
                    onClick={() => setBrokerFeeStatus('scheduled')}
                    style={{
                      flex: 1,
                      padding: '16px 12px',
                      borderRadius: '12px',
                      border: brokerFeeStatus === 'scheduled' ? '2px solid var(--color-primary-600)' : '1px solid var(--color-border)',
                      background: brokerFeeStatus === 'scheduled' ? 'var(--color-primary-100)' : 'var(--color-surface)',
                      color: brokerFeeStatus === 'scheduled' ? 'var(--color-primary-800)' : 'var(--color-text-primary)',
                      fontWeight: brokerFeeStatus === 'scheduled' ? 'bold' : '500',
                      fontSize: '18px'
                    }}
                  >
                    지급 예정
                  </button>
                  <button
                    type="button"
                    onClick={() => setBrokerFeeStatus('paid')}
                    style={{
                      flex: 1,
                      padding: '16px 12px',
                      borderRadius: '12px',
                      border: brokerFeeStatus === 'paid' ? '2px solid var(--color-primary-600)' : '1px solid var(--color-border)',
                      background: brokerFeeStatus === 'paid' ? 'var(--color-primary-100)' : 'var(--color-surface)',
                      color: brokerFeeStatus === 'paid' ? 'var(--color-primary-800)' : 'var(--color-text-primary)',
                      fontWeight: brokerFeeStatus === 'paid' ? 'bold' : '500',
                      fontSize: '18px'
                    }}
                  >
                    지급 완료
                  </button>
                </div>
              </div>

              {brokerFeeStatus === 'scheduled' && (
                <div style={{ marginTop: '16px', padding: '20px', background: 'var(--color-surface)', borderRadius: '12px', border: '1px solid var(--color-primary-200)' }}>
                  <div className="contract-reg__label-input">
                    <label>지급 예정일</label>
                    <input
                      className="contract-reg__input"
                      type="date"
                      value={expectedPaidDate}
                      onChange={(e) => setExpectedPaidDate(e.target.value)}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '16px' }}>
                    <input 
                      type="checkbox" 
                      id="isNotified" 
                      checked={isNotificationEnabled} 
                      onChange={(e) => setIsNotificationEnabled(e.target.checked)}
                      style={{ width: '24px', height: '24px', accentColor: 'var(--color-primary-600)', cursor: 'pointer' }}
                    />
                    <label htmlFor="isNotified" style={{ fontSize: '18px', fontWeight: '500', cursor: 'pointer', userSelect: 'none' }}>
                      해당 일자에 카카오톡 알림 받기
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="contract-reg__footer">
          {step === 3 && activeField === 'rent' ? (
            <Button
              variant="primary"
              disabled={!rent}
              onClick={() => setActiveField('maintenanceFee')}
            >
              다음 (관리비 입력)
            </Button>
          ) : step < totalSteps ? (
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
              다음 (입주키트 작성 및 서명요청)
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

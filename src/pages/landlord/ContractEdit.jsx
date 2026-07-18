import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import usePropertyStore from '../../stores/propertyStore';
import TopBar from '../../components/TopBar';
import Button from '../../components/Button';
import { getKoreanAmount } from '../../utils/format';
import { formatPhoneNumber } from '../../utils/formatters';
import './ContractEdit.css';

export default function ContractEdit() {
  const navigate = useNavigate();
  const { buildingId, unitId } = useParams();
  const getBuilding = usePropertyStore((s) => s.getBuilding);
  const updateContract = usePropertyStore((s) => s.updateContract);

  const [loading, setLoading] = useState(true);
  const [tenantName, setTenantName] = useState('');
  const [tenantPhone, setTenantPhone] = useState('');
  const [deposit, setDeposit] = useState('');
  const [monthlyRent, setMonthlyRent] = useState('');
  const [maintenanceFee, setMaintenanceFee] = useState('');
  const [rentPaymentType, setRentPaymentType] = useState('prepaid');
  const [contractDate, setContractDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [periodType, setPeriodType] = useState('custom');

  const [brokerName, setBrokerName] = useState('');
  const [brokerPhone, setBrokerPhone] = useState('');
  const [brokerFee, setBrokerFee] = useState('');
  const [isBrokerFeePaid, setIsBrokerFeePaid] = useState(false);

  useEffect(() => {
    const building = getBuilding(buildingId);
    const unit = building?.units?.find(u => u.id === unitId);
    const contract = unit?.contract;

    if (contract) {
      setTenantName(contract.tenantName || '');
      setTenantPhone(contract.tenantPhone || '');
      setDeposit(contract.deposit?.toString() || '');
      setMonthlyRent(contract.monthlyRent?.toString() || '');
      setMaintenanceFee(contract.maintenanceFee?.toString() || '');
      setRentPaymentType(contract.rentPaymentType || 'prepaid');
      setContractDate(contract.contractDate || '');
      setStartDate(contract.startDate || '');
      setEndDate(contract.endDate || '');
      if (contract.broker) {
        setBrokerName(contract.broker.name || '');
        setBrokerPhone(contract.broker.phone || '');
        setBrokerFee(contract.broker.fee?.toString() || '');
        setIsBrokerFeePaid(contract.broker.isPaid || false);
      }
    }
    setLoading(false);
  }, [buildingId, unitId, getBuilding]);

  const handlePeriodClick = (type) => {
    setPeriodType(type);
    if (!startDate) return;

    const start = new Date(startDate);
    let end = new Date(start);
    
    if (type === '1year') {
      end.setFullYear(start.getFullYear() + 1);
      end.setDate(end.getDate() - 1);
      setEndDate(end.toISOString().split('T')[0]);
    } else if (type === '2year') {
      end.setFullYear(start.getFullYear() + 2);
      end.setDate(end.getDate() - 1);
      setEndDate(end.toISOString().split('T')[0]);
    }
  };

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
    if (periodType !== 'custom' && e.target.value) {
      const start = new Date(e.target.value);
      let end = new Date(start);
      if (periodType === '1year') {
        end.setFullYear(start.getFullYear() + 1);
      } else if (periodType === '2year') {
        end.setFullYear(start.getFullYear() + 2);
      }
      end.setDate(end.getDate() - 1);
      setEndDate(end.toISOString().split('T')[0]);
    }
  };

  const handleSave = async () => {
    if (!tenantName || !tenantPhone || !startDate || !endDate) {
      alert('필수 정보를 모두 입력해주세요.');
      return;
    }

    await updateContract(buildingId, unitId, {
      tenantName,
      tenantPhone,
      deposit: parseInt(deposit.toString().replace(/,/g, '')) || 0,
      monthlyRent: parseInt(monthlyRent.toString().replace(/,/g, '')) || 0,
      maintenanceFee: parseInt(maintenanceFee.toString().replace(/,/g, '')) || 0,
      rentPaymentType,
      rentPaymentDay: startDate ? parseInt(startDate.split('-')[2], 10) : null,
      contractDate,
      startDate,
      endDate,
      broker: {
        name: brokerName.trim(),
        phone: brokerPhone.trim(),
        fee: parseInt(brokerFee.toString().replace(/,/g, '')) || 0,
        isPaid: isBrokerFeePaid,
        paidDate: isBrokerFeePaid ? new Date().toISOString() : null
      }
    });

    alert('계약 정보가 수정되었습니다.');
    navigate(`/landlord/buildings/${buildingId}/units/${unitId}`, { replace: true });
  };

  if (loading) return null;

  return (
    <div className="page contract-edit-page">
      <TopBar title="계약 정보 수정" />
      <div className="page-content">
        <div className="contract-edit-form">
          <div className="form-group">
            <label>임차인 이름</label>
            <input 
              type="text" 
              value={tenantName} 
              onChange={(e) => setTenantName(e.target.value)} 
              placeholder="이름 입력" 
            />
          </div>
          <div className="form-group">
            <label>연락처</label>
            <input 
              type="tel" 
              value={tenantPhone} 
              onChange={(e) => setTenantPhone(formatPhoneNumber(e.target.value))} 
              maxLength={13}
              placeholder="010-0000-0000" 
            />
          </div>
          <div className="form-group">
            <label>보증금 (원)</label>
            <input 
              type="text"
              inputMode="numeric"
              value={deposit ? parseInt(deposit.toString().replace(/,/g, '')).toLocaleString() : ''} 
              onChange={(e) => setDeposit(e.target.value.replace(/,/g, '').replace(/[^0-9]/g, ''))} 
              placeholder="예: 10,000,000"
            />
            {deposit && (
              <div className="amount-korean-helper">
                <span className="amount-korean-label">= 금</span>
                <span className="amount-korean-text">{getKoreanAmount(deposit)}</span>
              </div>
            )}
          </div>
          <div className="form-group">
            <label>월세 (원)</label>
            <input 
              type="text"
              inputMode="numeric"
              value={monthlyRent ? parseInt(monthlyRent.toString().replace(/,/g, '')).toLocaleString() : ''} 
              onChange={(e) => setMonthlyRent(e.target.value.replace(/,/g, '').replace(/[^0-9]/g, ''))} 
              placeholder="예: 500,000"
            />
            {monthlyRent && (
              <div className="amount-korean-helper">
                <span className="amount-korean-label">= 금</span>
                <span className="amount-korean-text">{getKoreanAmount(monthlyRent)}</span>
              </div>
            )}
          </div>
          <div className="form-group">
            <label>관리비 (원)</label>
            <input 
              type="text"
              inputMode="numeric"
              value={maintenanceFee ? parseInt(maintenanceFee.toString().replace(/,/g, '')).toLocaleString() : ''} 
              onChange={(e) => setMaintenanceFee(e.target.value.replace(/[^0-9]/g, ''))} 
              placeholder="예: 50,000"
            />
            {maintenanceFee && (
              <div className="amount-korean-helper">
                <span className="amount-korean-label">= 금</span>
                <span className="amount-korean-text">{getKoreanAmount(maintenanceFee)}</span>
              </div>
            )}
          </div>
          <div className="form-group">
            <label>월세 납부 방식</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                type="button"
                className={`contract-edit__period-btn ${rentPaymentType === 'prepaid' ? 'active' : ''}`}
                onClick={() => setRentPaymentType('prepaid')}
                style={{ flex: 1, padding: '12px', border: '1px solid var(--color-border)', borderRadius: '8px', backgroundColor: rentPaymentType === 'prepaid' ? 'var(--color-primary)' : 'transparent', color: rentPaymentType === 'prepaid' ? 'white' : 'var(--color-text-primary)' }}
              >
                매월 선불
              </button>
              <button 
                type="button"
                className={`contract-edit__period-btn ${rentPaymentType === 'postpaid' ? 'active' : ''}`}
                onClick={() => setRentPaymentType('postpaid')}
                style={{ flex: 1, padding: '12px', border: '1px solid var(--color-border)', borderRadius: '8px', backgroundColor: rentPaymentType === 'postpaid' ? 'var(--color-primary)' : 'transparent', color: rentPaymentType === 'postpaid' ? 'white' : 'var(--color-text-primary)' }}
              >
                매월 후불
              </button>
            </div>
          </div>
          <div className="form-group">
            <label>계약 체결일</label>
            <input 
              type="date" 
              value={contractDate} 
              onChange={(e) => setContractDate(e.target.value)} 
            />
          </div>
          <div className="form-group">
            <label>입주일 (계약 시작일)</label>
            <input 
              type="date" 
              value={startDate} 
              onChange={handleStartDateChange} 
            />
          </div>

          <div className="contract-edit-period-chips">
            <button
              type="button"
              className={`contract-edit-period-chip ${periodType === '1year' ? 'active' : ''}`}
              onClick={() => handlePeriodClick('1year')}
            >
              1년
            </button>
            <button
              type="button"
              className={`contract-edit-period-chip ${periodType === '2year' ? 'active' : ''}`}
              onClick={() => handlePeriodClick('2year')}
            >
              2년
            </button>
            <button
              type="button"
              className={`contract-edit-period-chip ${periodType === 'custom' ? 'active' : ''}`}
              onClick={() => handlePeriodClick('custom')}
            >
              직접 입력
            </button>
          </div>

          <div className="form-group">
            <label>만기일 (계약 종료일)</label>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => { setEndDate(e.target.value); setPeriodType('custom'); }} 
              readOnly={periodType !== 'custom'}
              style={periodType !== 'custom' ? { backgroundColor: 'var(--color-background)', color: 'var(--color-text-secondary)' } : {}}
            />
          </div>

          {startDate && (
            <div style={{ marginTop: '16px', padding: '16px', backgroundColor: 'var(--color-surface)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
                💡 <strong>월세 입금일</strong>
              </p>
              <p style={{ fontSize: '15px', fontWeight: '500' }}>
                매월 <span style={{ color: 'var(--color-primary-600)', fontSize: '18px', fontWeight: '700' }}>{parseInt(startDate.split('-')[2], 10)}</span>일 
                ({rentPaymentType === 'prepaid' ? '선불' : '후불'})
              </p>
            </div>
          )}
        </div>

        <div className="contract-edit-form" style={{ marginTop: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>중개사무소 정보 (선택)</h3>
          <div className="form-group">
            <label>부동산 이름</label>
            <input 
              type="text" 
              value={brokerName} 
              onChange={(e) => setBrokerName(e.target.value)} 
              placeholder="예: 황금공인중개사" 
            />
          </div>
          <div className="form-group">
            <label>중개사 연락처</label>
            <input 
              type="tel" 
              value={brokerPhone} 
              onChange={(e) => setBrokerPhone(formatPhoneNumber(e.target.value))} 
              maxLength={13}
              placeholder="010-0000-0000" 
            />
          </div>
          <div className="form-group">
            <label>중개수수료 (원)</label>
            <input 
              type="text"
              inputMode="numeric"
              value={brokerFee ? parseInt(brokerFee.toString().replace(/,/g, '')).toLocaleString() : ''} 
              onChange={(e) => setBrokerFee(e.target.value.replace(/,/g, '').replace(/[^0-9]/g, ''))} 
              placeholder="예: 300,000"
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
              id="isPaidEdit" 
              checked={isBrokerFeePaid} 
              onChange={(e) => setIsBrokerFeePaid(e.target.checked)}
              style={{ width: '20px', height: '20px', accentColor: 'var(--color-primary)' }}
            />
            <label htmlFor="isPaidEdit" style={{ fontSize: '16px', fontWeight: '500', cursor: 'pointer' }}>중개수수료 지급 완료</label>
          </div>
        </div>

        <div className="bottom-button-area">
          <Button variant="primary" onClick={handleSave}>
            저장하기
          </Button>
        </div>
      </div>
    </div>
  );
}

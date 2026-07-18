import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import TopBar from '../../components/TopBar';
import Card from '../../components/Card';

export default function LandlordProfile() {
  const navigate = useNavigate();
  const { user, updateUserProfile } = useAuthStore();
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    businessInfo: {
      isRegistered: false,
      registrationNumber: '',
      businessName: '',
    }
  });

  const [accounts, setAccounts] = useState([]);
  
  // 새 계좌 추가 폼 상태
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [newAccount, setNewAccount] = useState({ bank: '', accountNumber: '', holder: '' });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        email: user.email || '',
        businessInfo: {
          isRegistered: user.businessInfo?.isRegistered || false,
          registrationNumber: user.businessInfo?.registrationNumber || '',
          businessName: user.businessInfo?.businessName || '',
        }
      });
      setAccounts(user.accounts || []);
    }
  }, [user]);

  const handleSave = async () => {
    try {
      await updateUserProfile({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        businessInfo: formData.businessInfo,
        accounts
      });
      alert('저장되었습니다.');
      navigate(-1);
    } catch (e) {
      alert('저장 중 오류가 발생했습니다.');
      console.error(e);
    }
  };

  const handleAddAccount = () => {
    if (!newAccount.bank || !newAccount.accountNumber || !newAccount.holder) {
      alert('은행, 계좌번호, 예금주를 모두 입력해주세요.');
      return;
    }
    const isFirst = accounts.length === 0;
    const added = {
      id: Date.now().toString(),
      ...newAccount,
      isDefault: isFirst // 첫 계좌면 기본으로
    };
    setAccounts([...accounts, added]);
    setIsAddingAccount(false);
    setNewAccount({ bank: '', accountNumber: '', holder: '' });
  };

  const handleRemoveAccount = (id) => {
    const updated = accounts.filter(a => a.id !== id);
    // 기본 계좌가 삭제되었으면 남은 것 중 첫번째를 기본으로 설정
    if (updated.length > 0 && !updated.some(a => a.isDefault)) {
      updated[0].isDefault = true;
    }
    setAccounts(updated);
  };

  const handleSetDefaultAccount = (id) => {
    const updated = accounts.map(a => ({
      ...a,
      isDefault: a.id === id
    }));
    setAccounts(updated);
  };

  const inputStyle = {
    width: '100%', padding: '12px', border: '1px solid var(--color-border)', 
    borderRadius: '12px', fontSize: '16px', boxSizing: 'border-box'
  };

  const labelStyle = {
    display: 'block', fontSize: '14px', fontWeight: 'bold', color: 'var(--color-text-primary)', marginBottom: '8px'
  };

  const groupStyle = { marginBottom: '20px' };

  return (
    <div className="page" style={{ paddingBottom: '100px' }}>
      <TopBar title="내 정보 관리" showBack onBack={() => navigate(-1)} />
      
      <div className="page-content">
        
        {/* 1. 기본 정보 */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>기본 정보</h2>
          
          <div style={groupStyle}>
            <label style={labelStyle}>이름</label>
            <input 
              style={inputStyle} 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="이름을 입력하세요"
            />
          </div>
          
          <div style={groupStyle}>
            <label style={labelStyle}>연락처</label>
            <input 
              style={inputStyle} 
              value={formData.phone} 
              onChange={e => setFormData({...formData, phone: e.target.value})}
              placeholder="숫자만 입력 (- 제외)"
              type="tel"
            />
          </div>

          <div style={groupStyle}>
            <label style={labelStyle}>이메일 (선택)</label>
            <input 
              style={inputStyle} 
              value={formData.email} 
              onChange={e => setFormData({...formData, email: e.target.value})}
              placeholder="example@email.com"
              type="email"
            />
          </div>
        </div>

        {/* 2. 수납 계좌 관리 */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>수납 계좌 관리</h2>
          </div>

          {accounts.map(acc => (
            <Card key={acc.id} style={{ marginBottom: '12px', padding: '16px', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>{acc.bank}</span>
                    {acc.isDefault && (
                      <span style={{ background: 'var(--color-primary-100)', color: 'var(--color-primary-600)', fontSize: '12px', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                        기본계좌
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>{acc.accountNumber}</div>
                  <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>예금주: {acc.holder}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {!acc.isDefault && (
                    <button 
                      onClick={() => handleSetDefaultAccount(acc.id)}
                      style={{ background: 'transparent', border: '1px solid var(--color-border)', borderRadius: '4px', padding: '4px 8px', fontSize: '12px', cursor: 'pointer' }}
                    >
                      기본 설정
                    </button>
                  )}
                  <button 
                    onClick={() => handleRemoveAccount(acc.id)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--color-danger-600)', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    삭제
                  </button>
                </div>
              </div>
            </Card>
          ))}

          {isAddingAccount ? (
            <Card style={{ padding: '16px', background: 'var(--color-bg-base)' }}>
              <div style={{ ...groupStyle, marginBottom: '12px' }}>
                <label style={labelStyle}>은행명</label>
                <input 
                  style={{ ...inputStyle, background: 'white' }} 
                  value={newAccount.bank} 
                  onChange={e => setNewAccount({...newAccount, bank: e.target.value})}
                  placeholder="예: 신한은행"
                />
              </div>
              <div style={{ ...groupStyle, marginBottom: '12px' }}>
                <label style={labelStyle}>계좌번호</label>
                <input 
                  style={{ ...inputStyle, background: 'white' }} 
                  value={newAccount.accountNumber} 
                  onChange={e => setNewAccount({...newAccount, accountNumber: e.target.value})}
                  placeholder="'-' 없이 입력"
                  type="number"
                />
              </div>
              <div style={{ ...groupStyle, marginBottom: '16px' }}>
                <label style={labelStyle}>예금주</label>
                <input 
                  style={{ ...inputStyle, background: 'white' }} 
                  value={newAccount.holder} 
                  onChange={e => setNewAccount({...newAccount, holder: e.target.value})}
                  placeholder="예금주 성명"
                />
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => setIsAddingAccount(false)}
                  style={{ flex: 1, padding: '12px', background: 'white', border: '1px solid var(--color-border)', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                >취소</button>
                <button 
                  onClick={handleAddAccount}
                  style={{ flex: 1, padding: '12px', background: 'var(--color-primary-600)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                >등록</button>
              </div>
            </Card>
          ) : (
            <button 
              onClick={() => setIsAddingAccount(true)}
              style={{ width: '100%', padding: '12px', background: 'white', border: '1px dashed var(--color-border)', borderRadius: '12px', color: 'var(--color-text-secondary)', fontWeight: 'bold', cursor: 'pointer' }}
            >
              + 새 수납 계좌 추가
            </button>
          )}
        </div>

        {/* 3. 사업자 정보 */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <input 
              type="checkbox" 
              id="businessCheck"
              checked={formData.businessInfo.isRegistered}
              onChange={e => setFormData({
                ...formData, 
                businessInfo: { ...formData.businessInfo, isRegistered: e.target.checked }
              })}
              style={{ width: '24px', height: '24px', cursor: 'pointer' }}
            />
            <label htmlFor="businessCheck" style={{ fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' }}>
              사업자 정보 등록하기
            </label>
          </div>

          {formData.businessInfo.isRegistered && (
            <div style={{ padding: '20px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px' }}>
              <div style={groupStyle}>
                <label style={labelStyle}>사업자 등록번호</label>
                <input 
                  style={inputStyle} 
                  value={formData.businessInfo.registrationNumber} 
                  onChange={e => setFormData({...formData, businessInfo: { ...formData.businessInfo, registrationNumber: e.target.value }})}
                  placeholder="'-' 없이 입력"
                />
              </div>
              <div style={{ marginBottom: 0 }}>
                <label style={labelStyle}>상호명(법인명)</label>
                <input 
                  style={inputStyle} 
                  value={formData.businessInfo.businessName} 
                  onChange={e => setFormData({...formData, businessInfo: { ...formData.businessInfo, businessName: e.target.value }})}
                  placeholder="예: 100집 주식회사"
                />
              </div>
            </div>
          )}
        </div>

      </div>

      {/* 하단 저장 버튼 */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '16px 24px', background: 'white', borderTop: '1px solid var(--color-border)', zIndex: 10 }}>
        <button 
          onClick={handleSave}
          style={{ width: '100%', padding: '16px', background: 'var(--color-primary-600)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          저장하기
        </button>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../../components/TopBar';
import Button from '../../components/Button';
import useAuthStore from '../../stores/authStore';
import { formatPhoneNumber } from '../../utils/formatters';
import { db } from '../../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function LandlordBrokerManage() {
  const navigate = useNavigate();
  const { user, updateUserProfile } = useAuthStore();
  const [brokers, setBrokers] = useState(user?.brokers || []);
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [formKey, setFormKey] = useState(0);

  const isFormValid = name.trim() && phone.trim().length >= 10;

  const handleAdd = async () => {
    if (!isFormValid) return;
    
    const cleanPhone = phone.replace(/-/g, '');
    
    // Firestore에서 해당 전화번호로 가입된 중개사의 officeId 자동 조회
    let foundOfficeId = null;
    let foundOfficeName = null;
    try {
      const usersQuery = query(
        collection(db, 'users'),
        where('phone', '==', cleanPhone),
        where('role', '==', 'broker')
      );
      const snap = await getDocs(usersQuery);
      if (!snap.empty) {
        const brokerUser = snap.docs[0].data();
        foundOfficeId = brokerUser.officeId || null;
        foundOfficeName = brokerUser.officeName || null;
      }
    } catch (err) {
      console.warn('중개사 officeId 조회 실패 (무시 가능):', err);
    }

    const newBroker = {
      id: Date.now().toString(),
      name: name.trim(),
      phone: cleanPhone,
      ...(foundOfficeId && { officeId: foundOfficeId }),
      ...(foundOfficeName && { officeName: foundOfficeName }),
    };
    
    const newBrokers = [...brokers, newBroker];
    setBrokers(newBrokers);
    updateUserProfile({ brokers: newBrokers });
    
    if (foundOfficeId) {
      alert(`✅ '${name.trim()}' 중개사가 100ZIP 앱에 등록된 중개사무소로 확인되었습니다!\n매물 내놓기 시 자동 연동됩니다.`);
    }
    
    setName('');
    setPhone('');
    setIsAdding(false);
    setFormKey(prev => prev + 1);
  };

  const handleRemove = (brokerId) => {
    if (window.confirm('이 중개사를 주거래 목록에서 삭제하시겠습니까?')) {
      const newBrokers = brokers.filter(b => b.id !== brokerId);
      setBrokers(newBrokers);
      updateUserProfile({ brokers: newBrokers });
    }
  };

  return (
    <div className="page">
      <TopBar title="주거래 중개사 관리" />
      <div className="page-content" style={{ paddingBottom: '80px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '900', margin: '0 0 16px 0', color: 'var(--color-text-primary)', wordBreak: 'keep-all' }}>
            주거래 중개사 파트너 🤝
          </h1>
          <p style={{ fontSize: '26px', fontWeight: '700', color: 'var(--color-text-secondary)', margin: 0, lineHeight: '1.5', wordBreak: 'keep-all', letterSpacing: '-0.5px' }}>
            나의 건물 공실을 전담해서 해결해 줄 중개사들을 등록하세요.
          </p>
        </div>

        {brokers.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
            {brokers.map((broker, idx) => (
              <div key={broker.id || idx} style={{
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-text-primary)', marginBottom: '6px' }}>
                    {broker.name}
                  </div>
                  <div style={{ fontSize: '20px', color: 'var(--color-text-secondary)' }}>
                    {formatPhoneNumber(broker.phone)}
                  </div>
                </div>
                <button 
                  onClick={() => handleRemove(broker.id)}
                  style={{
                    padding: '12px 18px',
                    borderRadius: '8px',
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-danger)',
                    color: 'var(--color-danger)',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  삭제
                </button>
              </div>
            ))}
          </div>
        )}

        {!isAdding ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <button 
              onClick={() => setIsAdding(true)}
              style={{ width: '100%', padding: '20px', background: 'var(--color-primary-100)', border: '2px dashed var(--color-primary-900)', borderRadius: '12px', color: 'var(--color-primary-900)', fontWeight: '900', cursor: 'pointer', fontSize: '22px' }}
            >
              {brokers.length > 0 ? '+ 주거래 중개사 추가하기' : '+ 주거래 중개사 등록하기'}
            </button>
            {brokers.length > 0 && (
              <Button 
                variant="primary" 
                fullWidth 
                onClick={() => navigate('/landlord/home')}
                style={{ padding: '20px', fontSize: '22px', fontWeight: 'bold' }}
              >
                완료 (홈으로 돌아가기)
              </Button>
            )}
          </div>
        ) : (
          <div style={{
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid var(--color-primary)',
            background: 'var(--color-primary-50)'
          }}>
            <h3 style={{ fontSize: '26px', fontWeight: 'bold', margin: '0 0 24px 0', color: 'var(--color-primary-700)' }}>
              새 중개사 등록
            </h3>
            
            <div key={formKey} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '22px', fontWeight: '600', marginBottom: '10px', color: 'var(--color-text-secondary)' }}>
                  상호명
                </label>
                <input
                  id="new-broker-name-field"
                  name="new-broker-name-field"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="new-password"
                  style={{
                    width: '100%',
                    padding: '18px',
                    borderRadius: '8px',
                    border: '2px solid var(--color-border)',
                    fontSize: '22px'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '22px', fontWeight: '600', marginBottom: '10px', color: 'var(--color-text-secondary)' }}>
                  연락처
                </label>
                <input
                  id="new-broker-phone-field"
                  name="new-broker-phone-field"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
                  autoComplete="new-password"
                  style={{
                    width: '100%',
                    padding: '18px',
                    borderRadius: '8px',
                    border: '2px solid var(--color-border)',
                    fontSize: '22px'
                  }}
                />
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <Button variant="secondary" fullWidth onClick={() => {
                setIsAdding(false);
                setName('');
                setPhone('');
              }}>
                취소
              </Button>
              <Button variant="primary" fullWidth disabled={!isFormValid} onClick={handleAdd}>
                저장
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

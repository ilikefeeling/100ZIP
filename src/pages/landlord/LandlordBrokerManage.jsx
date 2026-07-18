import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../../components/TopBar';
import Button from '../../components/Button';
import useAuthStore from '../../stores/authStore';
import { formatPhoneNumber } from '../../utils/formatters';

export default function LandlordBrokerManage() {
  const navigate = useNavigate();
  const { user, login } = useAuthStore();
  const [brokers, setBrokers] = useState(user?.brokers || []);
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const isFormValid = name.trim() && phone.trim().length >= 10;

  const handleAdd = () => {
    if (!isFormValid) return;
    const newBroker = {
      id: Date.now().toString(),
      name: name.trim(),
      phone: phone.replace(/-/g, '')
    };
    
    const newBrokers = [...brokers, newBroker];
    setBrokers(newBrokers);
    login({ ...user, brokers: newBrokers });
    
    setName('');
    setPhone('');
    setIsAdding(false);
  };

  const handleRemove = (brokerId) => {
    if (window.confirm('이 중개사를 주거래 목록에서 삭제하시겠습니까?')) {
      const newBrokers = brokers.filter(b => b.id !== brokerId);
      setBrokers(newBrokers);
      login({ ...user, brokers: newBrokers });
    }
  };

  return (
    <div className="page">
      <TopBar title="주거래 중개사 관리" />
      <div className="page-content" style={{ paddingBottom: '80px' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 8px 0', color: 'var(--color-text-primary)' }}>
            주거래 중개사 파트너 🤝
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', margin: 0, lineHeight: '1.5' }}>
            나의 건물 공실을 전담해서 해결해 줄 중개사들을 등록하세요.
          </p>
        </div>

        {brokers.length > 0 ? (
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
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                    {broker.name}
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                    {formatPhoneNumber(broker.phone)}
                  </div>
                </div>
                <button 
                  onClick={() => handleRemove(broker.id)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-danger)',
                    color: 'var(--color-danger)',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  삭제
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            padding: '40px 20px',
            textAlign: 'center',
            background: 'var(--color-surface)',
            borderRadius: '12px',
            border: '1px solid var(--color-border)',
            marginBottom: '24px'
          }}>
            <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
              등록된 주거래 중개사가 없습니다.
            </p>
          </div>
        )}

        {!isAdding ? (
          <Button variant="outline" fullWidth onClick={() => setIsAdding(true)}>
            + 중개사 파트너 추가하기
          </Button>
        ) : (
          <div style={{
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid var(--color-primary)',
            background: 'var(--color-primary-50)'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 16px 0', color: 'var(--color-primary-700)' }}>
              새 중개사 등록
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--color-text-secondary)' }}>
                  상호명
                </label>
                <input
                  type="text"
                  placeholder="예: 100부동산"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border)',
                    fontSize: '15px'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--color-text-secondary)' }}>
                  연락처
                </label>
                <input
                  type="tel"
                  placeholder="010-0000-0000"
                  value={phone}
                  onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border)',
                    fontSize: '15px'
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

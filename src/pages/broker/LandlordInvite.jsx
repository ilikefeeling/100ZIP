import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../../components/TopBar';
import Button from '../../components/Button';
import { formatPhoneNumber } from '../../utils/formatters';

export default function LandlordInvite() {
  const navigate = useNavigate();
  const [address, setAddress] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const isFormValid = address.trim() && name.trim() && phone.trim().length >= 10;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    if (window.confirm(`'${name}' 임대인님께 100ZIP 공실 관리 초대 알림톡을 발송하시겠습니까?`)) {
      alert('초대 알림톡이 성공적으로 발송되었습니다!\n임대인이 가입을 완료하면 매물 리스트에 추가됩니다.');
      navigate(-1);
    }
  };

  return (
    <div className="page">
      <TopBar title="주거래 건물주 등록" />
      <div className="page-content" style={{ paddingBottom: '80px' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 8px 0', color: 'var(--color-text-primary)' }}>
            매물을 확보하세요 🤝
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', margin: 0, lineHeight: '1.5' }}>
            자주 거래하는 건물주(임대인)를 등록하면, 공실이 났을 때 가장 먼저 알림을 받을 수 있습니다.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>건물 주소</label>
            <input
              style={{
                width: '100%',
                padding: '16px',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                fontSize: '16px',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text-primary)'
              }}
              type="text"
              placeholder="예: 서울시 강남구 역삼동 123-45"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>임대인(건물주) 이름</label>
            <input
              style={{
                width: '100%',
                padding: '16px',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                fontSize: '16px',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text-primary)'
              }}
              type="text"
              placeholder="예: 홍길동"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>임대인 연락처</label>
            <input
              style={{
                width: '100%',
                padding: '16px',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                fontSize: '16px',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text-primary)'
              }}
              type="tel"
              placeholder="010-0000-0000"
              value={phone}
              onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
            />
          </div>

          <div style={{ marginTop: '32px' }}>
            <Button 
              type="submit" 
              variant="primary" 
              fullWidth 
              disabled={!isFormValid}
            >
              초대 알림톡 발송하기
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

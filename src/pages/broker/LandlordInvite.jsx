import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../../components/TopBar';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { formatPhoneNumber } from '../../utils/formatters';
import useBrokerStore from '../../stores/brokerStore';

/**
 * AGT-003 임대인 초대 (기획서 기준 재설계)
 * 
 * 핵심: 중개사 고유 초대링크 생성 → 카카오톡/문자 발송 → 임대인 가입 시 자동 락인
 */
export default function LandlordInvite() {
  const navigate = useNavigate();
  const { office, addClient } = useBrokerStore();
  const [showManualForm, setShowManualForm] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [copied, setCopied] = useState(false);

  // 초대링크 생성 (officeId 기반)
  const inviteUrl = office 
    ? `${window.location.origin}/invite/broker/${office.id}` 
    : '';

  const isFormValid = name.trim() && phone.trim().length >= 10;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 클립보드 API 미지원 시 폴백
      const textArea = document.createElement('textarea');
      textArea.value = inviteUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleKakaoShare = () => {
    // 카카오톡 공유 (Kakao SDK 사용)
    if (window.Kakao && window.Kakao.isInitialized()) {
      window.Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: `${office?.name || '중개사'}에서 초대합니다`,
          description: '100집(100ZIP)에서 건물 관리를 시작하세요! 공실 관리, 전자서명 계약, 입주키트까지 모두 무료!',
          imageUrl: `${window.location.origin}/icon.png`,
          link: { mobileWebUrl: inviteUrl, webUrl: inviteUrl }
        },
        buttons: [{
          title: '무료로 시작하기',
          link: { mobileWebUrl: inviteUrl, webUrl: inviteUrl }
        }]
      });
    } else {
      // Kakao SDK 미초기화 시 URL 공유로 대체
      window.open(`https://sharer.kakao.com/talk/friends/picker/link?url=${encodeURIComponent(inviteUrl)}`, '_blank');
    }
  };

  const handleSmsShare = () => {
    const message = `[100집 건물관리 초대]\n\n${office?.name || '중개사'}에서 귀하를 VIP 임대인으로 초대합니다.\n\n아래 링크를 눌러 무료로 시작하세요:\n${inviteUrl}`;
    window.location.href = `sms:?body=${encodeURIComponent(message)}`;
  };

  const handleManualAdd = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    if (window.confirm(`'${name}' 임대인님을 장부에 직접 등록하시겠습니까?`)) {
      try {
        await addClient({ name: name.trim(), phone: phone.trim() });
        alert('임대인이 장부에 등록되었습니다.');
        setName('');
        setPhone('');
        setShowManualForm(false);
      } catch (error) {
        console.error('임대인 등록 실패:', error);
        alert('등록 중 오류가 발생했습니다.');
      }
    }
  };

  return (
    <div className="page" style={{ background: '#f8fafc' }}>
      <TopBar title="임대인 초대" showBack />
      <div className="page-content" style={{ padding: '24px', paddingBottom: '100px', maxWidth: '600px', margin: '0 auto' }}>
        
        {/* 헤더 */}
        <div style={{ textAlign: 'center', margin: '24px 0 32px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔗</div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 12px 0', color: 'var(--color-text-primary)' }}>
            초대링크로 임대인 확보하기
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', margin: 0, lineHeight: '1.6' }}>
            아래 초대링크를 건물주에게 보내면,<br/>
            <strong>가입과 동시에 나의 주거래 임대인으로 자동 등록</strong>됩니다.
          </p>
        </div>

        {/* 초대링크 카드 */}
        <Card style={{ padding: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', borderRadius: '16px', marginBottom: '16px' }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-text-secondary)', marginBottom: '12px' }}>
            나의 초대링크
          </div>
          <div style={{
            padding: '14px 16px',
            background: 'var(--color-bg-secondary)',
            borderRadius: '10px',
            fontSize: '14px',
            color: 'var(--color-primary-600)',
            wordBreak: 'break-all',
            marginBottom: '16px',
            fontFamily: 'monospace',
            border: '1px solid var(--color-border)'
          }}>
            {inviteUrl || '사무소 정보를 불러오는 중...'}
          </div>
          <Button 
            variant="primary" 
            fullWidth 
            onClick={handleCopyLink}
            style={{ padding: '14px', fontSize: '16px', borderRadius: '10px', marginBottom: '12px' }}
          >
            {copied ? '✅ 복사 완료!' : '📋 초대링크 복사하기'}
          </Button>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <Button 
              variant="secondary" 
              fullWidth 
              onClick={handleKakaoShare}
              style={{ padding: '14px', fontSize: '15px', borderRadius: '10px', background: '#FEE500', color: '#000', border: 'none', fontWeight: 'bold' }}
            >
              💬 카카오톡 보내기
            </Button>
            <Button 
              variant="secondary" 
              fullWidth 
              onClick={handleSmsShare}
              style={{ padding: '14px', fontSize: '15px', borderRadius: '10px' }}
            >
              📱 문자 보내기
            </Button>
          </div>
        </Card>

        {/* 안내 문구 */}
        <div style={{ 
          padding: '16px', borderRadius: '12px', 
          background: 'var(--color-primary-50)', 
          marginBottom: '32px',
          fontSize: '14px', color: 'var(--color-primary-700)', lineHeight: 1.6
        }}>
          💡 <strong>이렇게 활용하세요!</strong><br/>
          명함 뒷면에 QR코드를 인쇄하거나, 카카오톡 단체방에<br/>
          초대링크를 공유하면 건물주 확보가 훨씬 쉬워집니다.
        </div>

        {/* 구분선 + 직접 등록 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
          <span style={{ fontSize: '13px', color: 'var(--color-text-tertiary)', whiteSpace: 'nowrap' }}>또는 직접 등록</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
        </div>

        {!showManualForm ? (
          <button 
            onClick={() => setShowManualForm(true)}
            style={{ 
              width: '100%', padding: '16px', 
              background: 'transparent', 
              border: '1.5px dashed var(--color-border)', 
              borderRadius: '12px', 
              color: 'var(--color-text-secondary)', 
              fontWeight: '600', fontSize: '15px',
              cursor: 'pointer' 
            }}
          >
            + 이름/전화번호로 직접 등록하기
          </button>
        ) : (
          <Card style={{ padding: '24px', borderRadius: '16px' }}>
            <form onSubmit={handleManualAdd} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: 'var(--color-text-primary)' }}>임대인 이름</label>
                <input type="text" placeholder="예: 홍길동" value={name} onChange={e => setName(e.target.value)}
                  style={{ width: '100%', padding: '14px', border: '1.5px solid var(--color-border)', borderRadius: '10px', fontSize: '16px', background: 'var(--color-surface)' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: 'var(--color-text-primary)' }}>연락처</label>
                <input type="tel" placeholder="010-0000-0000" value={phone} onChange={e => setPhone(formatPhoneNumber(e.target.value))}
                  style={{ width: '100%', padding: '14px', border: '1.5px solid var(--color-border)', borderRadius: '10px', fontSize: '16px', background: 'var(--color-surface)' }} />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <Button variant="secondary" fullWidth onClick={() => { setShowManualForm(false); setName(''); setPhone(''); }}>취소</Button>
                <Button type="submit" variant="primary" fullWidth disabled={!isFormValid}>등록하기</Button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}

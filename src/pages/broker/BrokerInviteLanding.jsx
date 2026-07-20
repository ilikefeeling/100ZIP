import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TopBar from '../../components/TopBar';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';
import useAuthStore from '../../stores/authStore';

/**
 * 중개사 초대링크 랜딩 페이지
 * URL: /invite/broker/:officeId
 * 
 * 임대인이 이 링크로 진입하면:
 * 1. 이미 로그인 상태 → 즉시 해당 중개사를 주거래 중개사로 등록(락인)
 * 2. 비로그인 상태 → 중개사 정보를 보여주고, "가입하기" 버튼 → 로그인 후 자동 락인
 */
export default function BrokerInviteLanding() {
  const { officeId } = useParams();
  const navigate = useNavigate();
  const { user, isLoggedIn, isAuthReady, updateUserProfile } = useAuthStore();
  const [officeInfo, setOfficeInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [linked, setLinked] = useState(false);

  // 중개사 사무소 정보 로드
  useEffect(() => {
    const loadOffice = async () => {
      try {
        const officeDoc = await getDoc(doc(db, 'brokerOffices', officeId));
        if (officeDoc.exists()) {
          setOfficeInfo({ id: officeDoc.id, ...officeDoc.data() });
        }
      } catch (err) {
        console.error('사무소 정보 조회 실패:', err);
      } finally {
        setLoading(false);
      }
    };
    if (officeId) loadOffice();
  }, [officeId]);

  // 로그인된 임대인이면 자동 락인
  useEffect(() => {
    if (!isAuthReady || !officeInfo || linked) return;
    if (isLoggedIn && user && user.role === 'landlord') {
      handleAutoLink();
    }
  }, [isAuthReady, isLoggedIn, user, officeInfo, linked]);

  const handleAutoLink = async () => {
    if (!user || !officeInfo) return;
    
    const existingBrokers = user.brokers || [];
    const alreadyLinked = existingBrokers.some(b => b.officeId === officeId);
    
    if (alreadyLinked) {
      setLinked(true);
      return;
    }

    const newBroker = {
      id: Date.now().toString(),
      name: officeInfo.name || '중개사무소',
      phone: '',
      officeId: officeId,
      officeName: officeInfo.name || '',
    };

    const updatedBrokers = [...existingBrokers, newBroker];
    await updateUserProfile({ brokers: updatedBrokers });
    setLinked(true);
  };

  const handleGoLogin = () => {
    sessionStorage.setItem('pendingBrokerOfficeId', officeId);
    sessionStorage.setItem('pendingBrokerOfficeName', officeInfo?.name || '');
    navigate('/auth/login', { state: { role: 'landlord' } });
  };

  if (loading) {
    return (
      <div className="page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <p>중개사 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (!officeInfo) {
    return (
      <div className="page">
        <TopBar title="초대링크 오류" />
        <div className="page-content" style={{ textAlign: 'center', padding: '60px 24px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
          <h2 style={{ fontSize: '20px', marginBottom: '12px', color: 'var(--color-text-primary)' }}>유효하지 않은 초대링크입니다</h2>
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>초대링크가 만료되었거나 잘못된 링크입니다.<br/>중개사에게 다시 요청해 주세요.</p>
          <Button variant="primary" onClick={() => navigate('/role-select')} style={{ marginTop: '24px' }}>홈으로 이동</Button>
        </div>
      </div>
    );
  }

  if (linked) {
    return (
      <div className="page">
        <TopBar title="연결 완료" />
        <div className="page-content" style={{ textAlign: 'center', padding: '60px 24px' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🤝</div>
          <h2 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--color-text-primary)' }}>주거래 중개사 등록 완료!</h2>
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '32px' }}>
            <strong style={{ color: 'var(--color-primary-600)' }}>{officeInfo.name}</strong> 중개사무소가<br/>나의 주거래 중개사로 등록되었습니다.<br/><br/>
            이제 공실이 발생하면 이 중개사에게<br/>한 번의 버튼으로 매물을 내놓을 수 있습니다!
          </p>
          <Button variant="primary" fullWidth onClick={() => navigate('/landlord/home')} style={{ padding: '16px', fontSize: '16px' }}>내 건물 관리로 이동</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="page" style={{ background: '#f8fafc' }}>
      <TopBar title="주거래 중개사 초대" />
      <div className="page-content" style={{ padding: '24px', maxWidth: '500px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginTop: '40px', marginBottom: '40px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #1E3A5F, #16283F)', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 20px', boxShadow: '0 8px 24px rgba(30, 58, 95, 0.3)' }}>
            <span style={{ fontSize: '36px' }}>🏢</span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 8px 0', color: 'var(--color-text-primary)' }}>{officeInfo.name}</h1>
          <p style={{ color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.6 }}>이 중개사무소가 귀하를 <strong>VIP 임대인</strong>으로 초대했습니다.</p>
        </div>

        <Card style={{ padding: '24px', borderRadius: '16px', marginBottom: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 16px 0', color: 'var(--color-text-primary)' }}>주거래 중개사로 등록하면?</h3>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <li style={{ fontSize: '15px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>✅ 공실 발생 시 <strong>원클릭</strong>으로 이 중개사에게 매물 의뢰</li>
            <li style={{ fontSize: '15px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>✅ 계약 만기 전 <strong>선제적 안내</strong>를 받을 수 있습니다</li>
            <li style={{ fontSize: '15px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>✅ 전자서명 계약, 입주키트 등 <strong>건물 관리 전 기능</strong> 무료 이용</li>
          </ul>
        </Card>

        <Button variant="primary" fullWidth onClick={handleGoLogin} style={{ padding: '18px', fontSize: '18px', borderRadius: '12px', boxShadow: '0 4px 16px rgba(22, 40, 63, 0.25)' }}>
          💬 카카오로 3초 만에 시작하기
        </Button>
        <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: 'var(--color-text-tertiary)' }}>이미 100집 계정이 있다면 로그인 후 자동으로 연결됩니다.</p>
      </div>
    </div>
  );
}

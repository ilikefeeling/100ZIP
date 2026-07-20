import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../../firebase';
import { doc, getDoc, collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import TopBar from '../../components/TopBar';
import Card from '../../components/Card';
import Button from '../../components/Button';
import useAuthStore from '../../stores/authStore';

export default function BrokerInviteAccept() {
  const { brokerId } = useParams();
  const navigate = useNavigate();
  const { user, updateUserProfile } = useAuthStore();
  const [brokerInfo, setBrokerInfo] = useState(null);

  useEffect(() => {
    const fetchBroker = async () => {
      try {
        const docRef = doc(db, 'brokerOffices', brokerId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setBrokerInfo({
            id: brokerId,
            officeId: brokerId,
            businessName: data.name,
            name: data.representative,
            phone: data.phone,
            address: data.address
          });
        } else {
          alert('존재하지 않거나 유효하지 않은 초대 링크입니다.');
          navigate('/landlord/home', { replace: true });
        }
      } catch (error) {
        console.error('초대 정보 불러오기 실패:', error);
      }
    };
    if (brokerId) fetchBroker();
  }, [brokerId, navigate]);

  const handleAccept = async () => {
    if (!user) {
      alert('로그인이 필요합니다.');
      navigate('/role-select');
      return;
    }

    try {
      // 기존 주거래 중개사 목록에 추가 (중복 체크)
      const currentBrokers = user.brokers || [];
      const isAlreadyAdded = currentBrokers.find(b => b.id === brokerInfo.id);
      
      if (!isAlreadyAdded) {
        const updatedBrokers = [...currentBrokers, brokerInfo];
        await updateUserProfile({ brokers: updatedBrokers });

        // 중개사 장부(brokerClients)에도 임대인 정보 추가
        // 중복 등록 방지를 위해 기존 등록 여부 확인
        const q = query(
          collection(db, 'brokerClients'),
          where('officeId', '==', brokerInfo.officeId),
          where('landlordPhone', '==', user.phone)
        );
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          await addDoc(collection(db, 'brokerClients'), {
            officeId: brokerInfo.officeId,
            landlordName: user.name || '',
            landlordPhone: user.phone || '',
            landlordId: user.uid,
            status: 'active',
            registeredAt: new Date().toISOString(),
            importedFromExcel: false
          });
        }
      }
      
      alert(`[${brokerInfo.businessName}] 중개사가 나의 전담 중개사로 확정되었습니다.\n이제 탭 한 번으로 쉽게 방을 내놓을 수 있습니다!`);
      navigate('/landlord/home', { replace: true });
      
    } catch (error) {
      console.error(error);
      alert('중개사 확정 처리 중 오류가 발생했습니다.');
    }
  };

  if (!brokerInfo) {
    return <div className="page"><TopBar title="중개사 초대 확인" /><div className="page-content">로딩 중...</div></div>;
  }

  return (
    <div className="page" style={{ background: '#f8fafc' }}>
      <TopBar title="주거래 중개사 초대" showBack onBack={() => navigate('/landlord/home')} />
      <div className="page-content" style={{ padding: '24px', paddingBottom: '100px', maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        
        <div style={{ textAlign: 'center', margin: '32px 0' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤝</div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 12px 0', color: 'var(--color-text-primary)' }}>
            주거래 중개사 초대
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', margin: 0, lineHeight: '1.6' }}>
            아래 중개사를 나의 전담 주거래 중개사로 확정하고,<br/>
            공실 관리와 임대 소통을 더 편리하게 진행하세요.
          </p>
        </div>

        <Card style={{ padding: '32px 24px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderRadius: '16px', marginBottom: '32px' }}>
          <div style={{ textAlign: 'center', paddingBottom: '24px', borderBottom: '1px solid var(--color-border)', marginBottom: '24px' }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--color-text-primary)', marginBottom: '8px' }}>
              {brokerInfo.businessName}
            </div>
            <div style={{ fontSize: '15px', color: 'var(--color-text-secondary)' }}>
              대표 {brokerInfo.name}
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--color-text-tertiary)', fontSize: '15px' }}>연락처</span>
              <span style={{ color: 'var(--color-text-primary)', fontWeight: '600', fontSize: '15px' }}>{brokerInfo.phone}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ color: 'var(--color-text-tertiary)', fontSize: '15px', flexShrink: 0, marginRight: '16px' }}>사무소 주소</span>
              <span style={{ color: 'var(--color-text-primary)', fontWeight: '500', fontSize: '15px', textAlign: 'right', wordBreak: 'keep-all', lineHeight: '1.4' }}>{brokerInfo.address}</span>
            </div>
          </div>
        </Card>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Button variant="primary" fullWidth style={{ padding: '16px', fontSize: '16px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(22, 40, 63, 0.2)' }} onClick={handleAccept}>
            나의 주거래 중개사로 확정하기
          </Button>
          <Button variant="secondary" fullWidth style={{ padding: '16px', fontSize: '16px', borderRadius: '12px', border: 'none', background: '#e2e8f0', color: '#475569' }} onClick={() => navigate('/landlord/home')}>
            다음에 하기
          </Button>
        </div>

      </div>
    </div>
  );
}

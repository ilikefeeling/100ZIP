import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../../components/TopBar';
import Button from '../../components/Button';
import Card from '../../components/Card';
import useAuthStore from '../../stores/authStore';
import useBrokerStore from '../../stores/brokerStore';

export default function BrokerRegister() {
  const navigate = useNavigate();
  const { user, updateUserProfile } = useAuthStore();
  const { createOffice } = useBrokerStore();
  const [businessNum, setBusinessNum] = useState('');
  const [officeName, setOfficeName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // 이미 인증된 경우 홈으로 이동
    if (user?.isBrokerVerified) {
      navigate('/broker/home', { replace: true });
    }
  }, [user, navigate]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!businessNum || !officeName) {
      alert('모든 항목을 입력해주세요.');
      return;
    }

    setIsLoading(true);

    // TODO: [LAUNCH] 서비스 출시 시 공공데이터포털 국세청 사업자등록상태조회 API 연동으로 교체 필수
    // 현재는 테스트 환경을 위해 무조건 승인 처리하는 Mock 로직
    setTimeout(async () => {
      try {
        // 1. Firestore에 brokerOffices 문서 생성 + users 문서에 officeId 기록
        const officeId = await createOffice(user.uid, officeName, businessNum);

        // 2. 유저 프로필 업데이트 (인증 완료, 역할 설정)
        await updateUserProfile({
          isBrokerVerified: true,
          businessNumber: businessNum,
          officeName: officeName,
          brokerRole: 'broker_master', // 최초 가입자는 대표(마스터)로 설정
          officeId: officeId
        });
        
        alert('사업자 인증이 완료되었습니다!\n이제 100ZIP 중개사 백오피스를 이용하실 수 있습니다.');
        navigate('/broker/home', { replace: true });
      } catch (error) {
        console.error('인증 처리 중 오류:', error);
        alert('인증 처리 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    }, 1500);
  };

  return (
    <div className="page" style={{ background: '#f8fafc' }}>
      <TopBar title="중개사 사무소 인증" />
      <div className="page-content" style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 12px 0', color: 'var(--color-text-primary)' }}>
            환영합니다, 중개사님! 👋
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', margin: 0, lineHeight: '1.5' }}>
            서비스 이용을 위해 중개사무소 사업자 인증이 필요합니다.<br/>
            안전한 매물 관리를 위한 필수 절차이니 양해 부탁드립니다.
          </p>
        </div>

        <Card>
          <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '16px 0' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                중개사무소 상호명
              </label>
              <input
                type="text"
                placeholder="예: 백집 공인중개사사무소"
                value={officeName}
                onChange={(e) => setOfficeName(e.target.value)}
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid var(--color-border)',
                  fontSize: '16px',
                  background: 'var(--color-surface)'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                사업자등록번호 (10자리)
              </label>
              <input
                type="text"
                placeholder="000-00-00000"
                value={businessNum}
                onChange={(e) => setBusinessNum(e.target.value)}
                maxLength={12}
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid var(--color-border)',
                  fontSize: '16px',
                  background: 'var(--color-surface)'
                }}
              />
              <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>
                * 공공데이터포털 API를 통해 자동 진위확인이 진행됩니다.
              </span>
            </div>

            <div style={{ marginTop: '16px' }}>
              <Button 
                variant="primary" 
                fullWidth 
                type="submit" 
                disabled={isLoading || !businessNum || !officeName}
              >
                {isLoading ? '인증 진행 중...' : '사업자 인증하기'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

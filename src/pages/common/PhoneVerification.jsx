import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { RecaptchaVerifier, linkWithPhoneNumber } from 'firebase/auth';
import { auth, db } from '../../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import useAuthStore from '../../stores/authStore';
import TopBar from '../../components/TopBar';
import Button from '../../components/Button';
import './PhoneVerification.css';

export default function PhoneVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = location.state?.role || 'landlord';
  const user = useAuthStore((s) => s.user);
  
  const [phone, setPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationId, setVerificationId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {},
      });
    }
  }, []);

  const handleSendCode = async () => {
    if (phone.length < 10) {
      setError('올바른 휴대폰 번호를 입력해주세요. (예: 01012345678)');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // 01012345678 -> +821012345678
      let formattedPhone = phone.replace(/-/g, '');
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '+82' + formattedPhone.substring(1);
      }

      const appVerifier = window.recaptchaVerifier;
      const confirmationResult = await linkWithPhoneNumber(auth.currentUser, formattedPhone, appVerifier);
      setVerificationId(confirmationResult);
      alert('인증번호가 발송되었습니다.');
    } catch (e) {
      console.error(e);
      setError('인증번호 발송에 실패했습니다. 이미 인증된 번호이거나 형식 오류일 수 있습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode) return;
    
    setLoading(true);
    setError('');
    
    try {
      const result = await verificationId.confirm(verificationCode);
      const verifiedPhone = result.user.phoneNumber;
      
      // 사용자 정보 업데이트 (Firestore)
      if (user?.uid) {
        await updateDoc(doc(db, 'users', user.uid), {
          phone: verifiedPhone
        });
      }
      
      // 상태 업데이트 후 다음 화면으로
      useAuthStore.setState((state) => ({
        user: { ...state.user, phone: verifiedPhone }
      }));
      
      alert('본인 인증이 완료되었습니다.');
      
      // 신규 가입이면 역할 선택 유지, 아니면 홈으로
      if (!user?.role) {
        navigate('/role-select', { replace: true, state: { role } });
      } else {
        navigate(user.role === 'landlord' ? '/landlord/home' : '/tenant/home', { replace: true });
      }
      
    } catch (e) {
      console.error(e);
      setError('잘못된 인증번호입니다. 다시 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  // 개발 중에는 Firebase Phone Auth 설정이 복잡할 수 있으므로, 임시 건너뛰기 기능 제공
  const handleSkipDev = async () => {
    if (user?.uid) {
      const dummyPhone = '+8210' + Math.floor(10000000 + Math.random() * 90000000);
      await updateDoc(doc(db, 'users', user.uid), {
        phone: dummyPhone
      });
      useAuthStore.setState((state) => ({
        user: { ...state.user, phone: dummyPhone }
      }));
      
      if (!user?.role) {
        navigate('/role-select', { replace: true, state: { role } });
      } else {
        navigate(user.role === 'landlord' ? '/landlord/home' : '/tenant/home', { replace: true });
      }
    }
  };

  return (
    <div className="page">
      <TopBar title="휴대폰 본인 인증" showBack={false} />
      <div className="page-content phone-verification">
        <div className="phone-verification__guide">
          <h2>안전한 계약을 위해<br/>전화번호 인증이 필요해요</h2>
          <p>등록하신 전화번호를 기준으로 계약 정보를 연동합니다.</p>
        </div>

        <div className="phone-verification__form">
          <div className="form-group">
            <label>휴대폰 번호</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="tel"
                placeholder="01012345678 (- 없이 입력)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={verificationId != null || loading}
                className="phone-verification__input"
              />
              <Button variant="outline" onClick={handleSendCode} disabled={loading || verificationId != null || phone.length < 10} style={{ width: '100px' }}>
                {loading && !verificationId ? '발송중' : '인증요청'}
              </Button>
            </div>
          </div>

          {verificationId && (
            <div className="form-group" style={{ marginTop: '16px' }}>
              <label>인증 번호 6자리</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="number"
                  placeholder="123456"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  disabled={loading}
                  className="phone-verification__input"
                />
                <Button variant="primary" onClick={handleVerifyCode} disabled={loading || verificationCode.length < 6} style={{ width: '100px' }}>
                  {loading ? '확인중' : '인증확인'}
                </Button>
              </div>
            </div>
          )}

          {error && <div className="phone-verification__error">{error}</div>}
        </div>

        <div id="recaptcha-container"></div>

        <div className="phone-verification__dev-skip">
          <p className="dev-text">[개발 중] 콘솔 설정 전이라면 아래 버튼으로 임시 통과하세요.</p>
          <Button variant="text" onClick={handleSkipDev}>인증 건너뛰기 (테스트용)</Button>
        </div>
      </div>
    </div>
  );
}

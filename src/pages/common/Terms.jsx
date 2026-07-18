import { useNavigate } from 'react-router-dom';
import TopBar from '../../components/TopBar';

export default function Terms() {
  const navigate = useNavigate();

  return (
    <div className="page">
      <TopBar title="서비스 이용약관" onBack={() => navigate(-1)} />
      <div className="page-content" style={{ padding: '24px', lineHeight: '1.6' }}>
        <h3>제1조 (목적)</h3>
        <p>
          본 약관은 건물주(이하 "회사")가 제공하는 임대관리 서비스(이하 "서비스")의 이용과 관련하여 회사와 회원 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
        </p>
        <br/>
        <h3>제2조 (용어의 정의)</h3>
        <p>
          본 약관에서 사용하는 용어의 정의는 다음과 같습니다.<br/>
          1. "회원"이란 본 약관에 동의하고 서비스에 가입한 임대인 및 임차인을 말합니다.<br/>
          2. "서비스"란 단말기(PC, 휴대형 단말기 등)에 상관없이 회원이 이용할 수 있는 건물주 관련 제반 서비스를 의미합니다.
        </p>
        <br/>
        <h3>제3조 (약관의 효력 및 변경)</h3>
        <p>
          회사는 본 약관의 내용을 회원이 쉽게 알 수 있도록 서비스 초기 화면에 게시하거나 링크 등으로 제공합니다.
        </p>
        <br/>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
          (본 약관은 예시용으로 작성되었으며, 실제 출시 전 법적 검토를 거친 전문으로 교체해야 합니다.)
        </p>
      </div>
    </div>
  );
}

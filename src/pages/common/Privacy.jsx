import { useNavigate } from 'react-router-dom';
import TopBar from '../../components/TopBar';

export default function Privacy() {
  const navigate = useNavigate();

  return (
    <div className="page">
      <TopBar title="개인정보처리방침" onBack={() => navigate(-1)} />
      <div className="page-content" style={{ padding: '24px', lineHeight: '1.6' }}>
        <h3>1. 개인정보의 수집 및 이용 목적</h3>
        <p>
          건물주(이하 "회사")는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 사전 동의를 구합니다.
          <br/><br/>- 서비스 가입 및 회원 관리<br/>- 임대차 계약 관리 및 정산 알림 제공<br/>- 서비스 부정이용 방지
        </p>
        <br/>
        <h3>2. 수집하는 개인정보의 항목</h3>
        <p>
          회사는 회원가입, 상담, 서비스 제공 등을 위해 아래와 같은 개인정보를 수집하고 있습니다.
          <br/><br/>- 필수항목: 휴대전화번호, 기기 정보
        </p>
        <br/>
        <h3>3. 개인정보의 보유 및 이용기간</h3>
        <p>
          원칙적으로, 개인정보 수집 및 이용 목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다.
        </p>
        <br/>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
          (본 방침은 예시용으로 작성되었으며, 실제 출시 전 법적 검토를 거친 전문으로 교체해야 합니다.)
        </p>
      </div>
    </div>
  );
}

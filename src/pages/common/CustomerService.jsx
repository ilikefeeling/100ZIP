import React from 'react';
import TopBar from '../../components/TopBar';
import './CustomerService.css';

export default function CustomerService() {
  return (
    <div className="page">
      <TopBar title="고객센터" />
      <div className="page-content customer-service">
        <div className="cs-header">
          <h2>무엇을 도와드릴까요?</h2>
          <p>이용 중 불편하신 점이나 궁금한 사항이 있다면 언제든 문의해 주세요.</p>
        </div>

        <div className="cs-card">
          <h3>이메일 문의</h3>
          <p className="cs-email">ilikepeople@icloud.com</p>
          <p className="cs-desc">
            답변은 영업일 기준 1~2일 내에 작성하신 이메일로 회신해 드립니다.
          </p>
          <button 
            className="cs-button"
            onClick={() => window.location.href = 'mailto:ilikepeople@icloud.com'}
          >
            이메일 앱 열기
          </button>
        </div>

        <div className="cs-faq">
          <h3>자주 묻는 질문 (FAQ)</h3>
          <ul className="faq-list">
            <li>
              <strong>Q. 방 비밀번호는 언제 세입자에게 공개되나요?</strong>
              <p>A. 세입자가 전자서명을 완료하고, 사장님께서 보증금 입금을 확인하여 '계약 확정'을 누르시면 자동으로 공개됩니다.</p>
            </li>
            <li>
              <strong>Q. 알림톡 발송이 안돼요.</strong>
              <p>A. 무분별한 알림 방지를 위해 동일인/동일호실 알림톡은 1시간 쿨타임이 있으며, 야간(20:00~09:00)에는 발송이 제한됩니다.</p>
            </li>
            <li>
              <strong>Q. 사용법을 더 자세히 알고 싶어요.</strong>
              <p>A. 홈 화면 상단의 '앱 사용설명서' 메뉴를 참고해 주세요.</p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

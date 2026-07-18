import React from 'react';
import TopBar from '../../components/TopBar';
import './UserManual.css';

export default function UserManual() {
  return (
    <div className="page">
      <TopBar title="앱 사용설명서" />
      <div className="page-content user-manual">
        
        <div className="manual-section">
          <h2 className="manual-section-title">👑 임대인(건물주)용 사용설명서</h2>
          <p className="manual-section-desc">수기나 엑셀로 하던 건물 관리, 계약, 월세 수납, 세입자 응대를 앱 하나로 자동화하고 편하게 관리합니다.</p>

          <div className="manual-item">
            <h3>🔹 시작하기 (건물 및 호실 세팅)</h3>
            <ol>
              <li>앱에 로그인 후 <strong>[건물 등록]</strong> 버튼을 눌러 소유하신 건물 정보(주소, 공용현관 비밀번호, 관리비 수납 계좌 등)를 등록합니다.</li>
              <li>건물 내의 <strong>[호실 생성]</strong>을 통해 101호, 201호 등 각 방의 정보를 세팅합니다.</li>
            </ol>
          </div>

          <div className="manual-item">
            <h3>🔹 계약 등록 및 입주키트 발송</h3>
            <ol>
              <li>새로운 세입자와 계약을 맺으면 호실 관리에서 <strong>[계약 등록]</strong>을 진행합니다.
                <ul>
                  <li><strong>입력 내용:</strong> 임차인 연락처, 보증금, 월세, 계약 체결일, 입주일(계약 시작일)</li>
                  <li><em>Tip: 입주일을 설정하면 매월 월세 입금일이 자동으로 세팅됩니다.</em></li>
                </ul>
              </li>
              <li>계약 등록이 끝나면 곧바로 <strong>[입주키트 작성]</strong> 화면으로 넘어갑니다.
                <ul>
                  <li>호실 비밀번호, 와이파이, 쓰레기 배출 요일 등을 기입합니다. (이전에 썼던 내용이 자동 저장되어 편리합니다)</li>
                </ul>
              </li>
              <li><strong>[초대 링크 생성하기]</strong>를 누르면 세입자의 카카오톡이나 문자로 입주키트 발송됩니다. 이제 세입자가 전화로 비밀번호를 묻지 않습니다!</li>
            </ol>
          </div>

          <div className="manual-item">
            <h3>🔹 매월 월세 및 퇴실 관리</h3>
            <ol>
              <li><strong>[월세 청구 및 납부 확인]</strong>: 매월 입금일이 다가오면 월세 및 추가 관리비(가스비 등)를 앱에서 확정하여 세입자에게 알림을 보냅니다. 입금이 확인되면 '납부 완료' 처리합니다.</li>
              <li><strong>[미납 독촉 알림 쿨타임]</strong>: 임차인 보호를 위해 미납 독촉 알림톡은 '3일에 1회', '월 최대 3회'까지만 발송 가능하도록 안전 장치가 적용되어 있습니다.</li>
              <li><strong>[퇴실 정산 및 공실 전환]</strong>: 세입자가 나갈 때 보증금에서 미납 월세나 일할 계산된 관리비를 앱에서 클릭 몇 번으로 자동 정산합니다. 정산이 완료되면 해당 호실은 자동으로 <strong>'공실'</strong> 상태로 전환됩니다.</li>
            </ol>
          </div>

          <div className="manual-item">
            <h3>🔹 주거래 중개사 관리 및 방 내놓기</h3>
            <ol>
              <li><strong>[파트너 등록]</strong>: 홈 화면에서 <strong>'주거래 중개사 파트너'</strong> 메뉴를 통해 자주 거래하는 중개사들을 미리 등록해둡니다. 한 번 등록해두면 모든 건물/호실에서 공통으로 사용 가능합니다.</li>
              <li><strong>[방 내놓기]</strong>: 세입자가 퇴실하여 공실이 발생하면, 호실 상세 페이지에서 <strong>'주거래 중개사에게 방 내놓기'</strong> 버튼을 클릭하세요.</li>
              <li>등록된 파트너 중개사들을 원하는 만큼 선택하여 한 번에 카카오톡 알림톡으로 공실 정보를 전송할 수 있습니다. 전송된 메시지에는 손님 브리핑용 웹 브로셔 링크가 함께 포함됩니다.</li>
            </ol>
          </div>
        </div>

        <div className="manual-divider" />

        <div className="manual-section">
          <h2 className="manual-section-title">🏠 임차인(세입자)용 사용설명서</h2>
          <p className="manual-section-desc">건물주가 보낸 링크 하나로 입주 안내부터 월세 납부, 퇴거 정산까지 스마트하게 확인하세요.</p>

          <div className="manual-item">
            <h3>🔹 입주 키트 및 서명</h3>
            <ol>
              <li>집주인이 보낸 <strong>카카오톡 링크</strong>를 클릭하여 앱에 접속합니다.</li>
              <li><strong>[전자서명]</strong>: 입주하기 전 임대차 계약 내용을 확인하고 스마트폰으로 간편하게 서명합니다.</li>
              <li><strong>[입주키트 확인]</strong>: 공동현관 비밀번호, 와이파이, 분리수거 위치 등 입주에 필요한 모든 정보를 언제든 앱에서 꺼내 볼 수 있습니다.</li>
            </ol>
          </div>

          <div className="manual-item">
            <h3>🔹 월세 납부 및 퇴거 정산</h3>
            <ol>
              <li><strong>[청구서 확인]</strong>: 매월 납부해야 할 월세와 관리비 청구서를 확인하고 잊지 않게 납부할 수 있습니다.</li>
              <li><strong>[퇴거 정산]</strong>: 이사를 나갈 때 집주인이 보낸 보증금 정산 내역(미납금, 공제액 등)을 앱에서 투명하게 확인하고 승인합니다.</li>
            </ol>
          </div>
        </div>

        <div className="manual-divider" />

        <div className="manual-section">
          <h2 className="manual-section-title">🤝 중개사(공인중개사)용 사용설명서</h2>
          <p className="manual-section-desc">임대인이 매번 문자로 보내주는 파편화된 공실 정보를, 항상 최신화된 깔끔한 웹페이지로 확인하여 고객에게 빠르게 매물을 브리핑합니다.</p>

          <div className="manual-item">
            <h3>🔹 공실 확인 및 브리핑</h3>
            <ol>
              <li>임대인(건물주)이 카카오톡으로 보내준 <strong>[공실 정보 공유 링크]</strong>를 클릭합니다. (별도의 앱 설치나 회원가입이 필요 없습니다)</li>
              <li>현재 비어있는 방들의 목록을 스마트폰이나 PC 브라우저로 한눈에 확인합니다.
                <ul>
                  <li><strong>확인 가능 정보:</strong> 호수, 보증금/월세 금액, 면적, 방 사진</li>
                  <li><strong>비밀번호:</strong> 손님과 방을 보러 갈 때 필요한 공동현관 및 호실 비밀번호도 해당 링크에 안전하게 표시됩니다.</li>
                </ul>
              </li>
              <li>임대인에게 일일이 "사장님 201호 나갔나요?" 물어볼 필요 없이, 링크만 누르면 실시간 계약 상태(공실 여부)가 업데이트되어 있습니다.</li>
            </ol>
          </div>

          <div className="manual-item">
            <h3>🔹 주거래 건물주 등록 및 영업</h3>
            <ol>
              <li><strong>[건물주 초대]</strong>: 아직 100집을 사용하지 않는 건물주(임대인) 고객을 앱으로 초대하고 내 파트너로 등록할 수 있습니다. 중개사 홈 화면의 <strong>'내 주거래 건물주(매물) 등록하기'</strong> 버튼을 사용하세요.</li>
              <li><strong>[공실 알림 선점]</strong>: 내가 파트너로 등록한 건물주의 건물에서 공실이 발생하면, 건물주가 클릭 한 번으로 나에게 방을 내놓을 수 있게 되어 매물 확보(영업)에 매우 유리해집니다.</li>
            </ol>
          </div>
        </div>

      </div>
    </div>
  );
}

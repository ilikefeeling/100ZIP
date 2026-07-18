import { useNavigate, useParams } from 'react-router-dom';
import usePropertyStore from '../../stores/propertyStore';
import TopBar from '../../components/TopBar';
import Card from '../../components/Card';
import Button from '../../components/Button';
import './SignedKitView.css';

/**
 * LL-002d 서명 완료된 입주안내문 확인
 * 임대인이 세입자가 서명한 입주키트와 전자서명을 조회하는 화면
 */
export default function SignedKitView() {
  const navigate = useNavigate();
  const { buildingId, unitId } = useParams();
  const building = usePropertyStore((s) => s.getBuilding(buildingId));
  const unit = building?.units?.find((u) => u.id === unitId);
  const contract = unit?.contract;

  if (!unit || !contract || !contract.kit) {
    return (
      <div className="page">
        <TopBar title="입주안내문 (원본)" />
        <div className="page-content" style={{ padding: '40px', textAlign: 'center' }}>
          입주키트 정보가 없거나 계약을 찾을 수 없습니다.
        </div>
      </div>
    );
  }

  const kit = contract.kit;

  return (
    <div className="page">
      <TopBar title="입주안내문 원본" />
      <div className="page-content signed-kit">
        
        <div className="signed-kit__header">
          <h2>{building?.name} {unit?.unitNumber}</h2>
          <p>임차인 <strong>{contract.tenantName}</strong>님의 입주 안내문 서명 원본입니다.</p>
        </div>

        {/* 비밀번호 */}
        <Card>
          <div className="signed-kit__section">
            <h2 className="signed-kit__title">
              <span className="signed-kit__icon">🔐</span> 비밀번호
            </h2>
            <div className="signed-kit__row">
              <span className="signed-kit__label">공동현관/호실</span>
              <span className="signed-kit__value">{kit.access?.doorCode || '-'}</span>
            </div>
            <div className="signed-kit__row">
              <span className="signed-kit__label">와이파이</span>
              <span className="signed-kit__value">{kit.access?.wifiCode || '-'}</span>
            </div>
          </div>
        </Card>

        {/* 안내사항 */}
        <Card>
          <div className="signed-kit__section">
            <h2 className="signed-kit__title">
              <span className="signed-kit__icon">📌</span> 안내사항
            </h2>
            <div className="signed-kit__row">
              <span className="signed-kit__label">쓰레기 배출</span>
              <span className="signed-kit__value">{kit.specialTerms?.trashInfo || '-'}</span>
            </div>
            <div className="signed-kit__row">
              <span className="signed-kit__label">주차</span>
              <span className="signed-kit__value">{kit.specialTerms?.parkingInfo || '-'}</span>
            </div>
            <div className="signed-kit__row">
              <span className="signed-kit__label">공통 고지</span>
              <span className="signed-kit__value">{kit.specialTerms?.commonNotice || '-'}</span>
            </div>
          </div>
        </Card>

        {/* 임차료 수납 계좌 */}
        <Card>
          <div className="signed-kit__section">
            <h2 className="signed-kit__title">
              <span className="signed-kit__icon">💰</span> 임차료 수납 계좌
            </h2>
            <div className="signed-kit__row">
              <span className="signed-kit__label">은행</span>
              <span className="signed-kit__value">{building?.rentBank || '-'}</span>
            </div>
            <div className="signed-kit__row">
              <span className="signed-kit__label">계좌번호</span>
              <span className="signed-kit__value">{building?.rentAccount || '-'}</span>
            </div>
            <div className="signed-kit__row">
              <span className="signed-kit__label">월세 입금일</span>
              <span className="signed-kit__value">
                {contract?.rentPaymentDay 
                  ? `매월 ${contract.rentPaymentDay}일 (${contract.rentPaymentType === 'prepaid' ? '선불' : '후불'})` 
                  : '-'}
              </span>
            </div>
          </div>
        </Card>

        {/* 서명 영역 */}
        <div className="signed-kit__signature-area">
          <h3 className="signed-kit__signature-title">전자서명 확인</h3>
          <p className="signed-kit__signature-text">위 임차인은 상기 내용을 모두 확인하고 숙지하였음을 증명합니다.</p>
          
          <div className="signed-kit__signature-box">
            {contract.signatureDataUrl ? (
              <img src={contract.signatureDataUrl} alt="임차인 서명" className="signed-kit__signature-img" />
            ) : (
              <div className="signed-kit__signature-empty">
                {contract.tenantSigned ? '(서명 데이터가 없는 기존 서명건)' : '서명이 없습니다.'}
              </div>
            )}
          </div>
          
          <div className="signed-kit__signature-info">
            <span className="signed-kit__signature-name">{contract.tenantName} (인)</span>
            <span className="signed-kit__signature-date">
              서명일시: {contract.signedAt ? new Date(contract.signedAt).toLocaleString() : '기록 없음'}
            </span>
          </div>
        </div>

        <div className="signed-kit__actions no-print">
          <Button variant="secondary" onClick={() => navigate(-1)}>뒤로 가기</Button>
          <Button variant="primary" onClick={() => window.print()}>PDF로 다운로드 / 인쇄</Button>
        </div>

      </div>
    </div>
  );
}

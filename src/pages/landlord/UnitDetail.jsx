import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import usePropertyStore from '../../stores/propertyStore';
import TopBar from '../../components/TopBar';
import Card from '../../components/Card';
import CurrencyDisplay from '../../components/CurrencyDisplay';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';
import { formatKoreanCurrency } from '../../utils/format';
import { uploadCompressedImage } from '../../utils/imageUpload';
import './UnitDetail.css';

/**
 * LL-002c 호실 상세
 * 호실 기본정보 요약 + 현재 계약 + 메뉴 리스트
 */
export default function UnitDetail() {
  const navigate = useNavigate();
  const { buildingId, unitId } = useParams();
  const building = usePropertyStore((s) => s.getBuilding(buildingId));
  const updateContract = usePropertyStore((s) => s.updateContract);
  const updateUnit = usePropertyStore((s) => s.updateUnit);
  const terminateContract = usePropertyStore((s) => s.terminateContract);
  const unit = building?.units?.find((u) => u.id === unitId);
  const [isBrokerModalOpen, setIsBrokerModalOpen] = useState(false);
  const [selectedBrokers, setSelectedBrokers] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  if (!unit) {
    return (
      <div className="page">
        <TopBar title="호실 상세" />
        <div className="page-content" style={{ textAlign: 'center', paddingTop: '20vh' }}>
          <p style={{ font: 'var(--font-body)', color: 'var(--color-text-secondary)' }}>호실을 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  const contract = unit.contract;
  const isVacant = unit.status === '공실';
  const isPending = contract?.status === '대기';
  const isSigned = contract?.status === '서명완료';
  const isConfirmed = contract?.status === '확정';
  const isSettlePending = contract?.status === '정산대기';

  const checkRateLimit = (lastNotifiedAt) => {
    if (!lastNotifiedAt) return true;
    const ONE_HOUR = 60 * 60 * 1000;
    if (new Date() - new Date(lastNotifiedAt) < ONE_HOUR) {
      alert('알림톡은 비용 방지를 위해 1시간에 1번만 발송할 수 있습니다.\n(최근 발송 시간으로부터 1시간이 지나지 않았습니다.)');
      return false;
    }
    return true;
  };

  const handleConfirmDeposit = async () => {
    try {
      await updateContract(buildingId, unitId, { status: '확정' });
      alert('보증금 입금 확인 및 계약이 확정되었습니다.\n임차인에게 입주키트가 공개됩니다.');
    } catch (err) {
      alert('계약 확정 처리 중 오류가 발생했습니다.');
    }
  };

  const handleResendLink = async () => {
    const currentHour = new Date().getHours();
    if (currentHour < 9 || currentHour >= 20) {
      alert('09:00부터 20:00까지만 알림톡/문자 발송이 가능합니다.\n야간 발송은 수신자의 불편을 초래할 수 있어 차단됩니다.');
      return;
    }

    if (!checkRateLimit(contract?.lastNotifiedAt)) return;

    const inviteLink = `${window.location.origin}/invite/${buildingId}/${unitId}`;
    const tenantPhone = contract?.tenantPhone || '';
    const message = `[건물주] ${building?.name || ''} ${unit?.unitNumber || ''} 입주키트(비밀번호, 이용안내)가 도착했습니다.\n링크를 눌러 확인해 주세요.\n${inviteLink}`;

    try {
      await navigator.clipboard.writeText(message);
    } catch (err) {}

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
      if (navigator.share) {
        try {
          await navigator.share({
            title: '입주키트 안내',
            text: message
          });
        } catch (error) {
          if (error.name !== 'AbortError') {
            window.location.href = `sms:${tenantPhone.replace(/-/g, '')}?body=${encodeURIComponent(message)}`;
          }
        }
      } else {
        window.location.href = `sms:${tenantPhone.replace(/-/g, '')}?body=${encodeURIComponent(message)}`;
      }
    } else {
      alert("초대 메시지가 복사되었습니다!\n\nPC를 사용 중이시네요. PC 카카오톡이나 메시지 앱 대화창에 '붙여넣기(Ctrl+V)' 해서 보내주시면 됩니다.");
    }
    
    await updateContract(buildingId, unitId, { lastNotifiedAt: new Date().toISOString() });
  };


  return (
    <div className="page">
      <TopBar title={unit.unitNumber} />
      <div className="page-content unit-detail">
        {/* 호실 기본정보 */}
        <Card>
          <div className="unit-detail__info">
            <div className="unit-detail__row">
              <span className="unit-detail__label">면적</span>
              <span className="unit-detail__value tabular-nums">{unit.exclusiveArea}㎡</span>
            </div>
            <div className="unit-detail__row">
              <span className="unit-detail__label">구조</span>
              <span className="unit-detail__value">{unit.structureType}</span>
            </div>
            {unit.options?.length > 0 && (
              <div className="unit-detail__options">
                {unit.options.map((opt) => (
                  <StatusBadge key={opt} status="info" label={opt} />
                ))}
              </div>
            )}
            {unit.specialNotes && (
              <div className="unit-detail__row">
                <span className="unit-detail__label">특이사항</span>
                <span className="unit-detail__value">{unit.specialNotes}</span>
              </div>
            )}
          </div>
        </Card>

        {/* 호실 사진 관리 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginTop: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="unit-detail__section-title" style={{ margin: 0 }}>호실 사진</h3>
            <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>최대 3장</span>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {unit.photoUrls?.map((url, idx) => (
              <div key={idx} style={{ position: 'relative', aspectRatio: '4/3', borderRadius: '12px', overflow: 'hidden' }}>
                <img src={url} alt={`Unit ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button
                  onClick={async () => {
                    if (window.confirm('이 사진을 삭제하시겠습니까?')) {
                      const newUrls = unit.photoUrls.filter((_, i) => i !== idx);
                      await updateUnit(buildingId, unitId, { photoUrls: newUrls });
                    }
                  }}
                  style={{ position: 'absolute', top: '6px', right: '6px', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  ✕
                </button>
              </div>
            ))}
            
            {(!unit.photoUrls || unit.photoUrls.length < 3) && (
              <div style={{ position: 'relative', aspectRatio: '4/3', borderRadius: '12px', backgroundColor: 'var(--color-bg-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed var(--color-border)' }}>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={isUploading}
                  onChange={async (e) => {
                    const files = Array.from(e.target.files);
                    if (!files.length) return;
                    
                    const currentCount = unit.photoUrls?.length || 0;
                    if (currentCount + files.length > 3) {
                      alert('사진은 최대 3장까지만 등록할 수 있습니다.');
                      return;
                    }
                    
                    try {
                      setIsUploading(true);
                      const uploadPromises = files.map((file, idx) => {
                        const path = `buildings/${buildingId}/units/${unitId}/photo_${Date.now()}_${idx}.webp`;
                        return uploadCompressedImage(file, path);
                      });
                      
                      const newUrls = await Promise.all(uploadPromises);
                      const updatedUrls = [...(unit.photoUrls || []), ...newUrls];
                      
                      await updateUnit(buildingId, unitId, { photoUrls: updatedUrls });
                    } catch (error) {
                      console.error('Photo upload failed:', error);
                      alert('사진 업로드에 실패했습니다.');
                    } finally {
                      setIsUploading(false);
                      // Reset file input
                      e.target.value = '';
                    }
                  }}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: isUploading ? 'default' : 'pointer' }}
                />
                <span style={{ fontSize: '24px', marginBottom: '4px' }}>{isUploading ? '⏳' : '📷'}</span>
                <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>{isUploading ? '업로드 중...' : '사진 추가'}</span>
              </div>
            )}
          </div>
        </div>

        {/* 현재 상태 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <h3 className="unit-detail__section-title" style={{ margin: 0 }}>
            현재 상태
          </h3>
          {isVacant ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-button)',
                height: 'var(--size-button-height)'
              }}>

                <span style={{ font: 'var(--font-body)', fontWeight: '600', color: 'var(--color-text-secondary)' }}>공실입니다</span>
              </div>
              <Button
                variant="accent"
                onClick={() => navigate(`/landlord/buildings/${buildingId}/units/${unitId}/contract/new`)}
              >
                계약 등록하기
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  if (!building?.brokers || building.brokers.length === 0) {
                    if (window.confirm('등록된 단골 중개사가 없습니다.\n단골 중개사 관리 페이지로 이동하시겠습니까?')) {
                      navigate(`/landlord/buildings/${buildingId}/brokers`);
                    }
                  } else {
                    setIsBrokerModalOpen(true);
                    // 기본으로 전체 선택
                    setSelectedBrokers(building.brokers.map(b => b.id));
                  }
                }}
              >
                단골 중개사들에게 방 내놓기
              </Button>
            </div>
          ) : (
            <>
            <Card>
              <div className="unit-detail__contract-info">
                <div className="unit-detail__row">
                  <span className="unit-detail__label">임차인</span>
                  <span className="unit-detail__value">{contract?.tenantName || '-'}</span>
                </div>
                <div className="unit-detail__row">
                  <span className="unit-detail__label">연락처</span>
                  <span className="unit-detail__value">
                    {contract?.tenantPhone || '-'}
                  </span>
                </div>
                <div className="unit-detail__row">
                  <span className="unit-detail__label">보증금</span>
                  <span className="unit-detail__value">
                    <CurrencyDisplay amount={contract?.deposit} />
                  </span>
                </div>
                <div className="unit-detail__row">
                  <span className="unit-detail__label">월세</span>
                  <span className="unit-detail__value">
                    <CurrencyDisplay amount={contract?.monthlyRent} />
                  </span>
                </div>
                <div className="unit-detail__row">
                  <span className="unit-detail__label">계약기간</span>
                  <span className="unit-detail__value">
                    {contract?.startDate || '-'} ~ {contract?.endDate || '-'}
                  </span>
                </div>
                <div className="unit-detail__row">
                  <span className="unit-detail__label">상태</span>
                  <StatusBadge
                    status={contract?.status === '확정' ? 'success' : contract?.status === '서명완료' ? 'warning' : contract?.status === '정산대기' ? 'danger' : contract?.status === '종료' ? 'danger' : 'neutral'}
                    label={contract?.status || '대기'}
                  />
                </div>
              </div>
              <div style={{ marginTop: '20px' }}>
                <Button 
                  variant="secondary" 
                  onClick={() => navigate(`/landlord/buildings/${buildingId}/units/${unitId}/contract/edit`)}
                >
                  계약 정보 수정하기
                </Button>
              </div>
            </Card>

            {contract?.broker && (
              <Card>
                <div className="unit-detail__section-title" style={{ fontSize: '16px', marginTop: 0, marginBottom: '16px' }}>부동산 중개 정보</div>
                <div className="unit-detail__contract-info">
                  <div className="unit-detail__row">
                    <span className="unit-detail__label">부동산 이름</span>
                    <span className="unit-detail__value">{contract.broker.name || '-'}</span>
                  </div>
                  <div className="unit-detail__row">
                    <span className="unit-detail__label">담당자 연락처</span>
                    <span className="unit-detail__value">{contract.broker.phone || '-'}</span>
                  </div>
                  <div className="unit-detail__row">
                    <span className="unit-detail__label">중개수수료</span>
                    <span className="unit-detail__value">
                      <CurrencyDisplay amount={contract.broker.fee} />
                    </span>
                  </div>
                  <div className="unit-detail__row">
                    <span className="unit-detail__label">지급 상태</span>
                    <span className="unit-detail__value">
                      {contract.broker.isPaid ? '지급 완료 (' + new Date(contract.broker.paidDate).toLocaleDateString() + ')' : '미지급'}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
                  {contract.broker.phone && (
                    <Button variant="secondary" onClick={() => window.location.href = `tel:${contract.broker.phone.replace(/[^0-9]/g, '')}`}>
                      중개사에게 전화하기
                    </Button>
                  )}
                  {!contract.broker.isPaid && (
                    <Button variant="accent" onClick={async () => {
                      const currentHour = new Date().getHours();
                      if (currentHour < 9 || currentHour >= 20) {
                        alert('09:00부터 20:00까지만 알림톡 발송이 가능합니다.\n야간 발송은 수신자의 불편을 초래할 수 있어 차단됩니다.');
                        return;
                      }

                      if (!checkRateLimit(contract.broker.lastNotifiedAt)) return;

                      if(window.confirm('중개수수료 지급을 완료 처리하시겠습니까? 중개사에게 알림톡이 발송됩니다.')) {
                        await updateContract(buildingId, unitId, {
                          ...contract,
                          broker: { ...contract.broker, isPaid: true, paidDate: new Date().toISOString(), lastNotifiedAt: new Date().toISOString() }
                        });
                        alert('수수료 지급이 완료되었습니다. 중개사에게 알림톡이 전송됩니다.');
                      }
                    }}>
                      수수료 지급 완료 처리 및 알림톡
                    </Button>
                  )}
                </div>
              </Card>
            )}
            </>
          )}
        </div>

        {/* 상태에 따른 액션 메뉴 */}
        <div className="unit-detail__menu">
          {isPending ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px', padding: '24px', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-card)', border: '1px solid var(--color-primary-200)', textAlign: 'center' }}>

              <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--color-primary-700)' }}>임차인의 승인을<br/>기다리고 있습니다.</div>
              <div style={{ fontSize: '16px', color: 'var(--color-text-secondary)', marginTop: '8px', marginBottom: '16px' }}>임차인이 링크를 열어 내용을 확인하고 서명하면 상태가 변경됩니다.</div>
              
              <Button variant="primary" onClick={handleResendLink}>
                카카오톡/문자 다시 보내기
              </Button>
              <Button variant="secondary" onClick={() => navigate('/landlord/home')}>
                건물 전체 현황으로 돌아가기
              </Button>
            </div>
          ) : isSigned ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px', padding: '24px', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-card)', border: '1px solid var(--color-warning-400)', textAlign: 'center' }}>

              <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--color-warning-700)' }}>보증금 입금을<br/>확인해주세요.</div>
              <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '8px', marginBottom: '16px', lineHeight: 1.5 }}>
                임차인이 서명을 완료했습니다.<br/>
                통장으로 <strong>보증금이 입금된 것을 확인한 후</strong> 아래 버튼을 누르면 계약이 최종 확정되며 임차인에게 입주키트가 공개됩니다.
              </div>
              
              <Button variant="primary" onClick={handleConfirmDeposit}>
                보증금 입금 확인 및 계약 확정
              </Button>
            </div>
          ) : isConfirmed ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px' }}>
              <Button variant="primary" onClick={() => navigate(`/landlord/buildings/${buildingId}/units/${unitId}/rent`)}>
                보증금 및 월세 납부 현황 보기
              </Button>
              <Button variant="secondary" onClick={() => navigate(`/landlord/buildings/${buildingId}/units/${unitId}/signed-kit`)}>
                서명 완료된 입주안내문 확인
              </Button>
              <Button variant="secondary" onClick={() => navigate(`/landlord/buildings/${buildingId}/units/${unitId}/rent/adjust`)}>
                청구 금액 추가/변경
              </Button>
              <Button variant="secondary" onClick={() => navigate('/landlord/home')}>
                건물 전체 현황으로 돌아가기
              </Button>
            </div>
          ) : isSettlePending ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px', padding: '24px', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-card)', border: '1px solid var(--color-danger-400)', textAlign: 'center' }}>

              <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--color-danger-700)' }}>임차인 퇴거 정산 대기 중</div>
              <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '8px', marginBottom: '16px', lineHeight: 1.5 }}>
                임차인에게 정산 내역서가 전송되었습니다.<br/>
                협의가 완료되었고 방이 완전히 비워졌다면<br/>
                아래 버튼을 눌러 공실로 전환해주세요.
              </div>
              
              <Button variant="primary" onClick={async () => {
                if(window.confirm('계약을 최종 종료하고 공실로 전환하시겠습니까?\n이전 계약 내역은 임차인 이력으로 이동합니다.')) {
                  await terminateContract(buildingId, unitId);
                  alert('성공적으로 공실로 전환되었습니다.');
                }
              }}>
                임차인 확인 완료 (공실 전환)
              </Button>
            </div>
          ) : !isVacant && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px' }}>
              <Button variant="primary" onClick={() => navigate(`/landlord/buildings/${buildingId}/units/${unitId}/rent`)}>
                납부 내역 상세 조회
              </Button>
              <Button variant="secondary" onClick={() => navigate(`/landlord/buildings/${buildingId}/units/${unitId}/rent/adjust`)}>
                청구 금액 추가/변경
              </Button>
            </div>
          )}

          {!isPending && !isSigned && !isSettlePending && (
            <>
              <button
                className="unit-detail__menu-item"
                onClick={() => navigate(`/landlord/buildings/${buildingId}/units/${unitId}/history`)}
              >
                <span>임차인 이력 보기</span>
                <span className="unit-detail__arrow">→</span>
              </button>

              <button className="unit-detail__menu-item unit-detail__menu-item--stub">
                <span>📊</span>
                <span>시세 참고자료</span>
                <StatusBadge status="neutral" label="준비중" />
              </button>

              <button className="unit-detail__menu-item unit-detail__menu-item--stub">
                <span>🏷️</span>
                <span>매물카드 자동생성</span>
                <StatusBadge status="neutral" label="준비중" />
              </button>
              
              <button
                className="unit-detail__menu-item"
                onClick={() => navigate(`/landlord/buildings/${buildingId}/units/${unitId}/move-out`)}
                style={{ color: 'var(--color-danger)' }}
              >

                <span>계약 종료/퇴실 처리</span>
                <span className="unit-detail__arrow">→</span>
              </button>
            </>
          )}
        </div>
      </div>

      {isBrokerModalOpen && (
        <div className="broker-modal-overlay">
          <div className="broker-modal">
            <h3 className="broker-modal__title">단골 중개사에게 방 내놓기</h3>
            <p className="broker-modal__desc">방 정보를 전송할 중개사를 선택하세요.</p>
            
            <div className="broker-modal__list">
              {building?.brokers?.map(broker => (
                <label key={broker.id} className="broker-modal__item">
                  <input 
                    type="checkbox" 
                    checked={selectedBrokers.includes(broker.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedBrokers([...selectedBrokers, broker.id]);
                      } else {
                        setSelectedBrokers(selectedBrokers.filter(id => id !== broker.id));
                      }
                    }}
                  />
                  <span className="broker-modal__name">{broker.name} ({broker.phone})</span>
                </label>
              ))}
            </div>
            
            <div className="broker-modal__actions">
              <Button variant="secondary" onClick={() => setIsBrokerModalOpen(false)}>취소</Button>
              <Button variant="primary" onClick={async () => {
                const currentHour = new Date().getHours();
                if (currentHour < 9 || currentHour >= 20) {
                  alert('09:00부터 20:00까지만 알림톡 발송이 가능합니다.\n야간 발송은 수신자의 불편을 초래할 수 있어 차단됩니다.');
                  return;
                }

                if (!checkRateLimit(unit.lastBrokerNotifiedAt)) return;

                if (selectedBrokers.length === 0) {
                  alert('중개사를 최소 1명 이상 선택해주세요.');
                  return;
                }
                const addressStr = building?.address ? `\n📍 주소: ${building.address}` : '';
                const doorStr = building?.commonDoorCode ? `\n🚪 공동현관: ${building.commonDoorCode}` : '';
                const parkStr = building?.parkingInfo ? `\n🚗 주차안내: ${building.parkingInfo}` : '';
                
                const text = `[공실 방 내놓기] ${building?.name || '건물'} ${unit?.unitNumber || '호실'}${addressStr}${doorStr}${parkStr}\n\n호실 비밀번호 및 임대 조건(보증금/월세)은 별도 문의 바랍니다.`;
                
                const brochureLink = `\n\n[손님 전송용 웹 브로셔 링크]\nhttps://app.com/share/${buildingId}/${unitId}/brochure`;
                
                const selectedNames = building.brokers.filter(b => selectedBrokers.includes(b.id)).map(b => b.name).join(', ');
                alert(`[모의 발송 완료]\n\n선택한 중개사(${selectedNames})에게 카카오톡으로 공실 정보가 발송되었습니다!\n\n(발송 내용)\n${text}${brochureLink}`);
                
                await updateUnit(buildingId, unitId, { lastBrokerNotifiedAt: new Date().toISOString() });
                setIsBrokerModalOpen(false);
              }}>발송하기</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

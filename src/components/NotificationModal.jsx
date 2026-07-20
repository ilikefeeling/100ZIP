import { useState, useEffect } from 'react';
import { IconMessageCircle2, IconCheck, IconX } from '@tabler/icons-react';
import './NotificationModal.css';

/**
 * 카카오 알림톡 전송 시뮬레이션 모달
 * 실제 연동(옵션 B) 전까지 시연(Mock)을 위해 사용됨
 */
export default function NotificationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  tenantName, 
  message, 
  title = "알림톡 발송" 
}) {
  const [status, setStatus] = useState('idle'); // idle -> sending -> success

  // 모달 열릴 때 상태 초기화
  useEffect(() => {
    if (isOpen) {
      setStatus('idle');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSend = () => {
    setStatus('sending');
    // 실제 통신처럼 보이게 1.5초 딜레이
    setTimeout(() => {
      setStatus('success');
      setTimeout(() => {
        onConfirm();
      }, 1000);
    }, 1500);
  };

  return (
    <div className="notif-modal__overlay">
      <div className="notif-modal__content">
        <button className="notif-modal__close" onClick={onClose} disabled={status === 'sending'}>
          <IconX size={24} />
        </button>

        {status === 'idle' && (
          <div className="notif-modal__body">
            <div className="notif-modal__icon">
              <IconMessageCircle2 size={36} color="#3A1D1D" />
            </div>
            <h2 className="notif-modal__title">{title}</h2>
            <p className="notif-modal__desc">
              <strong>{tenantName}</strong> 임차인에게 아래 내용으로<br />
              카카오 알림톡을 발송하시겠습니까?
            </p>

            <div className="notif-modal__preview">
              <div className="notif-modal__preview-header">카카오톡 미리보기</div>
              <div className="notif-modal__preview-body">
                {message.split('\n').map((line, i) => (
                  <span key={i}>{line}<br/></span>
                ))}
              </div>
            </div>

            <button className="notif-modal__btn-send" onClick={handleSend}>
              발송하기
            </button>
          </div>
        )}

        {status === 'sending' && (
          <div className="notif-modal__body notif-modal__body--center">
            <div className="notif-modal__spinner"></div>
            <h2 className="notif-modal__title">알림톡 발송 중...</h2>
            <p className="notif-modal__desc">잠시만 기다려주세요</p>
          </div>
        )}

        {status === 'success' && (
          <div className="notif-modal__body notif-modal__body--center">
            <div className="notif-modal__success-icon">
              <IconCheck size={40} color="white" />
            </div>
            <h2 className="notif-modal__title">발송 완료!</h2>
            <p className="notif-modal__desc">임차인에게 성공적으로 전송되었습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}

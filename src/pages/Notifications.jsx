import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import TopBar from '../components/TopBar';
import BottomTabBar from '../components/BottomTabBar';
import './Notifications.css';

/**
 * COM-005 알림함
 * 임대인/임차인 공용 알림함 (role에 따라 다른 메시지 노출)
 */
export default function Notifications() {
  const navigate = useNavigate();
  const role = useAuthStore((s) => s.role);

  const [filter, setFilter] = useState('all'); // 'all' | 'unread'

  // Mock 알림 데이터 (상태로 관리하여 읽음 처리 가능하게 구현)
  const [landlordNotis, setLandlordNotis] = useState([
    { id: 1, type: 'rent', buildingId: 'b1', unitId: 'u1', title: '월세 입금 완료', desc: '역삼동 건물 101호의 7월분 월세가 입금되었습니다.', time: '10분 전', read: false },
    { id: 2, type: 'contract', buildingId: 'b1', unitId: 'u2', title: '계약 서명 완료', desc: '역삼동 건물 202호 임차인이 서명을 완료했습니다.', time: '2시간 전', read: true },
    { id: 3, type: 'adjust', buildingId: 'b1', unitId: 'u1', title: '금액 조정 확인', desc: '역삼동 건물 101호 임차인이 금액 조정을 확인했습니다.', time: '어제', read: true },
    { id: 4, type: 'moveout', buildingId: 'b1', unitId: 'u1', title: '퇴거 정산 동의', desc: '역삼동 건물 101호 임차인이 퇴거 정산 내역에 동의했습니다.', time: '2일 전', read: false },
  ]);

  const [tenantNotis, setTenantNotis] = useState([
    { id: 1, type: 'rent', title: '이번 달 청구서 도착', desc: '7월분 월세 및 관리비 청구서가 도착했습니다.', time: '1시간 전', read: false },
    { id: 2, type: 'adjust', title: '청구 금액 확정', desc: '요청하신 금액 조정이 반영되어 최종 확정되었습니다.', time: '어제', read: true },
    { id: 3, type: 'contract', title: '계약서 서명 요청', desc: '임대인이 보낸 전자계약서에 서명을 완료해주세요.', time: '3일 전', read: true },
  ]);

  const rawNotifications = role === 'landlord' ? landlordNotis : tenantNotis;
  const notifications = filter === 'unread' ? rawNotifications.filter(n => !n.read) : rawNotifications;

  const handleNotiClick = (noti) => {
    // 1. 읽음 처리
    if (role === 'landlord') {
      setLandlordNotis(prev => prev.map(n => n.id === noti.id ? { ...n, read: true } : n));
    } else {
      setTenantNotis(prev => prev.map(n => n.id === noti.id ? { ...n, read: true } : n));
    }

    // 2. 알림 타입에 따라 적절한 페이지로 이동 (해당 호실 파라미터 적용)
    if (role === 'landlord') {
      const bId = noti.buildingId || 'b1';
      const uId = noti.unitId || 'u1';
      
      if (noti.type === 'rent') navigate(`/landlord/buildings/${bId}/units/${uId}/rent`);
      else if (noti.type === 'adjust') navigate(`/landlord/buildings/${bId}/units/${uId}/rent/adjust`);
      else if (noti.type === 'moveout') navigate(`/landlord/buildings/${bId}/units/${uId}/move-out`);
      else if (noti.type === 'contract') navigate(`/landlord/buildings/${bId}/units/${uId}`);
      else navigate('/landlord/rent');
    } else {
      if (noti.type === 'rent') navigate('/tenant/payments');
      else if (noti.type === 'contract') navigate('/tenant/sign');
      else navigate('/tenant/home');
    }
  };

  return (
    <div className="page">
      <TopBar title="알림함" showBack={false} />
      <div className="notifications__tabs">
        <button 
          className={`notifications__tab ${filter === 'all' ? 'notifications__tab--active' : ''}`}
          onClick={() => setFilter('all')}
        >
          전체
        </button>
        <button 
          className={`notifications__tab ${filter === 'unread' ? 'notifications__tab--active' : ''}`}
          onClick={() => setFilter('unread')}
        >
          읽지 않음
        </button>
      </div>
      <div className="page-content notifications">
        {notifications.length === 0 ? (
          <div className="notifications__empty">
            <span className="notifications__empty-icon">📭</span>
            <p>새로운 알림이 없습니다.</p>
          </div>
        ) : (
          <div className="notifications__list">
            {notifications.map((noti) => (
              <div 
                key={noti.id} 
                className={`notifications__item ${noti.read ? 'notifications__item--read' : ''}`}
                onClick={() => handleNotiClick(noti)}
              >
                {!noti.read && <div className="notifications__dot" />}
                <div className="notifications__content">
                  <h3 className="notifications__title">{noti.title}</h3>
                  <p className="notifications__desc">{noti.desc}</p>
                  <span className="notifications__time">{noti.time}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <BottomTabBar role={role} />
    </div>
  );
}

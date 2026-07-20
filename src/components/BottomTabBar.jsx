import { NavLink } from 'react-router-dom';
import './BottomTabBar.css';

/**
 * 하단 탭 바 컴포넌트
 * 임대인: 홈 / 계약관리 / 납부관리 / 알림 (LL-001 기준)
 * 임차인: 홈 / 우리집정보 / 납부내역 / 알림 (TN-001 기준)
 * @param {'landlord'|'tenant'} role
 */

const LANDLORD_TABS = [
  { path: '/landlord/home', icon: '🏠', label: '홈' },
  { path: '/landlord/contracts', icon: '📋', label: '계약관리' },
  { path: '/landlord/rent', icon: '💰', label: '납부관리' },
  { path: '/landlord/notifications', icon: '🔔', label: '알림' },
];

const TENANT_TABS = [
  { path: '/tenant/home', icon: '🏠', label: '홈' },
  { path: '/tenant/kit', icon: '🏡', label: '우리집정보' },
  { path: '/tenant/payments', icon: '💰', label: '납부내역' },
  { path: '/tenant/notifications', icon: '🔔', label: '알림' },
];
const BROKER_TABS = [
  { path: '/broker/home', icon: '🏠', label: '홈' },
  { path: '/broker/listings', icon: '📋', label: '매물관리' },
  { path: '/broker/clients', icon: '🤝', label: '임대인장부' },
  { path: '/broker/expiring', icon: '⏳', label: '만기임박' },
];

export default function BottomTabBar({ role = 'landlord' }) {
  let tabs = LANDLORD_TABS;
  if (role === 'tenant') tabs = TENANT_TABS;
  if (role === 'broker') tabs = BROKER_TABS;

  return (
    <nav className="bottom-tab" aria-label="메인 내비게이션">
      {tabs.map((tab) => (
        <NavLink
          key={tab.path}
          to={tab.path}
          className={({ isActive }) =>
            `bottom-tab__item ${isActive ? 'bottom-tab__item--active' : ''}`
          }
        >
          <span className="bottom-tab__icon" aria-hidden="true">{tab.icon}</span>
          <span className="bottom-tab__label">{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

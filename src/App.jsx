import { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './stores/authStore';
import usePropertyStore from './stores/propertyStore';
import useSettingsStore from './stores/settingsStore';
import ErrorBoundary from './components/ErrorBoundary';
import './styles/global.css';

// Common pages (Splash and Login keep normal imports for fast initial load)
import Splash from './pages/common/Splash';
import Login from './pages/common/Login';

// Lazy load the rest
const RoleSelect = lazy(() => import('./pages/common/RoleSelect'));
const PhoneVerification = lazy(() => import('./pages/common/PhoneVerification'));
const BrokerShareView = lazy(() => import('./pages/common/BrokerShareView'));
const Onboarding = lazy(() => import('./pages/common/Onboarding'));
const Terms = lazy(() => import('./pages/common/Terms'));
const Privacy = lazy(() => import('./pages/common/Privacy'));
const UserManual = lazy(() => import('./pages/common/UserManual'));

// Landlord pages
const LandlordHome = lazy(() => import('./pages/landlord/LandlordHome'));
const LandlordProfile = lazy(() => import('./pages/landlord/LandlordProfile'));
const BuildingRegister = lazy(() => import('./pages/landlord/BuildingRegister'));
const BuildingSettings = lazy(() => import('./pages/landlord/BuildingSettings'));
const UnitList = lazy(() => import('./pages/landlord/UnitList'));
const UnitRegister = lazy(() => import('./pages/landlord/UnitRegister'));
const UnitDetail = lazy(() => import('./pages/landlord/UnitDetail'));
const ContractRegister = lazy(() => import('./pages/landlord/ContractRegister'));
const ContractEdit = lazy(() => import('./pages/landlord/ContractEdit'));
const KitWizard = lazy(() => import('./pages/landlord/KitWizard'));
const SignedKitView = lazy(() => import('./pages/landlord/SignedKitView'));
const RentList = lazy(() => import('./pages/landlord/RentList'));
const RentDetail = lazy(() => import('./pages/landlord/RentDetail'));
const RentReceipt = lazy(() => import('./pages/landlord/RentReceipt'));
const RentAdjust = lazy(() => import('./pages/landlord/RentAdjust'));
const MoveOutSettle = lazy(() => import('./pages/landlord/MoveOutSettle'));
const TenantHistory = lazy(() => import('./pages/landlord/TenantHistory'));
const LandlordBrokerManage = lazy(() => import('./pages/landlord/LandlordBrokerManage'));
const BrokerHome = lazy(() => import('./pages/broker/BrokerHome'));
const LandlordInvite = lazy(() => import('./pages/broker/LandlordInvite'));
const BrokerRegister = lazy(() => import('./pages/broker/BrokerRegister'));
const ClientList = lazy(() => import('./pages/broker/ClientList'));
const ExpiringUnits = lazy(() => import('./pages/broker/ExpiringUnits'));
const ListingManage = lazy(() => import('./pages/broker/ListingManage'));
const StaffManage = lazy(() => import('./pages/broker/StaffManage'));
const BrokerInviteLanding = lazy(() => import('./pages/broker/BrokerInviteLanding'));

// Tenant pages
const TenantHome = lazy(() => import('./pages/tenant/TenantHome'));
const TenantKit = lazy(() => import('./pages/tenant/TenantKit'));
const TenantSign = lazy(() => import('./pages/tenant/TenantSign'));
const TenantPayments = lazy(() => import('./pages/tenant/TenantPayments'));
const TenantRentAdjust = lazy(() => import('./pages/tenant/TenantRentAdjust'));
const GuestInvite = lazy(() => import('./pages/tenant/GuestInvite'));
const TenantMoveOutSettle = lazy(() => import('./pages/tenant/TenantMoveOutSettle'));

// Common pages
const Notifications = lazy(() => import('./pages/Notifications'));

import InstallPwaPrompt from './components/InstallPwaPrompt';
import { initKakao } from './utils/kakao';

/**
 * 건물주 앱 루트 컴포넌트
 * 라우팅 구조는 01_ia.md의 화면ID 체계를 따릅니다.
 */
export default function App() {
  const initAuthListener = useAuthStore((s) => s.initAuthListener);
  const user = useAuthStore((s) => s.user);
  const initPropertyListener = usePropertyStore((s) => s.initListener);
  const clearPropertyStore = usePropertyStore((s) => s.clearStore);
  const fontScale = useSettingsStore((s) => s.fontScale);

  useEffect(() => {
    initKakao();
  }, []);

  useEffect(() => {
    document.documentElement.dataset.fontScale = fontScale;
  }, [fontScale]);

  useEffect(() => {
    initAuthListener();
  }, [initAuthListener]);

  useEffect(() => {
    if (user?.uid) {
      initPropertyListener(user);
    } else {
      clearPropertyStore();
    }
  }, [user?.uid, initPropertyListener, clearPropertyStore]);

  return (
    <ErrorBoundary>
      <InstallPwaPrompt />
      <BrowserRouter>
        <Suspense fallback={<Splash />}>
          <Routes>
            {/* ── 공통/인증 ── */}
            <Route path="/" element={<Splash />} />
            <Route path="/login" element={<Login />} />
            <Route path="/phone-verification" element={<PhoneVerification />} />
            <Route path="/role-select" element={<RoleSelect />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/manual" element={<UserManual />} />
            <Route path="/invite/:buildingId/:unitId" element={<GuestInvite />} />
            <Route path="/share/broker/:buildingId" element={<BrokerShareView />} />
            <Route path="/invite/broker/:officeId" element={<BrokerInviteLanding />} />

            {/* ── 임대인 ── */}
            <Route path="/landlord/home" element={<LandlordHome />} />
            <Route path="/landlord/profile" element={<LandlordProfile />} />
            <Route path="/landlord/buildings/new" element={<BuildingRegister />} />
            <Route path="/landlord/buildings/:buildingId/settings" element={<BuildingSettings />} />
            <Route path="/landlord/buildings/:buildingId/units" element={<UnitList />} />
            <Route path="/landlord/buildings/:buildingId/units/new" element={<UnitRegister />} />

            <Route path="/landlord/buildings/:buildingId/units/:unitId" element={<UnitDetail />} />
            <Route path="/landlord/buildings/:buildingId/units/:unitId/contract/new" element={<ContractRegister />} />
            <Route path="/landlord/buildings/:buildingId/units/:unitId/contract/edit" element={<ContractEdit />} />
            <Route path="/landlord/buildings/:buildingId/units/:unitId/kit/new" element={<KitWizard />} />
            <Route path="/landlord/buildings/:buildingId/units/:unitId/signed-kit" element={<SignedKitView />} />
            
            {/* Placeholder routes for Phase 3+ */}
            <Route path="/landlord/contracts" element={<PlaceholderPage title="계약 관리 (Phase 3)" />} />
            <Route path="/landlord/rent" element={<RentList />} />
            <Route path="/landlord/buildings/:buildingId/units/:unitId/rent" element={<RentDetail />} />
            <Route path="/landlord/buildings/:buildingId/units/:unitId/rent/receipt/:recordId" element={<RentReceipt />} />
            <Route path="/landlord/buildings/:buildingId/units/:unitId/rent/adjust" element={<RentAdjust />} />
            <Route path="/landlord/buildings/:buildingId/units/:unitId/move-out" element={<MoveOutSettle />} />
            <Route path="/landlord/buildings/:buildingId/units/:unitId/history" element={<TenantHistory />} />
            <Route path="/landlord/brokers" element={<LandlordBrokerManage />} />
            <Route path="/landlord/notifications" element={<Notifications />} />

            {/* ── 중개사 ── */}
            <Route path="/broker/register" element={<BrokerRegister />} />
            <Route path="/broker/home" element={<BrokerHome />} />
            <Route path="/broker/landlord-invite" element={<LandlordInvite />} />
            <Route path="/broker/clients" element={<ClientList />} />
            <Route path="/broker/expiring" element={<ExpiringUnits />} />
            <Route path="/broker/listings" element={<ListingManage />} />
            <Route path="/broker/staff" element={<StaffManage />} />

            {/* ── 임차인 ── */}
            <Route path="/tenant/home" element={<TenantHome />} />
            <Route path="/tenant/kit" element={<TenantKit />} />
            <Route path="/tenant/sign" element={<TenantSign />} />
            <Route path="/tenant/payments" element={<TenantPayments />} />
            <Route path="/tenant/payments/adjust" element={<TenantRentAdjust />} />
            <Route path="/tenant/move-out-settle" element={<TenantMoveOutSettle />} />
            <Route path="/tenant/notifications" element={<Notifications />} />

            {/* ── 404 ── */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

import TopBar from './components/TopBar';

/** Placeholder for future phases */
function PlaceholderPage({ title }) {
  return (
    <div className="page">
      <TopBar title={title} />
      <div className="page-content" style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: '60vh', textAlign: 'center', gap: '16px',
      }}>
        <div style={{ fontSize: '48px' }}>🚧</div>
        <h2 style={{ font: 'var(--font-heading-2)', color: 'var(--color-text-primary)' }}>{title}</h2>
        <p style={{ font: 'var(--font-body)', color: 'var(--color-text-secondary)' }}>
          다음 단계에서 구현됩니다
        </p>
      </div>
    </div>
  );
}

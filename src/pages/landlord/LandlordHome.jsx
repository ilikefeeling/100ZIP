import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import usePropertyStore from '../../stores/propertyStore';
import useSettingsStore from '../../stores/settingsStore';
import BottomTabBar from '../../components/BottomTabBar';
import Card from '../../components/Card';
import StatusBadge from '../../components/StatusBadge';
import './LandlordHome.css';

/**
 * LL-001 임대인 홈 (물건 목록)
 * 보유 물건 카드 목록 + 신규 물건 등록
 * 하단 탭바: 홈 / 계약관리 / 납부관리 / 알림
 */
export default function LandlordHome() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const buildings = usePropertyStore((s) => s.buildings);

  const getStats = (building) => {
    const units = building.units || [];
    const total = units.length;
    const vacant = units.filter((u) => u.status === '공실').length;
    const rented = units.filter((u) => u.status === '임대중' && u.contract?.status !== '대기').length;
    const pending = units.filter((u) => u.contract?.status === '대기').length;
    return { total, vacant, rented, pending };
  };

  return (
    <div className="page">
      <div className="page-content ll-home">
        {/* 인사말 */}
        <div className="ll-home__greeting" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="ll-home__hello" style={{ lineHeight: '1.2' }}>
              <span style={{ fontSize: '16px', fontWeight: '500', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>안녕하세요,</span>
              <strong>{user?.name || '건물주'}</strong>님
            </h1>
            <p className="ll-home__sub">오늘도 편안한 관리 되세요</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={async () => {
                if (window.confirm('로그아웃 하시겠습니까?')) {
                  await logout();
                  navigate('/login', { replace: true });
                }
              }}
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: '20px',
                padding: '8px 12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                color: 'var(--color-text-secondary)'
              }}
              aria-label="로그아웃"
            >
              <span>🚪</span>
            </button>
            <button
              onClick={() => navigate('/manual')}
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: '20px',
                padding: '8px 12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                color: 'var(--color-text-primary)'
              }}
              aria-label="사용설명서 보기"
            >
              <span>📖</span>
              <span>설명서</span>
            </button>
            <button
              onClick={() => {
                const currentScale = document.documentElement.dataset.fontScale || 'normal';
                const nextScale = currentScale === 'normal' ? 'large' : currentScale === 'large' ? 'xlarge' : 'normal';
                const setFontScale = useSettingsStore.getState().setFontScale;
                setFontScale(nextScale);
              }}
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: '20px',
                padding: '8px 16px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: 'var(--color-text-primary)'
              }}
              aria-label="글자 크기 변경"
            >
              <span>가</span>
              <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>크게</span>
            </button>
          </div>
        </div>

        {/* 물건 목록 */}
        {buildings.length === 0 ? (
          <div className="ll-home__empty">
            <div className="ll-home__empty-icon">🏗️</div>
            <p className="ll-home__empty-text">
              등록된 건물이 없어요<br />첫 번째 건물을 추가해보세요
            </p>
          </div>
        ) : (
          <div className="ll-home__list">
            {buildings.map((building) => {
              const stats = getStats(building);
              return (
                <Card
                  key={building.id}
                  clickable
                  onClick={() => navigate(`/landlord/buildings/${building.id}/units`)}
                >
                  <div className="ll-home__card">
                    <div className="ll-home__card-header">
                      <span className="ll-home__card-icon" aria-hidden="true">🏢</span>
                      <div className="ll-home__card-info" style={{ flex: 1 }}>
                        <p className="ll-home__card-address">{building.address}</p>
                        <p className="ll-home__card-type">{building.buildingType} · {stats.total}호실</p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/landlord/buildings/${building.id}/settings`); }}
                        style={{
                          background: 'var(--color-surface)',
                          border: '1px solid var(--color-border)',
                          borderRadius: '16px',
                          fontSize: '16px',
                          fontWeight: '600',
                          color: 'var(--color-text-secondary)',
                          padding: '6px 14px',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          flexShrink: 0,
                          marginLeft: 'auto',
                        }}
                      >
                        건물 상세
                      </button>
                    </div>
                    <div className="ll-home__card-badges">
                      {stats.rented > 0 && (
                        <StatusBadge status="success" label={`임대중 ${stats.rented}`} />
                      )}
                      {stats.pending > 0 && (
                        <StatusBadge status="warning" label={`승인대기 ${stats.pending}`} />
                      )}
                      {stats.vacant > 0 && (
                        <StatusBadge status="danger" label={`공실 ${stats.vacant}`} />
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* 바이럴 배너: 주변 건물주에게 앱 알려주기 */}
        <div style={{ marginTop: '32px', marginBottom: '80px' }}>
          <Card>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '16px 8px' }}>

              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>주변 건물주에게 앱 알려주기</h3>
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '20px', lineHeight: '1.5' }}>
                혼자 쓰기 아까운 계약 관리 앱!<br/>
                주변 건물주나 중개사에게 알려주세요.
              </p>
              <button
                onClick={() => {
                  import('../../utils/kakao').then(({ shareToKakao }) => {
                    shareToKakao({
                      title: '100집 - 건물주를 위한 스마트 임대관리',
                      description: '임대차 계약부터 입주 안내까지, 폰 하나로 5분 만에 끝내는 최고의 앱을 소개합니다!',
                      imageUrl: 'https://100zip.com/icon.png',
                      link: 'https://100zip.com'
                    });
                  });
                }}
                style={{
                  background: 'var(--color-primary-600)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-button)',
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                카톡으로 알려주기
              </button>
            </div>
          </Card>
        </div>

        {/* 플로팅 추가 버튼 */}
        <button
          className="ll-home__fab"
          onClick={() => navigate('/landlord/buildings/new')}
          aria-label="건물 추가"
        >
          + 건물 추가
        </button>
      </div>

      <BottomTabBar role="landlord" />
    </div>
  );
}

import { useState, useEffect } from 'react';
import './InstallPwaPrompt.css';

export default function InstallPwaPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [os, setOs] = useState('');

  useEffect(() => {
    // 이미 설치된 경우 표시하지 않음
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
      return;
    }

    // 이미 팝업을 닫은 적이 있다면 다시 띄우지 않음
    if (localStorage.getItem('pwaPromptDismissed') === 'true') {
      return;
    }

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);

    if (isIOS) {
      setOs('ios');
      setShowPrompt(true);
    } else if (isAndroid) {
      setOs('android');
      setShowPrompt(true);
    }

    // 안드로이드의 경우 native 설치 프롬프트를 우선 시도하기 위해 beforeinstallprompt 이벤트 활용
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      window.deferredPrompt = e;
      setOs('android-native');
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const closePrompt = () => {
    localStorage.setItem('pwaPromptDismissed', 'true');
    setShowPrompt(false);
  };

  const handleInstallClick = () => {
    if (os === 'android-native' && window.deferredPrompt) {
      window.deferredPrompt.prompt();
      window.deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the A2HS prompt');
        } else {
          console.log('User dismissed the A2HS prompt');
        }
        window.deferredPrompt = null;
        closePrompt();
      });
    } else {
      // 안내창은 버튼 클릭 시 닫기
      closePrompt();
    }
  };

  if (!showPrompt) return null;

  return (
    <div className="pwa-prompt-overlay">
      <div className="pwa-prompt-modal">
        <div className="pwa-prompt-header">
          <h3>앱 설치 안내</h3>
          <button className="pwa-prompt-close" onClick={closePrompt}>✕</button>
        </div>
        <div className="pwa-prompt-body">
          <p>더 빠르고 편리하게 앱을 이용하시려면,<br/>바탕화면(홈 화면)에 추가해주세요!</p>
          
          <div className="pwa-prompt-instructions">
            {os === 'ios' && (
              <>
                <p><strong>📌 아이폰(Safari)</strong></p>
                <p>브라우저 하단의 <strong>[공유(내보내기)] <span style={{ fontSize: '1.2em' }}>⍐</span></strong> 버튼을 누른 후<br/><strong>[홈 화면에 추가]</strong>를 선택하세요.</p>
              </>
            )}
            {(os === 'android' || os === 'android-native') && (
              <>
                <p><strong>📌 안드로이드(Chrome)</strong></p>
                <p>브라우저 우측 상단의 <strong>[⋮] 메뉴</strong>를 누른 후<br/><strong>[홈 화면에 추가]</strong> 또는 <strong>[앱 설치]</strong>를 선택하세요.</p>
              </>
            )}
          </div>
        </div>
        <div className="pwa-prompt-footer">
          <button className="pwa-prompt-btn" onClick={handleInstallClick}>
            확인
          </button>
        </div>
      </div>
    </div>
  );
}

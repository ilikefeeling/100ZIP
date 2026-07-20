import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// 기존에 설치된 문제가 있는 서비스 워커(PWA 캐시)를 강제로 삭제합니다.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
    }
  });
}

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  window.deferredPrompt = e;
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

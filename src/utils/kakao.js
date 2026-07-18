/**
 * 카카오 SDK 초기화 및 카카오톡 공유 유틸리티
 */

// 앱 시작 시 한 번만 호출하여 초기화합니다.
export const initKakao = () => {
  if (window.Kakao && !window.Kakao.isInitialized()) {
    const kakaoKey = import.meta.env.VITE_KAKAO_JS_KEY;
    if (kakaoKey) {
      window.Kakao.init(kakaoKey);
      console.log('Kakao SDK initialized');
    } else {
      console.warn('VITE_KAKAO_JS_KEY가 .env 파일에 설정되지 않았습니다.');
    }
  }
};

// 카카오톡 'feed' 템플릿으로 메시지를 공유합니다.
export const shareToKakao = ({ title, description, imageUrl, link }) => {
  if (!window.Kakao) {
    alert('카카오 공유 스크립트를 불러오지 못했습니다.');
    return;
  }
  
  if (!window.Kakao.isInitialized()) {
    alert('카카오 SDK가 초기화되지 않았습니다. .env 파일에 VITE_KAKAO_JS_KEY를 설정해주세요.');
    return;
  }

  window.Kakao.Share.sendDefault({
    objectType: 'feed',
    content: {
      title: title,
      description: description,
      imageUrl: imageUrl,
      link: {
        mobileWebUrl: link,
        webUrl: link,
      },
    },
    buttons: [
      {
        title: '앱으로 이동',
        link: {
          mobileWebUrl: link,
          webUrl: link,
        },
      },
    ],
  });
};

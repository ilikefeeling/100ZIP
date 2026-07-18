import { create } from 'zustand';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut, OAuthProvider, signInWithPopup, getAdditionalUserInfo } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

/**
 * 인증 스토어 (Firebase 연동)
 */
const useAuthStore = create((set, get) => ({
  isLoggedIn: false,
  isFirstLogin: false,
  user: null,       // { uid, email, name, phone, role }
  role: null,        // 'landlord' | 'tenant'
  isAuthReady: false, // Firebase Auth 초기화 상태

  initAuthListener: () => {
    onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          set({
            isLoggedIn: true,
            user: { uid: firebaseUser.uid, email: firebaseUser.email, photoURL: firebaseUser.photoURL, ...userData },
            role: userData.role || null,
            isAuthReady: true,
            isFirstLogin: false,
          });
        } else {
          set({
            isLoggedIn: true,
            user: { uid: firebaseUser.uid, email: firebaseUser.email, photoURL: firebaseUser.photoURL },
            role: null,
            isAuthReady: true,
          });
        }
      } else {
        set({
          isLoggedIn: false,
          user: null,
          role: null,
          isAuthReady: true,
          isFirstLogin: false,
        });
      }
    });
  },

  // 카카오 로그인 (Firebase Identity Platform OIDC)
  loginWithKakao: async (role) => {
    try {
      const provider = new OAuthProvider('oidc.kakao');
      
      // 카카오 닉네임과 프로필 이미지를 받아오기 위한 스코프(Scope) 추가
      provider.addScope('profile_nickname');
      provider.addScope('profile_image');

      // 팝업으로 카카오 로그인 진행
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      const additionalInfo = getAdditionalUserInfo(result);

      console.log('Firebase User photoURL:', firebaseUser.photoURL);
      console.log('Additional Info:', additionalInfo);

      // 사용자 정보가 Firestore에 있는지 확인
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);

      const kakaoProfile = additionalInfo?.profile?.kakao_account?.profile || additionalInfo?.profile?.properties || additionalInfo?.profile;

      // 카카오 닉네임 가져오기 시도
      let currentName = '카카오 유저';
      if (kakaoProfile?.nickname) {
        currentName = kakaoProfile.nickname;
      } else if (kakaoProfile?.name) {
        currentName = kakaoProfile.name;
      } else if (firebaseUser.displayName) {
        currentName = firebaseUser.displayName;
      } else if (firebaseUser.providerData?.[0]?.displayName) {
        currentName = firebaseUser.providerData[0].displayName;
      }

      // 프로필 사진 가져오기 시도
      let currentPhotoURL = firebaseUser.photoURL || '';
      if (kakaoProfile?.profile_image_url) {
        currentPhotoURL = kakaoProfile.profile_image_url;
      } else if (kakaoProfile?.profile_image) {
        currentPhotoURL = kakaoProfile.profile_image;
      } else if (kakaoProfile?.thumbnail_image_url) {
        currentPhotoURL = kakaoProfile.thumbnail_image_url;
      } else if (kakaoProfile?.thumbnail_image) {
        currentPhotoURL = kakaoProfile.thumbnail_image;
      } else if (kakaoProfile?.picture) { // OIDC 표준
        currentPhotoURL = kakaoProfile.picture;
      }

      if (!userDoc.exists()) {
        // 최초 가입인 경우 초기 정보 저장
        await setDoc(userDocRef, {
          name: currentName,
          photoURL: currentPhotoURL,
          email: firebaseUser.email || '',
          // phone 필드는 이후 PhoneVerification 에서 입력받아 업데이트
          role,
          createdAt: new Date().toISOString()
        });
        set({ isFirstLogin: true });
        return { ...firebaseUser, name: currentName, photoURL: currentPhotoURL, phone: null, role };
      }
      
      const userData = userDoc.data();
      let updates = {};

      // 기존 이름이 '카카오 유저'인데 새로 닉네임을 가져왔다면 업데이트
      if (userData.name === '카카오 유저' && currentName !== '카카오 유저') {
        updates.name = currentName;
        userData.name = currentName;
      }
      // photoURL 업데이트 (없거나 다를 경우)
      if (currentPhotoURL && userData.photoURL !== currentPhotoURL) {
        updates.photoURL = currentPhotoURL;
        userData.photoURL = currentPhotoURL;
      }

      if (Object.keys(updates).length > 0) {
        await setDoc(userDocRef, updates, { merge: true });
      }

      return { ...firebaseUser, ...userData };
    } catch (error) {
      console.error("Kakao Login Error:", error);
      throw error;
    }
  },

  // Mock용 빠른 로그인 처리 (기존 로직 호환성 유지용)
  mockLogin: (user) => set({
    isLoggedIn: true,
    user,
    role: user.role,
    isFirstLogin: false,
  }),

  setRoleAndSaveUser: async (role, userData) => {
    const user = get().user;
    if (user && user.uid) {
      await setDoc(doc(db, 'users', user.uid), {
        ...userData,
        role,
        createdAt: new Date().toISOString()
      }, { merge: true });
      
      set({ 
        role, 
        user: { ...user, ...userData, role },
        isFirstLogin: false 
      });
    }
  },

  updateUserProfile: async (profileData) => {
    const user = get().user;
    if (user && user.uid) {
      await setDoc(doc(db, 'users', user.uid), {
        ...profileData,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      set({ 
        user: { ...user, ...profileData }
      });
    }
  },

  setFirstLogin: () => set({ isFirstLogin: true }),

  logout: async () => {
    try {
      await signOut(auth);
      set({
        isLoggedIn: false,
        user: null,
        role: null,
        isFirstLogin: false,
      });
    } catch (error) {
      console.error("Logout Error:", error);
    }
  },

  setRole: (role) => set({ role }),
}));

export default useAuthStore;

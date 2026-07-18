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
            user: { uid: firebaseUser.uid, email: firebaseUser.email, ...userData },
            role: userData.role || null,
            isAuthReady: true,
            isFirstLogin: false,
          });
        } else {
          set({
            isLoggedIn: true,
            user: { uid: firebaseUser.uid, email: firebaseUser.email },
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

      // 사용자 정보가 Firestore에 있는지 확인
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);

      // 카카오 닉네임 가져오기 시도
      let currentName = '카카오 유저';
      if (additionalInfo && additionalInfo.profile && additionalInfo.profile.nickname) {
        currentName = additionalInfo.profile.nickname;
      } else if (additionalInfo && additionalInfo.profile && additionalInfo.profile.name) {
        currentName = additionalInfo.profile.name;
      } else if (firebaseUser.displayName) {
        currentName = firebaseUser.displayName;
      } else if (firebaseUser.providerData && firebaseUser.providerData.length > 0 && firebaseUser.providerData[0].displayName) {
        currentName = firebaseUser.providerData[0].displayName;
      }

      if (!userDoc.exists()) {
        // 최초 가입인 경우 초기 정보 저장
        await setDoc(userDocRef, {
          name: currentName,
          email: firebaseUser.email || '',
          // phone 필드는 이후 PhoneVerification 에서 입력받아 업데이트
          role,
          createdAt: new Date().toISOString()
        });
        set({ isFirstLogin: true });
        return { ...firebaseUser, name: currentName, phone: null, role };
      }
      
      const userData = userDoc.data();
      // 기존 이름이 '카카오 유저'인데 새로 닉네임을 가져왔다면 업데이트
      if (userData.name === '카카오 유저' && currentName !== '카카오 유저') {
        await setDoc(userDocRef, { name: currentName }, { merge: true });
        userData.name = currentName;
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

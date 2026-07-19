import { create } from 'zustand';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut, OAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, getAdditionalUserInfo } from 'firebase/auth';
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

  initAuthListener: async () => {
    try {
      // 3초 이상 응답이 없으면 타임아웃 발생시켜 무한 로딩 방지
      const result = await Promise.race([
        getRedirectResult(auth),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Redirect timeout")), 3000))
      ]);
      if (result) {
        const role = sessionStorage.getItem('pendingRole') || 'landlord';
        sessionStorage.removeItem('pendingRole');
        await get().handleAuthResult(result, role);
      }
    } catch (e) {
      console.warn("Redirect Result Error or Timeout:", e);
    }

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

  handleAuthResult: async (result, role) => {
    const firebaseUser = result.user;
    const additionalInfo = getAdditionalUserInfo(result);

    console.log('Firebase User photoURL:', firebaseUser.photoURL);
    console.log('Additional Info:', additionalInfo);

    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const userDoc = await getDoc(userDocRef);

    const kakaoProfile = additionalInfo?.profile?.kakao_account?.profile || additionalInfo?.profile?.properties || additionalInfo?.profile;

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

    let currentPhotoURL = firebaseUser.photoURL || '';
    if (kakaoProfile?.profile_image_url) {
      currentPhotoURL = kakaoProfile.profile_image_url;
    } else if (kakaoProfile?.profile_image) {
      currentPhotoURL = kakaoProfile.profile_image;
    } else if (kakaoProfile?.thumbnail_image_url) {
      currentPhotoURL = kakaoProfile.thumbnail_image_url;
    } else if (kakaoProfile?.thumbnail_image) {
      currentPhotoURL = kakaoProfile.thumbnail_image;
    } else if (kakaoProfile?.picture) {
      currentPhotoURL = kakaoProfile.picture;
    }

    if (!userDoc.exists()) {
      await setDoc(userDocRef, {
        name: currentName,
        photoURL: currentPhotoURL,
        email: firebaseUser.email || '',
        role,
        createdAt: new Date().toISOString()
      });
      set({ isFirstLogin: true });
      return { ...firebaseUser, name: currentName, photoURL: currentPhotoURL, phone: null, role };
    }
    
    const userData = userDoc.data();
    let updates = {};

    if (userData.name === '카카오 유저' && currentName !== '카카오 유저') {
      updates.name = currentName;
      userData.name = currentName;
    }
    if (currentPhotoURL && userData.photoURL !== currentPhotoURL) {
      updates.photoURL = currentPhotoURL;
      userData.photoURL = currentPhotoURL;
    }

    if (Object.keys(updates).length > 0) {
      await setDoc(userDocRef, updates, { merge: true });
    }

    return { ...firebaseUser, ...userData };
  },

  loginWithKakao: async (role) => {
    try {
      const provider = new OAuthProvider('oidc.kakao');
      
      provider.addScope('profile_nickname');
      provider.addScope('profile_image');

      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      if (isMobile) {
        sessionStorage.setItem('pendingRole', role);
        await signInWithRedirect(auth, provider);
        // Will not reach here usually, as it redirects
        return { isRedirect: true };
      } else {
        const result = await signInWithPopup(auth, provider);
        return await get().handleAuthResult(result, role);
      }
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

import { create } from 'zustand';
import { db } from '../firebase';
import {
  collection, doc, getDoc, setDoc, addDoc, updateDoc, deleteDoc,
  onSnapshot, query, where, getDocs, orderBy
} from 'firebase/firestore';

/**
 * 중개사 백오피스 스토어 (Firebase Firestore 연동)
 * 
 * 컬렉션 구조:
 *   brokerOffices/{officeId}  — 중개사무소 정보
 *   brokerClients/{docId}    — 임대인-중개사 관계
 *   listings/{listingId}     — 매물(방 내놓기) 정보
 */
const useBrokerStore = create((set, get) => ({
  // ─── State ───
  office: null,           // 현재 로그인한 중개사의 사무소 정보
  clients: [],            // 임대인 장부
  listings: [],           // 매물 목록
  staff: [],              // 소속 직원 목록
  isInitialized: false,

  // 리스너 해제 함수들
  _unsubClients: null,
  _unsubListings: null,

  // ──────────────────────────────────────────────
  // 1. 초기화: 중개사 로그인 시 사무소 정보 로드 + 실시간 리스너 시작
  // ──────────────────────────────────────────────
  initBrokerData: async (user) => {
    const officeId = user.officeId;
    if (!officeId) {
      set({ isInitialized: true });
      return;
    }

    // 사무소 정보 로드
    const officeDoc = await getDoc(doc(db, 'brokerOffices', officeId));
    if (officeDoc.exists()) {
      set({ office: { id: officeDoc.id, ...officeDoc.data() } });
    }

    // 임대인 장부 실시간 구독
    const clientsQuery = query(
      collection(db, 'brokerClients'),
      where('officeId', '==', officeId)
    );
    const unsubClients = onSnapshot(clientsQuery, (snapshot) => {
      const clients = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      set({ clients });
    });

    // 매물 실시간 구독
    const listingsQuery = query(
      collection(db, 'listings'),
      where('officeId', '==', officeId)
    );
    const unsubListings = onSnapshot(listingsQuery, (snapshot) => {
      const listings = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      set({ listings });
    });

    // 직원 목록 로드
    await get().fetchStaff(officeId);

    set({
      isInitialized: true,
      _unsubClients: unsubClients,
      _unsubListings: unsubListings
    });
  },

  clearBrokerData: () => {
    const { _unsubClients, _unsubListings } = get();
    if (_unsubClients) _unsubClients();
    if (_unsubListings) _unsubListings();
    set({
      office: null, clients: [], listings: [], staff: [],
      isInitialized: false, _unsubClients: null, _unsubListings: null
    });
  },

  // ──────────────────────────────────────────────
  // 2. 사무소 등록 (BrokerRegister에서 호출)
  // ──────────────────────────────────────────────
  createOffice: async (userId, officeName, businessNumber) => {
    const officeRef = doc(collection(db, 'brokerOffices'));
    const officeData = {
      name: officeName,
      businessNumber,
      masterUserId: userId,
      staffIds: [],
      createdAt: new Date().toISOString()
    };
    await setDoc(officeRef, officeData);

    // 해당 유저의 officeId 업데이트
    await setDoc(doc(db, 'users', userId), { officeId: officeRef.id }, { merge: true });

    set({ office: { id: officeRef.id, ...officeData } });
    return officeRef.id;
  },

  // ──────────────────────────────────────────────
  // 3. 임대인 장부 CRUD
  // ──────────────────────────────────────────────
  addClient: async (clientData) => {
    const office = get().office;
    if (!office) throw new Error('사무소 정보가 없습니다.');

    await addDoc(collection(db, 'brokerClients'), {
      officeId: office.id,
      landlordName: clientData.name,
      landlordPhone: clientData.phone,
      landlordId: clientData.landlordId || null,  // 앱 유저인 경우 uid, 아닌 경우 null
      status: 'active',
      registeredAt: new Date().toISOString()
    });
  },

  addClientsFromExcel: async (rows) => {
    const office = get().office;
    if (!office) throw new Error('사무소 정보가 없습니다.');

    const batch = [];
    for (const row of rows) {
      batch.push(
        addDoc(collection(db, 'brokerClients'), {
          officeId: office.id,
          landlordName: row.name || row['이름'] || '',
          landlordPhone: row.phone || row['연락처'] || row['전화번호'] || '',
          landlordId: null,
          status: 'active',
          registeredAt: new Date().toISOString(),
          importedFromExcel: true
        })
      );
    }
    await Promise.all(batch);
    return batch.length;
  },

  removeClient: async (clientId) => {
    await deleteDoc(doc(db, 'brokerClients', clientId));
  },

  // ──────────────────────────────────────────────
  // 4. 매물(Listing) CRUD
  // ──────────────────────────────────────────────
  addListing: async (listingData) => {
    const office = get().office;
    if (!office) throw new Error('사무소 정보가 없습니다.');

    const docRef = await addDoc(collection(db, 'listings'), {
      officeId: office.id,
      landlordId: listingData.landlordId,
      landlordName: listingData.landlordName || '',
      landlordPhone: listingData.landlordPhone || '',
      buildingId: listingData.buildingId,
      buildingName: listingData.buildingName || '',
      unitId: listingData.unitId,
      unitNumber: listingData.unitNumber || '',
      deposit: listingData.deposit || 0,
      monthlyRent: listingData.monthlyRent || 0,
      type: listingData.type || '일반',  // '일반' | '급매' | '예상밖'
      status: '접수됨',                   // '접수됨' | '중개중' | '완료'
      memo: listingData.memo || '',
      requestedAt: new Date().toISOString()
    });
    return docRef.id;
  },

  updateListingStatus: async (listingId, newStatus) => {
    await updateDoc(doc(db, 'listings', listingId), {
      status: newStatus,
      updatedAt: new Date().toISOString()
    });
  },

  // ──────────────────────────────────────────────
  // 5. 만기 임박 호실 계산
  //    buildings 컬렉션에서 임대인들의 계약 endDate를 기반으로 필터
  // ──────────────────────────────────────────────
  fetchExpiringUnits: async () => {
    const clients = get().clients;
    if (clients.length === 0) return [];

    const landlordIds = clients
      .filter(c => c.landlordId)
      .map(c => c.landlordId);

    if (landlordIds.length === 0) return [];

    // Firestore 'in' 쿼리는 최대 30개까지 지원
    const chunks = [];
    for (let i = 0; i < landlordIds.length; i += 30) {
      chunks.push(landlordIds.slice(i, i + 30));
    }

    const allBuildings = [];
    for (const chunk of chunks) {
      const q = query(collection(db, 'buildings'), where('userId', 'in', chunk));
      const snap = await getDocs(q);
      snap.docs.forEach(d => allBuildings.push({ id: d.id, ...d.data() }));
    }

    // 만기 6개월 이내 호실 필터링
    const now = new Date();
    const sixMonthsLater = new Date();
    sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);

    const expiringUnits = [];
    for (const building of allBuildings) {
      const landlord = clients.find(c => c.landlordId === building.userId);
      for (const unit of (building.units || [])) {
        if (unit.contract && unit.contract.endDate) {
          const endDate = new Date(unit.contract.endDate);
          if (endDate > now && endDate <= sixMonthsLater) {
            const diffMs = endDate - now;
            const dDay = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
            expiringUnits.push({
              id: `${building.id}_${unit.id}`,
              landlordName: landlord?.landlordName || building.userId,
              landlordPhone: landlord?.landlordPhone || '',
              buildingName: building.name || '',
              unitNumber: unit.unitNumber || unit.id,
              tenantName: unit.contract.tenantName || '미등록',
              endDate: unit.contract.endDate,
              dDay
            });
          }
        }
      }
    }

    // D-Day 오름차순 정렬
    expiringUnits.sort((a, b) => a.dDay - b.dDay);
    return expiringUnits;
  },

  // ──────────────────────────────────────────────
  // 6. 소속 직원 관리
  // ──────────────────────────────────────────────
  fetchStaff: async (officeId) => {
    const oid = officeId || get().office?.id;
    if (!oid) return;

    const officeDoc = await getDoc(doc(db, 'brokerOffices', oid));
    if (!officeDoc.exists()) return;

    const staffIds = officeDoc.data().staffIds || [];
    const staffList = [];

    for (const uid of staffIds) {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        staffList.push({
          id: uid,
          name: data.name || '이름 미등록',
          phone: data.phone || '',
          role: data.brokerRole === 'broker_master' ? '대표공인중개사' : (data.staffRole || '중개보조원')
        });
      }
    }
    set({ staff: staffList });
  },

  addStaff: async (staffName, staffPhone, staffRole) => {
    const office = get().office;
    if (!office) throw new Error('사무소 정보가 없습니다.');

    // 해당 전화번호로 가입된 유저가 있는지 조회
    const usersQuery = query(collection(db, 'users'), where('phone', '==', staffPhone));
    const userSnap = await getDocs(usersQuery);

    let staffUserId;

    if (!userSnap.empty) {
      // 기존 유저가 있으면 officeId 연결
      staffUserId = userSnap.docs[0].id;
      await setDoc(doc(db, 'users', staffUserId), {
        officeId: office.id,
        brokerRole: 'broker_staff',
        staffRole: staffRole,
        isBrokerVerified: true
      }, { merge: true });
    } else {
      // 유저가 없으면 placeholder 문서 생성 (나중에 실 가입 시 연동)
      const placeholderRef = doc(collection(db, 'users'));
      staffUserId = placeholderRef.id;
      await setDoc(placeholderRef, {
        name: staffName,
        phone: staffPhone,
        role: 'broker',
        brokerRole: 'broker_staff',
        staffRole: staffRole,
        officeId: office.id,
        isBrokerVerified: true,
        isPlaceholder: true,
        createdAt: new Date().toISOString()
      });
    }

    // 사무소 문서에 staffIds 추가
    const officeRef = doc(db, 'brokerOffices', office.id);
    const officeSnap = await getDoc(officeRef);
    const currentStaffIds = officeSnap.data().staffIds || [];

    if (!currentStaffIds.includes(staffUserId)) {
      await updateDoc(officeRef, {
        staffIds: [...currentStaffIds, staffUserId]
      });
    }

    await get().fetchStaff();
  },

  removeStaff: async (staffUserId) => {
    const office = get().office;
    if (!office) return;

    // 사무소에서 제거
    const officeRef = doc(db, 'brokerOffices', office.id);
    const officeSnap = await getDoc(officeRef);
    const currentStaffIds = officeSnap.data().staffIds || [];

    await updateDoc(officeRef, {
      staffIds: currentStaffIds.filter(id => id !== staffUserId)
    });

    // 유저 문서에서 officeId 제거
    await setDoc(doc(db, 'users', staffUserId), {
      officeId: null,
      isBrokerVerified: false
    }, { merge: true });

    await get().fetchStaff();
  },

  // ──────────────────────────────────────────────
  // 7. 임대인 건물 정보 조회 (buildings 컬렉션 쿼리)
  // ──────────────────────────────────────────────
  fetchClientBuildings: async (landlordId) => {
    if (!landlordId) return [];
    const q = query(collection(db, 'buildings'), where('userId', '==', landlordId));
    const snap = await getDocs(q);
    return snap.docs.map(d => {
      const data = d.data();
      const units = data.units || [];
      return {
        id: d.id,
        name: data.name || '',
        address: data.address || '',
        totalUnits: units.length,
        vacantUnits: units.filter(u => u.status === '공실').length
      };
    });
  },

  // ──────────────────────────────────────────────
  // 8. 영업 메모 관리 (만기 임박 호실별 메모)
  // ──────────────────────────────────────────────
  saveMemo: async (unitKey, memoText) => {
    const office = get().office;
    if (!office) return;

    const memoDocId = `${office.id}_${unitKey}`;
    await setDoc(doc(db, 'brokerMemos', memoDocId), {
      officeId: office.id,
      unitKey,
      memo: memoText,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  },

  loadMemos: async () => {
    const office = get().office;
    if (!office) return {};

    const q = query(
      collection(db, 'brokerMemos'),
      where('officeId', '==', office.id)
    );
    const snap = await getDocs(q);
    const memos = {};
    snap.docs.forEach(d => {
      const data = d.data();
      memos[data.unitKey] = { memo: data.memo, updatedAt: data.updatedAt };
    });
    return memos;
  }
}));

export default useBrokerStore;

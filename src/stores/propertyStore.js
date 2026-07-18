import { create } from 'zustand';
import { db } from '../firebase';
import { collection, doc, getDoc, setDoc, updateDoc, deleteDoc, onSnapshot, query, where, arrayUnion } from 'firebase/firestore';

/**
 * 건물/호실/계약 스토어
 * 데이터 계층: Building → Unit(N) → Contract → Tenant
 */
const usePropertyStore = create((set, get) => ({
  buildings: [],
  unsubscribeListener: null,
  isInitialized: false,
  userId: null,

  initListener: (user) => {
    const prevUnsub = get().unsubscribeListener;
    if (prevUnsub) prevUnsub();

    const { uid, role, phone } = user;
    let q;
    if (role === 'landlord') {
      q = query(collection(db, 'buildings'), where('userId', '==', uid));
    } else if (role === 'tenant') {
      if (!phone || phone === '010-0000-0000') return;
      q = query(collection(db, 'buildings'), where('tenantPhones', 'array-contains', phone));
    } else {
      return;
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const buildings = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      set({ buildings, isInitialized: true, userId: uid });
    });
    set({ unsubscribeListener: unsubscribe });
  },

  clearStore: () => {
    const unsub = get().unsubscribeListener;
    if (unsub) unsub();
    set({ buildings: [], unsubscribeListener: null, isInitialized: false, userId: null });
  },

  // ──── 건물 ────
  addBuilding: async (building) => {
    const userId = get().userId;
    if (!userId) throw new Error('User not initialized');

    const docRef = doc(collection(db, 'buildings'));
    const newBuilding = {
      ...building,
      userId,
      units: [],
      createdAt: new Date().toISOString(),
    };
    await setDoc(docRef, newBuilding);
    return docRef.id;
  },

  getBuilding: (buildingId) => {
    return get().buildings.find((b) => b.id === buildingId);
  },

  // ──── 게스트(비회원)용 ────
  getBuildingForGuest: async (buildingId) => {
    const docRef = doc(db, 'buildings', buildingId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  },

  updateContractForGuest: async (buildingId, unitId, contractUpdates) => {
    const docRef = doc(db, 'buildings', buildingId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) throw new Error('Building not found');
    
    const bData = docSnap.data();
    const updatedUnits = bData.units.map((u) => {
      if (u.id === unitId && u.contract) {
        return {
          ...u,
          contract: { ...u.contract, ...contractUpdates }
        };
      }
      return u;
    });
    
    await updateDoc(docRef, { units: updatedUnits });
  },

  updateBuilding: async (buildingId, updates) => {
    const docRef = doc(db, 'buildings', buildingId);
    await updateDoc(docRef, updates);
  },

  deleteBuilding: async (buildingId) => {
    const docRef = doc(db, 'buildings', buildingId);
    await deleteDoc(docRef);
  },

  // ──── 주거래 중개사사무소 ────
  addBroker: async (buildingId, brokerData) => {
    const docRef = doc(db, 'buildings', buildingId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return;
    
    const bData = docSnap.data();
    const brokers = bData.brokers || [];
    
    const brokerId = `brk_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const newBroker = { id: brokerId, ...brokerData, createdAt: new Date().toISOString() };
    
    await updateDoc(docRef, { brokers: [...brokers, newBroker] });
  },

  getAllBrokerOffices: () => {
    const buildings = get().buildings;
    const offices = new Set();
    buildings.forEach(b => {
      if (b.brokers) {
        b.brokers.forEach(brk => {
          if (brk.officeName) offices.add(brk.officeName);
        });
      }
    });
    return Array.from(offices);
  },

  removeBroker: async (buildingId, brokerId) => {
    const docRef = doc(db, 'buildings', buildingId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return;
    
    const bData = docSnap.data();
    const brokers = bData.brokers || [];
    
    await updateDoc(docRef, { brokers: brokers.filter(b => b.id !== brokerId) });
  },

  // ──── 호실 ────
  addUnit: async (buildingId, unit) => {
    const building = get().getBuilding(buildingId);
    if (!building) return;

    const unitId = `unit_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const newUnit = {
      id: unitId,
      buildingId,
      ...unit,
      status: '공실',      // '공실' | '임대중'
      contract: null,
      contractHistory: [],
      createdAt: new Date().toISOString(),
    };

    const docRef = doc(db, 'buildings', buildingId);
    const updatedUnits = [...(building.units || []), newUnit];
    await updateDoc(docRef, { units: updatedUnits });
    return unitId;
  },

  updateUnit: async (buildingId, unitId, updates) => {
    const building = get().getBuilding(buildingId);
    if (!building) return;

    const updatedUnits = building.units.map((u) =>
      u.id === unitId ? { ...u, ...updates } : u
    );
    const docRef = doc(db, 'buildings', buildingId);
    await updateDoc(docRef, { units: updatedUnits });
  },

  getUnit: (buildingId, unitId) => {
    const b = get().getBuilding(buildingId);
    return b?.units?.find((u) => u.id === unitId);
  },

  // ──── 계약 ────
  addContract: async (buildingId, unitId, contract) => {
    const building = get().getBuilding(buildingId);
    if (!building) return;

    const contractId = `ctr_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const newContract = {
      id: contractId,
      unitId,
      buildingId,
      ...contract,
      status: '대기',    // '대기' | '확정' | '종료'
      landlordSigned: false,
      tenantSigned: false,
      kit: {
        access: {},
        equipment: {},
        specialTerms: {},
        emergencyContacts: [],
      },
      rentRecords: [],
      createdAt: new Date().toISOString(),
    };

    const updatedUnits = building.units.map((u) =>
      u.id === unitId ? { ...u, contract: newContract, status: '임대중' } : u
    );

    const docRef = doc(db, 'buildings', buildingId);
    
    // tenantPhones 배열에 추가하여 임차인이 건물을 읽을 수 있도록 권한 부여
    const updatesToBuilding = { units: updatedUnits };
    if (contract.tenantPhone) {
       updatesToBuilding.tenantPhones = arrayUnion(contract.tenantPhone.replace(/-/g, ''));
    }
    
    await updateDoc(docRef, updatesToBuilding);
    return contractId;
  },

  updateContract: async (buildingId, unitId, updates) => {
    const building = get().getBuilding(buildingId);
    if (!building) return;

    const updatedUnits = building.units.map((u) =>
      u.id === unitId && u.contract
        ? { ...u, contract: { ...u.contract, ...updates } }
        : u
    );

    const docRef = doc(db, 'buildings', buildingId);
    await updateDoc(docRef, { units: updatedUnits });
  },

  // ──── 입주키트 ────
  updateKit: async (buildingId, unitId, kitSection, data) => {
    const building = get().getBuilding(buildingId);
    if (!building) return;

    const updatedUnits = building.units.map((u) =>
      u.id === unitId && u.contract
        ? {
            ...u,
            contract: {
              ...u.contract,
              kit: { ...u.contract.kit, [kitSection]: data },
            },
          }
        : u
    );

    const docRef = doc(db, 'buildings', buildingId);
    await updateDoc(docRef, { units: updatedUnits });
  },
}));

export default usePropertyStore;

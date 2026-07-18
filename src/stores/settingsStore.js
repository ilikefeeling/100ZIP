import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useSettingsStore = create(
  persist(
    (set) => ({
      fontScale: 'normal', // 'normal' | 'large' | 'xlarge'
      setFontScale: (scale) => set({ fontScale: scale }),
    }),
    {
      name: 'landlord-settings',
    }
  )
);

export default useSettingsStore;

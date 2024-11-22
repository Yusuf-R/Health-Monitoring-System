import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useLocationStore = create(
    persist(
        (set) => ({
            geoId: null, // Store address details to edit

            setGeoId: (data) => set({ geoId: data }),

            clearGeoId: () => set({ geoId: null })
        }),
        {
            name: 'geoId-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ geoId: state.geoId }),
        }
    )
);

export default useLocationStore;

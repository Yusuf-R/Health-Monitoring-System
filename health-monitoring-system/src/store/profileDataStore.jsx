// userDataStore
// healthWorkerDataStore
// stakeholderDataStore

// useClientStore.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const userDataStore = create(
    persist(
        (set, get) => ({
            encryptedUserData: null, // Stores Base64-encoded encrypted data

            setEncryptedUserData: (data) => {
                set({ encryptedUserData: data });
            },

            clearEncryptedUsertData: () => set({ encryptedUserData: null }),

            getEncryptedUserData: () => get().encryptedUserData,
        }),
        {
            name: 'user-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ encryptedUserData: state.encryptedUserData }),
        }
    )
);

export const healthWorkerDataStore = create(
    persist(
        (set, get) => ({
            encryptedHealthWorkerData: null, // Stores Base64-encoded encrypted data

            setEncryptedHealthWorkerData: (data) => {
                set({ encryptedHealthWorkerData: data });
            },

            clearEncryptedHealthWorkerData: () => set({ encryptedHealthWorkerData: null }),

            getEncryptedHealthWorkerData: () => get().encryptedHealthWorkerData,
        }),
        {
            name: 'healthworker-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ encryptedHealthWorkerData: state.encryptedHealthWorkerData }),
        }
    )
);


export const stakeholderDataStore = create(
    persist(
        (set, get) => ({
            encryptedStakeHolderData: null, // Stores Base64-encoded encrypted data

            setEncryptedStakeHolderData: (data) => {
                set({ encryptedStakeHolderData: data });
            },

            clearEncryptedStakeHolderData: () => set({ encryptedStakeHolderData: null }),

            getEncryptedStakeHolderData: () => get().encryptedStakeHolderData,
        }),
        {
            name: 'stakeholder-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ encryptedStakeHolderData: state.encryptedStakeHolderData }),
        }
    )
);


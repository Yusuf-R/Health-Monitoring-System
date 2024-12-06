import { doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/server/db/fireStore';
import { NOTIFICATION_STATUS } from './notificationTypes';

export const UserDataManager = {
    // Initialize user data when they first sign up
    initializeUser: async (userId, initialData) => {
        const userRef = doc(db, 'users', userId);
        await setDoc(userRef, {
            ...initialData,
            country: 'Nigeria',
            state: '',
            lga: '',
            status: 'online',
            createdAt: serverTimestamp(),
            lastActive: serverTimestamp(),
            updatedAt: serverTimestamp(),
            notificationPreferences: {
                news: true,
                feeds: true,
                chat: true,
                alerts: true,
                email: true,
                push: true,
                scope: {
                    personal: true,
                    lga: true,
                    state: true,
                    national: true
                }
            }
        });
    },

    // Update user profile with new data
    updateProfile: async (userId, profileData) => {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            ...profileData,
            updatedAt: serverTimestamp()
        });
    },

    // Update user's online status
    updateStatus: async (userId, status) => {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            status,
            lastActive: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
    },

    // Update notification preferences
    updateNotificationPreferences: async (userId, preferences) => {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            'notificationPreferences': preferences,
            updatedAt: serverTimestamp()
        });
    },

    // Mark a notification as read
    markNotificationAsRead: async (notificationId) => {
        const notificationRef = doc(db, 'notifications', notificationId);
        await updateDoc(notificationRef, {
            status: NOTIFICATION_STATUS.READ,
            readAt: serverTimestamp()
        });
    }
};

import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '@/server/db/fireStore';
import { NOTIFICATION_TYPES, NOTIFICATION_SCOPES, NOTIFICATION_STATUS } from './notificationTypes';

export const NotificationManager = {
    // Create a notification for specific users
    createDirectNotification: async (userId, data) => {
        const notificationsRef = collection(db, 'notifications');
        return addDoc(notificationsRef, {
            ...data,
            userId,
            status: NOTIFICATION_STATUS.UNREAD,
            createdAt: serverTimestamp(),
            scope: {
                type: NOTIFICATION_SCOPES.PERSONAL,
                value: userId
            }
        });
    },

    // Create notifications for users in a specific scope
    createScopedNotification: async (scope, scopeValue, data) => {
        const usersRef = collection(db, 'users');
        const notificationsRef = collection(db, 'notifications');
        
        // Query users based on scope
        let userQuery;
        switch(scope) {
            case NOTIFICATION_SCOPES.LGA:
                userQuery = query(usersRef, where('lga', '==', scopeValue));
                break;
            case NOTIFICATION_SCOPES.STATE:
                userQuery = query(usersRef, where('state', '==', scopeValue));
                break;
            case NOTIFICATION_SCOPES.NATIONAL:
                userQuery = query(usersRef, where('country', '==', 'Nigeria'));
                break;
            default:
                throw new Error('Invalid scope');
        }

        const usersSnapshot = await getDocs(userQuery);
        
        // Create notifications for all users in scope
        const notificationPromises = usersSnapshot.docs.map(userDoc => 
            addDoc(notificationsRef, {
                ...data,
                userId: userDoc.id,
                status: NOTIFICATION_STATUS.UNREAD,
                createdAt: serverTimestamp(),
                scope: {
                    type: scope,
                    value: scopeValue
                }
            })
        );

        return Promise.all(notificationPromises);
    },

    // Helper function to create news notifications
    createNewsNotification: async (newsData, scope, author) => {
        const notificationData = {
            type: NOTIFICATION_TYPES.NEWS,
            title: `New ${newsData.category}: ${newsData.title}`,
            message: newsData.snippet,
            contentId: newsData.id,
            actionUrl: `/news/${newsData.id}`,
            author: {
                id: author.id,
                name: author.name,
                role: author.role
            }
        };

        if (scope.lga) {
            return NotificationManager.createScopedNotification(
                NOTIFICATION_SCOPES.LGA,
                scope.lga,
                notificationData
            );
        } else if (scope.state) {
            return NotificationManager.createScopedNotification(
                NOTIFICATION_SCOPES.STATE,
                scope.state,
                notificationData
            );
        } else {
            return NotificationManager.createScopedNotification(
                NOTIFICATION_SCOPES.NATIONAL,
                'Nigeria',
                notificationData
            );
        }
    },

    // Helper function to create chat notifications
    createChatNotification: async (recipientId, message, sender) => {
        return NotificationManager.createDirectNotification(recipientId, {
            type: NOTIFICATION_TYPES.CHAT,
            title: `New message from ${sender.name}`,
            message: message.substring(0, 100) + (message.length > 100 ? '...' : ''),
            contentId: sender.id,
            actionUrl: `user/tools/chat/${sender.id}`,
            author: sender
        });
    }
};

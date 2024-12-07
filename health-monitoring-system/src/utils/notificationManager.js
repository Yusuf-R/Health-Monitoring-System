import { collection, addDoc, query, where, getDocs, serverTimestamp, doc, updateDoc, writeBatch } from 'firebase/firestore';
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
            actionUrl: `/user/info-hub/news/${newsData.id}`,
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
            actionUrl: `/user/tools/chat/${sender.id}`,
            author: sender
        });
    },

    // Helper function to create feed notifications
    createFeedNotification: async (feedData, scope, author) => {
        const notificationData = {
            type: NOTIFICATION_TYPES.FEED,
            title: `New ${feedData.type}: ${feedData.title}`,
            message: feedData.snippet,
            contentId: feedData.id,
            actionUrl: `/user/info-hub/feeds/${feedData.id}`,
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


    createTipNotification: async function(tip, author) {
        try {
            const notificationsRef = collection(db, 'notifications');
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('notificationPreferences.tipsGuides', '==', true));
            const querySnapshot = await getDocs(q);

            const batch = writeBatch(db);

            querySnapshot.forEach((userDoc) => {
                const notificationData = {
                    userId: userDoc.id,
                    type: 'new_tip',
                    title: 'New Tip/Guide Available',
                    message: `${tip.title} has been published in Tips & Guides`,
                    status: 'unread',
                    actionUrl: `/user/info-hub/tips-guides/${tip.id}`,
                    createdAt: serverTimestamp(),
                    contentId: tip.id,
                    contentType: 'tip',
                    category: tip.category,
                    author: {
                        id: author.id,
                        name: author.name,
                        role: author.role
                    }
                };

                const newNotificationRef = doc(notificationsRef);
                batch.set(newNotificationRef, notificationData);
            });

            await batch.commit();
            return true;
        } catch (error) {
            console.error('Error creating tip notification:', error);
            return false;
        }
    },

    // Helper function to create health check notifications
    createHealthCheckNotification: async (healthCheckData, author) => {
        const notificationData = {
            type: NOTIFICATION_TYPES.HEALTH_CHECK,
            title: `New Health Check: ${healthCheckData.title}`,
            message: healthCheckData.snippet,
            contentId: healthCheckData.id,
            actionUrl: `/user/personalized/health-check/${healthCheckData.id}`,
            metadata: {
                category: healthCheckData.category,
                healthCheckId: healthCheckData.id
            },
            author: {
                id: author.id,
                name: author.name,
                role: author.role
            }
        };

        // Create notification for all users since health checks are important
        return NotificationManager.createScopedNotification(
            NOTIFICATION_SCOPES.NATIONAL,
            'Nigeria',
            notificationData
        );
    },
};

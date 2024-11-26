import { db } from '@/server/db/fireStore';
import {collection, addDoc, query, where, onSnapshot, serverTimestamp, updateDoc, doc} from 'firebase/firestore';
import { toast } from 'sonner';

class NotificationService {
    static async createNotification(notification) {
        try {
            const notificationRef = collection(db, 'notifications');
            await addDoc(notificationRef, {
                ...notification,
                timestamp: serverTimestamp()
            });
        } catch (error) {
            console.error('Error creating notification:', error);
            throw error;
        }
    }

    static subscribeToNotifications(userId, callback) {
        const notificationsRef = collection(db, 'notifications');
        const q = query(notificationsRef, where('userId', '==', userId));

        return onSnapshot(q, (snapshot) => {
            const notifications = [];
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    const notification = {
                        id: change.doc.id,
                        ...change.doc.data()
                    };
                    notifications.push(notification);
                    
                    // Show toast for new notifications
                    toast(notification.title, {
                        description: notification.message,
                        action: {
                            label: "View",
                            onClick: () => callback(notification)
                        },
                    });
                }
            });

            // Update notification count or UI
            if (notifications.length > 0) {
                callback(notifications);
            }
        });
    }

    static async markAsRead(notificationId) {
        try {
            const notificationRef = doc(db, 'notifications', notificationId);
            await updateDoc(notificationRef, {
                status: 'read',
                readAt: serverTimestamp()
            });
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    }

    // Helper method to create different types of notifications
    static async sendMedicalReviewNotification({
        userId,
        reviewerId,
        reviewerName,
        medicalHistoryId,
        message
    }) {
        const notification = {
            userId,
            type: 'medical_review',
            title: 'Medical Review Update',
            message,
            relatedTo: {
                model: 'MedicalHistory',
                id: medicalHistoryId
            },
            sender: {
                id: reviewerId,
                role: 'HealthWorker',
                name: reviewerName
            },
            priority: 'high',
            actionRequired: true,
            actionUrl: `/medical-history/${medicalHistoryId}`
        };

        await this.createNotification(notification);
    }
}

export default NotificationService;

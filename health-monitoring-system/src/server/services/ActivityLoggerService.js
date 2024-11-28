import { db } from '@/server/db/fireStore';
import { collection, query, where, getDocs, addDoc, Timestamp } from 'firebase/firestore';

export class ActivityLoggerService {
    static async checkAndSendDailyLoggerNotification(userId) {
        try {
            // Check if we've already sent a notification today
            const notificationsRef = collection(db, 'notifications');
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const q = query(
                notificationsRef,
                where('userId', '==', userId),
                where('type', '==', 'daily_logger_reminder'),
                where('createdAt', '>=', Timestamp.fromDate(today))
            );
            
            const querySnapshot = await getDocs(q);
            
            // If we haven't sent a notification today
            if (querySnapshot.empty) {
                // Check if user has logged activity today
                const activitiesRef = collection(db, 'dailyActivities');
                const activityQuery = query(
                    activitiesRef,
                    where('userId', '==', userId),
                    where('createdAt', '>=', Timestamp.fromDate(today))
                );
                
                const activitySnapshot = await getDocs(activityQuery);
                
                // If no activity logged today, send notification
                if (activitySnapshot.empty) {
                    await addDoc(notificationsRef, {
                        userId,
                        type: 'daily_logger_reminder',
                        title: 'Daily Health Log Reminder',
                        message: 'Don\'t forget to log your daily health activities. Keeping track helps us serve you better!',
                        status: 'unread',
                        createdAt: Timestamp.now(),
                        relatedTo: {
                            model: 'DailyActivity',
                            id: userId
                        },
                        sender: {
                            id: 'system',
                            role: 'System',
                            name: 'Health System'
                        }
                    });
                    
                    return true;
                }
            }
            
            return false;
        } catch (error) {
            console.error('Error checking/sending daily logger notification:', error);
            return false;
        }
    }
}

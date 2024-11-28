import { db } from '@/server/db/fireStore';
import { collection, query, where, getDocs, addDoc, Timestamp, doc, getDoc } from 'firebase/firestore';
import { format } from 'date-fns';

export class ActivityLoggerService {
    static async checkAndSendDailyLoggerNotification(userId) {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            // Check if we've already sent a notification today
            const notificationsRef = collection(db, 'notifications');
            const notificationQuery = query(
                notificationsRef,
                where('userId', '==', userId),
                where('type', '==', 'daily_logger_reminder'),
                where('createdAt', '>=', Timestamp.fromDate(today))
            );
            
            const notificationSnapshot = await getDocs(notificationQuery);
            
            // If we haven't sent a notification today
            if (notificationSnapshot.empty) {
                // Check if user has logged any activity today
                const currentDay = format(new Date(), 'yyyy-MM-dd');
                const activityDocRef = doc(db, 'loggedActivities', `${userId}_${currentDay}`);
                const activityDoc = await getDoc(activityDocRef);
                
                // If no activity logged today, send notification
                if (!activityDoc.exists()) {
                    await addDoc(notificationsRef, {
                        userId,
                        type: 'daily_logger_reminder',
                        title: 'Daily Health Check-in',
                        message: 'Don\'t forget to log your daily health activities. Track your water intake, steps, exercise, sleep, and fruit consumption to maintain a healthy lifestyle!',
                        status: 'unread',
                        createdAt: Timestamp.now(),
                        actionUrl: '/user/personalized/logger/activity-tracker',
                        priority: 'high'
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

    static async hasLoggedToday(userId) {
        try {
            const currentDay = format(new Date(), 'yyyy-MM-dd');
            const activityDocRef = doc(db, 'loggedActivities', `${userId}_${currentDay}`);
            const activityDoc = await getDoc(activityDocRef);
            
            return activityDoc.exists();
        } catch (error) {
            console.error('Error checking daily activity:', error);
            return false;
        }
    }
}

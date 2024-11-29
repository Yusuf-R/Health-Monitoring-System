import React, { useEffect, useState } from 'react';
import { Badge, IconButton, Menu, MenuItem } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import {collection, query, where, onSnapshot, updateDoc} from 'firebase/firestore';
import { db } from '@/server/db/fireStore';
import {useRouter} from "next/navigation";

export default function NotificationBell({ userId }) {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [anchorEl, setAnchorEl] = useState(null);
    const router = useRouter();

    useEffect(() => {
        // Listen for new notifications in Firebase
        const notificationsRef = collection(db, 'notifications');
        const q = query(notificationsRef, where('userId', '==', userId));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    const newNotification = {
                        id: change.doc.id,
                        ...change.doc.data()
                    };
                    setNotifications(prev => [newNotification, ...prev]);
                    if (newNotification.status === 'unread') {
                        setUnreadCount(count => count + 1);
                    }
                }
            });
        });

        return () => unsubscribe();
    }, [userId]);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleNotificationClick = (notification) => {
        // Mark as read
        const notificationRef = doc(db, 'notifications', notification.id);
        updateDoc(notificationRef, { status: 'read' });
        setUnreadCount(count => count - 1);

        // Navigate to the relevant page
        if (notification.actionUrl) {
            router.push(notification.actionUrl);
        }
        handleClose();
    };

    return (
        <>
            <IconButton onClick={handleClick}>
                <Badge badgeContent={unreadCount} color="error">
                    <NotificationsIcon />
                </Badge>
            </IconButton>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
            >
                {notifications.length === 0 ? (
                    <MenuItem>No notifications</MenuItem>
                ) : (
                    notifications.map(notification => (
                        <MenuItem 
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification)}
                            sx={{
                                backgroundColor: notification.status === 'unread' ? 
                                    'rgba(25, 118, 210, 0.08)' : 'transparent'
                            }}
                        >
                            <div>
                                <strong>{notification.title}</strong>
                                <p>{notification.message}</p>
                            </div>
                        </MenuItem>
                    ))
                )}
            </Menu>
        </>
    );
}

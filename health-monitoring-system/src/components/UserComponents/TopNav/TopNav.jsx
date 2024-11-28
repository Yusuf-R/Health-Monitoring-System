
"use client";
import React, {useEffect, useState} from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import Divider from "@mui/material/Divider";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import {useMutation} from "@tanstack/react-query";
import {toast} from "sonner";
import AdminUtils from "@/utils/AdminUtils";
import {signOut} from 'next-auth/react';
import {CircularProgress} from "@mui/material";
import {collection, doc, onSnapshot, updateDoc, query, where, orderBy, serverTimestamp} from "firebase/firestore";
import {db} from "@/server/db/fireStore";
import Badge from "@mui/material/Badge";
import Drawer from "@mui/material/Drawer";
import {Circle as UnreadIcon, Close as CloseIcon, Notifications as NotificationsIcon,} from "@mui/icons-material";
import {usePathname, useRouter} from "next/navigation";
import ListItem from "@mui/material/ListItem";
import List from "@mui/material/List";
import ListItemText from "@mui/material/ListItemText";
import { format } from 'date-fns';

function TopNav({onToggleSideNav, userProfile}) {
    const [anchorEl, setAnchorEl] = useState(null);
    const [confirmExit, setConfirmExit] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const [notificationsEl, setNotificationsEl] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const router = useRouter();
    const pathname = usePathname();

    const formatTimestamp = (timestamp) => {
        if (!timestamp || !timestamp.toDate) {
            return 'Just now';
        }
        try {
            return format(timestamp.toDate(), 'MMM d, h:mm a');
        } catch (error) {
            console.error('Error formatting timestamp:', error);
            return 'Invalid date';
        }
    };

    // Fetch notifications in real-time
    useEffect(() => {
        if (!userProfile?._id) return;

        const notificationsRef = collection(db, "notifications");
        const q = query(
            notificationsRef,
            where("userId", "==", userProfile._id),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedNotifications = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setNotifications(fetchedNotifications);
            setUnreadCount(fetchedNotifications.filter((n) => n.status === 'unread').length);
        });

        return () => unsubscribe();
    }, [userProfile?._id]);

    // Mark a single notification as read
    const handleMarkAsRead = async (notificationId) => {
        try {
            const notificationRef = doc(db, "notifications", notificationId);
            await updateDoc(notificationRef, {
                status: 'read',
                readAt: serverTimestamp()
            });

            // If notification has a link, navigate to it
            const notification = notifications.find(n => n.id === notificationId);
            if (notification?.link) {
                router.push(notification.link);
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
            toast.error('Failed to mark notification as read');
        }
    };

    // Mark all notifications as read
    const handleMarkAllAsRead = async () => {
        try {
            const unreadNotifications = notifications.filter(n => n.status === 'unread');
            const batchPromises = unreadNotifications.map((n) =>
                updateDoc(doc(db, "notifications", n.id), {
                    status: 'read',
                    readAt: serverTimestamp()
                })
            );
            await Promise.all(batchPromises);
            toast.success('All notifications marked as read');
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            toast.error('Failed to mark notifications as read');
        }
    };

    // Delete a notification
    const handleDeleteNotification = async (notificationId) => {
        try {
            const notificationRef = doc(db, "notifications", notificationId);
            await updateDoc(notificationRef, {
                status: 'archived',
                archivedAt: serverTimestamp()
            });
            toast.success('Notification archived');
        } catch (error) {
            console.error('Error archiving notification:', error);
            toast.error('Failed to archive notification');
        }
    };

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleSettings = () => {
        setAnchorEl(null); // Close the dropdown menu when logout is clicked
        router.push('/user/settings');
    }

    const handleProfile = () => {
        router.push('/user/settings/profile');
        setAnchorEl(null); // Close the dropdown menu when logout is clicked
    }

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogoutClick = async () => {
        setConfirmExit(true);
        setAnchorEl(null); // Close the dropdown menu when logout is clicked
    };

    const mutation = useMutation({
        mutationKey: ['Logout'],
        mutationFn: AdminUtils.userLogout,
        onSuccess: async () => {
            await signOut({callbackUrl: '/authorization/user'}); // Redirects after logout
            toast.success('Logged out successfully');
            setConfirmExit(false); // Close dialog
            setLoggingOut(false);
        },
        onError: (error) => {
            console.error('Logout error:', error);
            toast.error('Logout failed. Please try again.');
            setLoggingOut(false);
        },
    });

    const handleLogout = () => {
        try {
            setLoggingOut(true);
            mutation.mutate();
        } catch (err) {
            console.error('Logout error:', err);
            toast.error('Logout failed. Please try again.');
            setLoggingOut(false);
        }
    };

    return (
        <>
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    p: 1,
                    boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                    background: "linear-gradient(to right, #1e3c72, #2a5298)",
                    color: "#FFF",
                }}
            >
                {/* Left Section */}
                <Box sx={{display: "flex", alignItems: "center", gap: 2}}>
                    <Avatar src="/logo.svg" alt="CHMS" sx={{width: 50, height: 50}}/>
                    <Typography variant="button" sx={{color: "#FFF"}}>
                        Community <br/> Health Monitoring System
                    </Typography>
                    <IconButton
                        aria-label="Toggle sidebar"
                        onClick={onToggleSideNav}
                        sx={{color: "#FFF"}}
                    >
                        <MenuIcon/>
                    </IconButton>
                </Box>

                {/* Right Section */}
                <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
                    {/* Notifications */}
                    <IconButton
                        aria-label="Notifications"
                        onClick={() => setNotificationsEl(true)}
                        sx={{color: "#FFF"}}
                    >
                        <Badge badgeContent={unreadCount} color="error">
                            <NotificationsIcon/>
                        </Badge>
                    </IconButton>
                    <Avatar
                        src={userProfile.avatar || "/av-1.svg"}
                        alt="User Avatar"
                        sx={{width: 50, height: 50}}
                    />
                    <Box sx={{textAlign: "left"}}>
                        <Typography variant="body1" sx={{fontWeight: "bold", color: '#FFF'}}>
                            {userProfile.firstName || "User Name"}
                        </Typography>
                        <Typography variant="body2" color="#FFF">
                            Profile
                        </Typography>
                    </Box>
                    <IconButton aria-label="Open profile menu" onClick={handleMenuOpen}>
                        <ArrowDropDownIcon sx={{color: '#FFF'}}/>
                    </IconButton>

                    {/* Dropdown Menu */}
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                        PaperProps={{
                            elevation: 3,
                            sx: {mt: 1.5, overflow: "visible"},
                        }}
                    >
                        <MenuItem onClick={handleProfile}>
                            <ListItemIcon>
                                <PersonIcon fontSize="small"/>
                            </ListItemIcon>
                            Profile
                        </MenuItem>
                        <MenuItem onClick={handleSettings}>
                            <ListItemIcon>
                                <SettingsIcon fontSize="small"/>
                            </ListItemIcon>
                            Settings
                        </MenuItem>
                        <Divider/>
                        <MenuItem onClick={() => setConfirmExit(true)}>
                            <ListItemIcon>
                                <LogoutIcon fontSize="small"/>
                            </ListItemIcon>
                            Logout
                        </MenuItem>
                    </Menu>
                </Box>

                {/* Logout Confirmation Dialog */}
                <Dialog open={confirmExit} onClose={() => setConfirmExit(false)}>
                    <DialogTitle>Confirm Logout</DialogTitle>
                    <DialogContent>
                        <DialogContentText>Are you sure you want to logout?</DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setConfirmExit(false)} variant="contained" color="success">
                            No
                        </Button>
                        <Button
                            variant="contained"
                            color="error"
                            onClick={(e) => {
                                if (loggingOut) e.preventDefault();
                                else handleLogout();
                            }}
                            endIcon={loggingOut && <CircularProgress size={20} color="inherit"/>}
                            sx={{
                                ...(loggingOut && {
                                    pointerEvents: 'none',
                                    opacity: 1,
                                }),
                            }}
                        >
                            {loggingOut ? 'Logging out...' : 'Yes'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Notifications Drawer */}
                <Drawer
                    anchor="right"
                    open={notificationsEl}
                    onClose={() => setNotificationsEl(false)}
                    PaperProps={{
                        sx: {
                            width: { xs: '100%', sm: 380 },
                            background: '#f8fafc'
                        }
                    }}
                >
                    <Box
                        sx={{
                            p: 2.5,
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                            background: '#fff'
                        }}
                    >
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: unreadCount > 0 ? 1 : 0
                        }}>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 600,
                                    color: 'text.primary'
                                }}
                            >
                                Notifications
                            </Typography>
                            <IconButton
                                size="small"
                                onClick={() => setNotificationsEl(false)}
                                sx={{
                                    color: 'text.secondary',
                                    '&:hover': {
                                        background: 'rgba(0,0,0,0.04)'
                                    }
                                }}
                            >
                                <CloseIcon />
                            </IconButton>
                        </Box>
                        {unreadCount > 0 && (
                            <Button
                                size="small"
                                onClick={handleMarkAllAsRead}
                                sx={{
                                    fontSize: '0.8125rem',
                                    color: 'primary.main',
                                    '&:hover': {
                                        background: 'rgba(25, 118, 210, 0.04)'
                                    }
                                }}
                            >
                                Mark all as read
                            </Button>
                        )}
                    </Box>

                    <List sx={{
                        p: 0,
                        height: 'calc(100% - 73px)',
                        overflowY: 'auto',
                        '&::-webkit-scrollbar': {
                            width: '6px',
                        },
                        '&::-webkit-scrollbar-thumb': {
                            backgroundColor: 'rgba(0,0,0,0.2)',
                            borderRadius: '3px',
                        }
                    }}>
                        {notifications.length === 0 ? (
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    height: '100%',
                                    p: 3,
                                    textAlign: 'center'
                                }}
                            >
                                <NotificationsIcon
                                    sx={{
                                        fontSize: 48,
                                        color: 'text.disabled',
                                        mb: 1
                                    }}
                                />
                                <Typography
                                    variant="h6"
                                    sx={{
                                        color: 'text.primary',
                                        mb: 0.5
                                    }}
                                >
                                    No Notifications
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    You're all caught up! Check back later for new notifications.
                                </Typography>
                            </Box>
                        ) : (
                            notifications.map((notification) => (
                                <ListItem
                                    key={notification.id}
                                    sx={{
                                        px: 2.5,
                                        py: 2,
                                        borderBottom: '1px solid',
                                        borderColor: 'divider',
                                        bgcolor: notification.status === 'unread'
                                            ? 'rgba(25, 118, 210, 0.04)'
                                            : '#fff',
                                        transition: 'background-color 0.2s',
                                        '&:hover': {
                                            bgcolor: 'rgba(0,0,0,0.02)',
                                            cursor: 'pointer'
                                        }
                                    }}
                                    onClick={() => notification.status === 'unread' && handleMarkAsRead(notification.id)}
                                >
                                    <Box sx={{ width: '100%' }}>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'flex-start',
                                                mb: 0.5
                                            }}
                                        >
                                            <Typography
                                                variant="subtitle2"
                                                sx={{
                                                    fontWeight: notification.status === 'unread' ? 600 : 500,
                                                    color: 'text.primary',
                                                    pr: 2
                                                }}
                                            >
                                                {notification.title}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    color: 'text.secondary',
                                                    whiteSpace: 'nowrap'
                                                }}
                                            >
                                                {formatTimestamp(notification.createdAt)}
                                            </Typography>
                                        </Box>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: 'text.secondary',
                                                mb: 1,
                                                lineHeight: 1.5
                                            }}
                                        >
                                            {notification.message}
                                        </Typography>
                                        <Box sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            {notification.actionUrl && (
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        router.push(notification.actionUrl);
                                                        setNotificationsEl(false);
                                                    }}
                                                    sx={{
                                                        textTransform: 'none',
                                                        borderRadius: 1.5
                                                    }}
                                                >
                                                    View Details
                                                </Button>
                                            )}
                                            <Box sx={{ ml: 'auto' }}>
                                                {notification.status === 'unread' && (
                                                    <IconButton
                                                        size="small"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleMarkAsRead(notification.id);
                                                        }}
                                                        sx={{
                                                            mr: 1,
                                                            color: 'primary.main'
                                                        }}
                                                    >
                                                        <UnreadIcon sx={{ fontSize: 12 }} />
                                                    </IconButton>
                                                )}
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteNotification(notification.id);
                                                    }}
                                                    sx={{
                                                        color: 'text.secondary',
                                                        '&:hover': {
                                                            color: 'error.main'
                                                        }
                                                    }}
                                                >
                                                    <CloseIcon sx={{ fontSize: 16 }} />
                                                </IconButton>
                                            </Box>
                                        </Box>
                                    </Box>
                                </ListItem>
                            ))
                        )}
                    </List>
                </Drawer>
            </Box>
        </>
    )
        ;
}

export default TopNav;

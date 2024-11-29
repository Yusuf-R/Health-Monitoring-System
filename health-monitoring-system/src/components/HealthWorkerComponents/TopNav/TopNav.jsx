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
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {toast} from "sonner";
import AdminUtils from "@/utils/AdminUtils";
import {signOut} from 'next-auth/react';
import {CircularProgress} from "@mui/material";
import {collection, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc, where} from "firebase/firestore";
import {db} from "@/server/db/fireStore";
import Badge from "@mui/material/Badge";
import Drawer from "@mui/material/Drawer";
import {Circle as UnreadIcon, Close as CloseIcon, Notifications as NotificationsIcon,} from "@mui/icons-material";
import {usePathname, useRouter} from "next/navigation";
import ListItem from "@mui/material/ListItem";
import List from "@mui/material/List";
import {format} from 'date-fns';

function TopNav({onToggleSideNav, healthWorkerProfile}) {
    const [anchorEl, setAnchorEl] = useState(null);
    const [statusAnchorEl, setStatusAnchorEl] = useState(null);
    const [confirmExit, setConfirmExit] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const [notificationsEl, setNotificationsEl] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const router = useRouter();
    const [status, setStatus] = useState("offline"); // Default to offline
    const pathname = usePathname();
    const queryClient = useQueryClient();

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

    // Status color mapping
    const statusColors = {
        online: '#4CAF50',  // Green
        offline: '#f44336', // Red
        busy: '#ff9800'     // Yellow
    };

    // Listen to Firestore for real-time status updates
    useEffect(() => {
        if (!healthWorkerProfile?._id) {
            console.error("Health worker ID is missing");
            return;
        }

        const healthWorkerRef = doc(db, "healthWorkers", healthWorkerProfile._id);

        // Subscribe to Firestore document changes
        const unsubscribe = onSnapshot(healthWorkerRef, (docSnapshot) => {
            if (docSnapshot.exists()) {
                const data = docSnapshot.data();
                setStatus(data.status || "offline"); // Update the status state
            } else {
                console.warn("No document found for health worker in Firestore");
                setStatus("offline");
            }
        });

        // Cleanup subscription on component unmount
        return () => unsubscribe();
    }, [healthWorkerProfile?._id]);

    // Update health worker status
    const updateStatus = async (newStatus) => {
        if (!healthWorkerProfile?._id) {
            console.error('Invalid health worker profile:', healthWorkerProfile);
            return;
        }
        try {
            const healthWorkerRef = doc(db, "healthWorkers", healthWorkerProfile._id);

            await updateDoc(healthWorkerRef, {
                status: newStatus,
                lastUpdated: serverTimestamp()
            });

            setStatusAnchorEl(null);
            toast.success(`Status updated to ${newStatus}`, {
                style: {
                    backgroundColor: statusColors[newStatus],
                    color: '#fff'
                }
            });
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        }
    };

    // Handle status click
    const handleStatusClick = (event) => {
        setStatusAnchorEl(event.currentTarget);
        handleMenuClose();
    };

    // Handle status close
    const handleStatusClose = () => {
        setStatusAnchorEl(null);
    };

    // Handle logout with status update
    const handleLogout = async () => {
        try {
            setLoggingOut(true);

            // Update status to offline before logging out
            if (healthWorkerProfile?._id) {
                const healthWorkerRef = doc(db, "healthWorkers", healthWorkerProfile._id);
                await updateDoc(healthWorkerRef, {
                    status: 'offline',
                    lastUpdated: serverTimestamp()
                });
            }

            mutation.mutate();
        } catch (err) {
            console.error('Logout error:', err);
            toast.error('Logout failed. Please try again.');
            setLoggingOut(false);
        }
    };

    // Fetch notifications in real-time
    useEffect(() => {
        if (!healthWorkerProfile?._id) {
            return;
        }

        const notificationsRef = collection(db, "notifications");
        const q = query(
            notificationsRef,
            where("userId", "==", healthWorkerProfile._id),
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
    }, [healthWorkerProfile?._id]);

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
        router.push('/health-worker/settings');
    }

    const handleProfile = () => {
        router.push('/health-worker/settings/profile');
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
        mutationFn: AdminUtils.healthWorkerLogout,
        onSuccess: async () => {
            await signOut({callbackUrl: '/authorization/health-worker'}); // Redirects after logout
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

                    <Box sx={{textAlign: "left", display: "block", alignItems: "center", gap: 1}}>
                        <Typography variant="body1" sx={{fontWeight: "bold", color: '#FFF'}}>
                            Hi {healthWorkerProfile?.firstName || "HealthWorker"}
                        </Typography>
                        <Box
                            onClick={handleStatusClick}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                cursor: 'pointer',
                                '&:hover': {opacity: 0.8}
                            }}
                        >
                            <Box
                                sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    backgroundColor: statusColors[status],
                                    mr: 1
                                }}
                            />
                            <Typography variant="body2" color="#FFF" sx={{textTransform: 'capitalize'}}>
                                {status}
                            </Typography>
                            <ArrowDropDownIcon sx={{color: '#FFF'}}/>
                        </Box>
                    </Box>
                    {/* Notifications Bell */}
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
                        src={healthWorkerProfile?.avatar || "/av-1.svg"}
                        alt="User Avatar"
                        sx={{width: 50, height: 50}}
                    />

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

                    {/* Status Menu */}
                    <Menu
                        anchorEl={statusAnchorEl}
                        open={Boolean(statusAnchorEl)}
                        onClose={handleStatusClose}
                        PaperProps={{
                            elevation: 3,
                            sx: { mt: 1.5, p: 0.5},
                        }}
                    >
                        {status === 'online' ? (
                            [
                                <MenuItem key="busy" onClick={() => updateStatus('busy')}>
                                    <Box
                                        sx={{
                                            width: 8,
                                            height: 8,
                                            borderRadius: '50%',
                                            mr: 1, // Margin to separate the dot from the text
                                            background: statusColors.busy, // Only applies color to the dot

                                        }}
                                    />
                                    Busy
                                </MenuItem>,
                            ]
                        ) : (
                            [
                                <MenuItem key="online" onClick={() => updateStatus('online')}>
                                    <Box
                                        sx={{
                                            width: 8,
                                            height: 8,
                                            borderRadius: '50%',
                                            mr: 1, // Margin to separate the dot from the text
                                            background: statusColors.online, // Only applies color to the dot
                                        }}
                                    />
                                    Online
                                </MenuItem>,
                            ]
                        )}
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
                            width: {xs: '100%', sm: 380},
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
                            alignItems: 'flex-start',
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
                                <CloseIcon/>
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
                                    <Box sx={{width: '100%'}}>
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
                                            <Box sx={{ml: 'auto'}}>
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
                                                        <UnreadIcon sx={{fontSize: 12}}/>
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
                                                    <CloseIcon sx={{fontSize: 16}}/>
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

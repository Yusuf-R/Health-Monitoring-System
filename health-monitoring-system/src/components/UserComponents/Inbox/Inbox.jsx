"use client";
import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    IconButton,
    Button,
    Grid,
    ToggleButton,
    ToggleButtonGroup,
    Chip,
    Tooltip,
    Divider,
    Menu,
    MenuItem,
    Stack,
    Paper,
    Container,
    Tabs,
    Tab,
    Badge,
    useTheme,
    alpha,
    CircularProgress
} from '@mui/material';
import {
    GridView as GridViewIcon,
    ViewList as ListViewIcon,
    Delete as DeleteIcon,
    Archive as ArchiveIcon,
    MarkEmailRead as MarkReadIcon,
    MoreVert as MoreVertIcon,
    Circle as UnreadIcon,
    Notifications as NotificationsIcon,
    Chat as ChatIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { db } from "@/server/db/fireStore";
import { collection, query, where, orderBy, onSnapshot, updateDoc, doc, serverTimestamp, addDoc, getDocs } from "firebase/firestore";
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import ListItemIcon from "@mui/material/ListItemIcon";

const tabConfig = [
    {
        label: "Notifications",
        icon: NotificationsIcon,
        value: "notifications"
    },
    {
        label: "Messages",
        icon: ChatIcon,
        value: "messages"
    }
];

const Inbox = ({ userProfile }) => {
    const [viewMode, setViewMode] = useState('grid');
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [selectedTab, setSelectedTab] = useState("notifications");
    const [notifications, setNotifications] = useState([]);
    const [messages, setMessages] = useState([]);
    const [unreadNotifications, setUnreadNotifications] = useState(0);
    const [unreadMessages, setUnreadMessages] = useState(0);
    const [loadingMessageId, setLoadingMessageId] = useState(null);
    const theme = useTheme();
    const router = useRouter();

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

    // notifications useEffect
    useEffect(() => {
        if (!userProfile?._id) {
            return;
        }

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
            setUnreadNotifications(
                fetchedNotifications.filter(n => n.status === 'unread').length
            );

            const newMessageNotifications = fetchedNotifications.filter(
                n => n.type === 'new_message' && n.status === 'unread'
            );

            if (newMessageNotifications.length > 0) {
                console.log('New message notifications:', newMessageNotifications);
            }
        });

        return () => unsubscribe();
    }, [userProfile?._id]);

    // message useEffect
    useEffect(() => {
        if (!userProfile?._id) {
            return;
        }

        const messagesRef = collection(db, "messages");
        const q = query(
            messagesRef,
            where("receiverId", "==", userProfile._id),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedMessages = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setMessages(fetchedMessages);

            // Count only messages that are unread
            const unreadCount = fetchedMessages.filter(m => m.status === 'unread').length;
            setUnreadMessages(unreadCount);
        });

        return () => unsubscribe();
    }, [userProfile?._id]);

    const handleViewChange = (event, newView) => {
        if (newView !== null) {
            setViewMode(newView);
        }
    };

    const handleMenuOpen = (event, notification) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
        setSelectedNotification(notification);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedNotification(null);
    };

    const handleAction = (action) => {
        if (!selectedNotification) {
            return;
        }

        switch (action) {
            case 'read':
                handleMarkAsRead(selectedNotification.id);
                break;
            case 'archive':
                handleArchive(selectedNotification.id);
                break;
            case 'delete':
                handleDelete(selectedNotification.id);
                break;
        }
        handleMenuClose();
    };

    const NotificationCard = ({ notification, isGridView }) => (
        <Card
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer',
                ...(notification.status === 'unread' && {
                    bgcolor: 'rgba(25, 118, 210, 0.04)',
                }),
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 3,
                }
            }}
            onClick={() => notification.status === 'unread' && handleMarkAsRead(notification.id)}
        >
            <CardContent sx={{ p: isGridView ? 2 : 2.5, flex: 1 }}>
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    mb: 1.5
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {notification.status === 'unread' && (
                            <UnreadIcon
                                sx={{
                                    fontSize: 12,
                                    color: 'primary.main'
                                }}
                            />
                        )}
                        <Typography
                            variant="subtitle1"
                            sx={{
                                fontWeight: notification.status === 'unread' ? 600 : 500,
                                color: 'text.primary'
                            }}
                        >
                            {notification.title}
                        </Typography>
                    </Box>
                    <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, notification)}
                        sx={{ color: 'text.secondary' }}
                    >
                        <MoreVertIcon fontSize="small" />
                    </IconButton>
                </Box>

                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        mb: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: isGridView ? 3 : 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: 1.5
                    }}
                >
                    {notification.message}
                </Typography>

                <Box sx={{
                    mt: 'auto',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <Typography
                        variant="caption"
                        sx={{ color: 'text.secondary' }}
                    >
                        {formatTimestamp(notification.createdAt)}
                    </Typography>
                    {notification.type && (
                        <Chip
                            label={notification.type}
                            size="small"
                            sx={{
                                height: 24,
                                fontSize: '0.75rem',
                                bgcolor: 'rgba(25, 118, 210, 0.08)',
                                color: 'primary.main'
                            }}
                        />
                    )}
                </Box>
            </CardContent>
        </Card>
    );

    const MessageCard = ({ message }) => (
        <Card
            sx={{
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer',
                bgcolor: message.status === 'unread' ? alpha(theme.palette.primary.light, 0.15) : 'background.paper',
                borderLeft: message.status === 'unread' ? `4px solid ${theme.palette.primary.main}` : 'none',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 3,
                    bgcolor: message.status === 'unread' ? alpha(theme.palette.primary.light, 0.2) : alpha(theme.palette.background.paper, 0.9),
                }
            }}
            onClick={() => handleOpenMessage(message)}
        >
            {loadingMessageId === message.id && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'rgba(255, 255, 255, 0.8)',
                        zIndex: 1,
                    }}
                >
                    <CircularProgress size={40} />
                </Box>
            )}
            <CardContent sx={{ p: viewMode === 'grid' ? 2 : 2.5, flex: 1 }}>
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    mb: 1.5
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {message.status === 'unread' && (
                            <UnreadIcon
                                sx={{
                                    fontSize: 12,
                                    color: theme.palette.primary.main
                                }}
                            />
                        )}
                        <Typography
                            variant="subtitle1"
                            sx={{
                                fontWeight: message.status === 'unread' ? 600 : 500,
                                color: message.status === 'unread' ? theme.palette.primary.main : 'text.primary'
                            }}
                        >
                            {message.senderName || "Unknown Sender"}
                        </Typography>
                    </Box>
                    <Typography
                        variant="caption"
                        sx={{
                            color: message.status === 'unread' ? theme.palette.primary.main : 'text.secondary',
                            fontWeight: message.status === 'unread' ? 500 : 400
                        }}
                    >
                        {formatTimestamp(message.createdAt)}
                    </Typography>
                </Box>

                <Typography
                    variant="body2"
                    sx={{
                        mb: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: viewMode === 'grid' ? 3 : 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: 1.5,
                        color: message.status === 'unread' ? 'text.primary' : 'text.secondary'
                    }}
                >
                    {message.content}
                </Typography>

                <Box sx={{
                    mt: 'auto',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <Chip
                        label={message.type || "Message"}
                        size="small"
                        sx={{
                            height: 24,
                            fontSize: '0.75rem',
                            bgcolor: message.status === 'unread' ? alpha(theme.palette.primary.main, 0.12) : alpha(theme.palette.grey[500], 0.12),
                            color: message.status === 'unread' ? theme.palette.primary.main : theme.palette.grey[700],
                            fontWeight: message.status === 'unread' ? 500 : 400
                        }}
                    />
                </Box>
            </CardContent>
        </Card>
    );

    const handleOpenMessage = async (message) => {
        setLoadingMessageId(message.id);
        try {
            await router.push(`/user/tools/inbox/message/${message.id}`);
        } finally {
            setLoadingMessageId(null);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            if (!id) return;

            const notificationRef = doc(db, "notifications", id);
            await updateDoc(notificationRef, {
                status: 'read',
                readAt: serverTimestamp()
            });

            // Update local state
            setNotifications(prev => prev.map(notif =>
                notif.id === id ? { ...notif, status: 'read' } : notif
            ));

            handleMenuClose();
            toast.success('Marked as read');
        } catch (error) {
            console.error('Error marking notification as read:', error);
            toast.error('Failed to mark as read');
        }
    };

    const handleArchive = async (id) => {
        try {
            const notificationRef = doc(db, "notifications", id);
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

    const handleDelete = async (id) => {
        try {
            const notificationRef = doc(db, "notifications", id);
            await updateDoc(notificationRef, {
                status: 'deleted',
                deletedAt: serverTimestamp()
            });
            toast.success('Notification deleted');
        } catch (error) {
            console.error('Error deleting notification:', error);
            toast.error('Failed to delete notification');
        }
    };

    return (
        <Container maxWidth="xl" sx={{ py: 0.5, m: 0 }}>
            <Paper
                elevation={3}
                sx={{
                    mb: 4,
                    bgcolor:  alpha('#fff', 0.1),
                    borderRadius: '8px',
                }}
            >
                <Tabs
                    value={selectedTab}
                    onChange={(e, newValue) => setSelectedTab(newValue)}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                        '& .MuiTabs-indicator': {
                            backgroundColor: '#46F0F9',
                        },
                        '& .MuiTab-root': {
                            minHeight: 60,
                            textTransform: 'none',
                            fontSize: '1rem',
                            fontWeight: 500,
                            color: '#FFF000',
                            '&.Mui-selected': {
                                color: '#46F0F9'
                            }
                        }
                    }}
                >
                    {tabConfig.map((tab) => (
                        <Tab
                            key={tab.value}
                            value={tab.value}
                            label={
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Badge
                                        badgeContent={tab.value === "notifications" ? unreadNotifications : unreadMessages}
                                        color="error"
                                    >
                                        <tab.icon sx={{ fontSize: 24 }} />
                                    </Badge>
                                    <Box component="span" sx={{ ml: 1 }}>
                                        {tab.label}
                                    </Box>
                                </Stack>
                            }
                        />
                    ))}
                </Tabs>
            </Paper>

            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3,
                color: '#FFF',

            }}>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {selectedTab === "notifications" ? "Notifications" : "Messages"}
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                    <ToggleButtonGroup
                        value={viewMode}
                        exclusive
                        onChange={handleViewChange}
                        size="small"
                        sx={{
                            bgcolor: 'background.paper',
                            '& .MuiToggleButton-root': {
                                px: 1.5
                            }
                        }}
                    >
                        <ToggleButton value="grid">
                            <Tooltip title="Grid View">
                                <GridViewIcon fontSize="small" />
                            </Tooltip>
                        </ToggleButton>
                        <ToggleButton value="list">
                            <Tooltip title="List View">
                                <ListViewIcon fontSize="small" />
                            </Tooltip>
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Stack>
            </Box>

            <Grid container spacing={2}>
                {selectedTab === "notifications" ? (
                    notifications.length === 0 ? (
                        <Grid item xs={12}>
                            <Box sx={{ textAlign: 'center', py: 8 }}>
                                <NotificationsIcon sx={{ fontSize: 48, color: '#FFCCAA', mb: 2 }} />
                                <Typography variant="h6" sx={{ color: '#FFF', mb: 1 }}>
                                    No notifications
                                </Typography>
                                <Typography variant="body2" sx={{color:"FFF"}}>
                                    You're all caught up! Check back later for new notifications.
                                </Typography>
                            </Box>
                        </Grid>
                    ) : (
                        notifications.map((notification) => (
                            <Grid
                                item
                                key={notification.id}
                                xs={12}
                                {...(viewMode === 'grid' ? {
                                    sm: 6,
                                    md: 4
                                } : {})}
                            >
                                <NotificationCard
                                    notification={notification}
                                    isGridView={viewMode === 'grid'}
                                />
                            </Grid>
                        ))
                    )
                ) : (
                    messages.length === 0 ? (
                        <Grid item xs={12}>
                            <Box sx={{ textAlign: 'center', py: 8 }}>
                                <ChatIcon sx={{ fontSize: 48, color: '#FFCCAA', mb: 2 }} />
                                <Typography variant="h6" sx={{ color: '#FFF', mb: 1 }}>
                                    No messages
                                </Typography>
                                <Typography variant="body2" sx={{color: "#FFF"}}>
                                    You don't have any messages yet.
                                </Typography>
                            </Box>
                        </Grid>
                    ) : (
                        messages.map((message) => (
                            <Grid
                                item
                                key={message.id}
                                xs={12}
                                {...(viewMode === 'grid' ? {
                                    sm: 6,
                                    md: 4
                                } : {})}
                            >
                                <MessageCard message={message} />
                            </Grid>
                        ))
                    )
                )}
            </Grid>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                slotProps={{
                    paper: {
                        elevation: 3,
                        sx: {
                            width: 200,
                            mt: 1
                        }
                    }
                }}
            >
                {selectedNotification?.status === 'unread' && (
                    <MenuItem onClick={() => handleAction('read')}>
                        <ListItemIcon>
                            <MarkReadIcon fontSize="small" />
                        </ListItemIcon>
                        Mark as read
                    </MenuItem>
                )}
                <MenuItem onClick={() => handleAction('archive')}>
                    <ListItemIcon>
                        <ArchiveIcon fontSize="small" />
                    </ListItemIcon>
                    Archive
                </MenuItem>
                <MenuItem onClick={() => handleAction('delete')}>
                    <ListItemIcon>
                        <DeleteIcon fontSize="small" color="error" />
                    </ListItemIcon>
                    <Typography color="error">Delete</Typography>
                </MenuItem>
            </Menu>
        </Container>
    );
};

export default Inbox;

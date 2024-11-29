'use client';

import React, { useState, useEffect } from 'react';
import {
    Container,
    Grid,
    Box,
    Typography,
    Paper,
    List,
    ListItem,
    ListItemButton,
    ListItemAvatar,
    ListItemText,
    Avatar,
    Divider,
    Badge,
    TextField,
    IconButton,
    CircularProgress,
    Tabs,
    Tab
} from '@mui/material';
import {
    Send as SendIcon,
    AttachFile as AttachFileIcon,
    Circle as CircleIcon,
    ArrowBack as ArrowBackIcon,
    Home as HomeIcon,
    Chat as ChatIcon,
    MedicalServices as MedicalServicesIcon,
    Notifications as NotificationsIcon
} from '@mui/icons-material';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, orderBy, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/server/db/fireStore';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

function ChatBox({ userProfile }) {
    const router = useRouter();
    const [selectedWorker, setSelectedWorker] = useState(null);
    const [healthWorkers, setHealthWorkers] = useState([]);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [activeChatId, setActiveChatId] = useState(null);
    const [activeTab, setActiveTab] = useState(0); // Default to Chat tab

    // Navigation tabs configuration
    const navigationTabs = [
        { icon: <ChatIcon />, label: 'Chat', onClick: () => setActiveTab(0) },
    ];

    // Fetch health workers
    useEffect(() => {
        const workersQuery = query(
            collection(db, 'healthWorkers'),
            where('status', '==', 'online')
        );

        const unsubscribe = onSnapshot(workersQuery, (snapshot) => {
            const workers = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setHealthWorkers(workers);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Handle chat creation/retrieval when worker is selected
    useEffect(() => {
        if (!selectedWorker || !userProfile) {
            return;
        }

        const findOrCreateChat = async () => {
            const chatsRef = collection(db, 'chats');
            const chatQuery = query(
                chatsRef,
                where('type', '==', 'medical_consultation'),
                where('participants', 'array-contains', {
                    userId: userProfile._id,
                    role: 'User',
                    name: userProfile.firstName,
                    status: userProfile.status || 'offline'
                })
            );

            const unsubscribe = onSnapshot(chatQuery, (snapshot) => {
                const existingChat = snapshot.docs.find(doc => {
                    const chatData = doc.data();
                    return chatData.participants.some(
                        p => p.userId === selectedWorker.id
                    );
                });

                if (existingChat) {
                    setActiveChatId(existingChat.id);
                } else {
                    // Create new chat
                    const newChat = {
                        type: 'medical_consultation',
                        status: 'active',
                        createdAt: serverTimestamp(),
                        updatedAt: serverTimestamp(),
                        participants: [
                            {
                                userId: userProfile._id,
                                role: 'User',
                                name: userProfile.firstName,
                                status: userProfile.status || 'offline'
                            },
                            {
                                userId: selectedWorker.id,
                                role: 'HealthWorker',
                                name: selectedWorker.firstName,
                                status: selectedWorker.status || 'offline'
                            }
                        ],
                        lastMessage: null,
                        lastMessageAt: null
                    };

                    addDoc(collection(db, 'chats'), newChat)
                        .then(docRef => {
                            setActiveChatId(docRef.id);
                        })
                        .catch(error => {
                            console.error('Error creating chat:', error);
                        });
                }
            });

            return () => unsubscribe();
        };

        findOrCreateChat();
    }, [selectedWorker, userProfile]);

    // Fetch messages when chat is active
    useEffect(() => {
        if (!activeChatId) {
            return;
        }

        const messagesQuery = query(
            collection(db, 'chats', activeChatId, 'messages'),
            orderBy('timestamp', 'asc')
        );

        const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
            const newMessages = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setMessages(newMessages);
        });

        return () => unsubscribe();
    }, [activeChatId]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeChatId) {
            return;
        }

        try {
            const messageData = {
                content: newMessage.trim(),
                sender: {
                    id: userProfile._id,
                    role: 'User',
                    name: userProfile.firstName
                },
                timestamp: serverTimestamp(),
                status: 'sent'
            };

            // Add message to subcollection
            await addDoc(collection(db, 'chats', activeChatId, 'messages'), messageData);

            // Update chat's last message
            await updateDoc(doc(db, 'chats', activeChatId), {
                lastMessage: messageData.content,
                lastMessageAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <>
            {/* Navigation Bar */}
            <Box sx={{
                width: '100%',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                position: 'sticky',
                top: 0,
                zIndex: 1000,
                mb: 3
            }}>
                <Container maxWidth="xl" sx={{m: 0, py: 0.5}}>
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                    }}>
                        <IconButton
                            onClick={() => router.back()}
                            sx={{
                                mr: 2,
                                color: '#FFF',
                                '&:hover': {
                                    bgcolor: 'rgba(25, 118, 210, 0.08)'
                                }
                            }}
                        >
                            <ArrowBackIcon />
                        </IconButton>

                        <Tabs
                            value={activeTab}
                            onChange={(e, newValue) => setActiveTab(newValue)}
                            sx={{
                                '& .MuiTabs-indicator': {
                                    backgroundColor: '#46F0F9',
                                },
                            }}
                        >
                            {navigationTabs.map((tab, index) => (
                                <Tab
                                    key={tab.label}
                                    icon={tab.icon}
                                    label={tab.label}
                                    value={index}
                                    onClick={tab.onClick}
                                    sx={{
                                        color: "#FFF",
                                        fontWeight: 'bold',
                                        fontSize: '0.9rem',
                                        "&.Mui-selected": {
                                            color: "#46F0F9",
                                        },
                                    }}
                                />
                            ))}
                        </Tabs>
                    </Box>
                </Container>
            </Box>

            <Container maxWidth="xl" sx={{ py: 0.5, m: 0 }}>
                <Typography
                    variant="h6"
                    sx={{
                        mb: 2,
                        fontWeight: 700,
                        background: 'linear-gradient(45deg, #46F0F9 30%, #46F0F9 90%)',
                        backgroundClip: 'text',
                        textFillColor: 'transparent',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}
                >
                    Chat with Healthcare Professionals
                </Typography>

                <Grid container spacing={3}>
                    {/* Healthcare Workers List */}
                    <Grid item xs={12} md={4}>
                        <Paper
                            elevation={3}
                            sx={{
                                height: '70vh',
                                overflow: 'hidden',
                                display: 'flex',
                                flexDirection: 'column',
                                borderRadius: 3,
                                border: '1px solid rgba(0, 0, 0, 0.08)',
                                background: '#ffffff',
                                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
                            }}
                        >
                            <Box sx={{
                                p: 2.5,
                                borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
                                background: 'rgba(33, 150, 243, 0.02)'
                            }}>
                                <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976d2' }}>
                                    Available Healthcare Workers
                                </Typography>
                            </Box>
                            <List sx={{
                                overflow: 'auto',
                                flex: 1,
                                '&::-webkit-scrollbar': {
                                    width: '6px'
                                },
                                '&::-webkit-scrollbar-track': {
                                    background: '#f1f1f1',
                                    borderRadius: '10px'
                                },
                                '&::-webkit-scrollbar-thumb': {
                                    background: '#888',
                                    borderRadius: '10px',
                                    '&:hover': {
                                        background: '#555'
                                    }
                                }
                            }}>
                                {healthWorkers.map((worker) => (
                                    <React.Fragment key={worker.id}>
                                        <ListItemButton
                                            selected={selectedWorker?.id === worker.id}
                                            onClick={() => setSelectedWorker(worker)}
                                            sx={{
                                                transition: 'all 0.2s ease',
                                                '&:hover': {
                                                    backgroundColor: 'rgba(25, 118, 210, 0.08)',
                                                },
                                                '&.Mui-selected': {
                                                    backgroundColor: 'rgba(25, 118, 210, 0.12)',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(25, 118, 210, 0.15)',
                                                    }
                                                },
                                                borderRadius: 1,
                                                m: 1,
                                            }}
                                        >
                                            <ListItemAvatar>
                                                <Avatar
                                                    sx={{
                                                        bgcolor: 'primary.main',
                                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                                    }}
                                                >
                                                    {worker.name[0]}
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={
                                                    <Typography variant="body1">
                                                        {worker.firstName} {worker.lastName}
                                                    </Typography>
                                                }
                                                secondary={
                                                    <Typography
                                                        component="div"
                                                        variant="body2"
                                                        color="text.secondary"
                                                    >
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <CircleIcon
                                                                sx={{
                                                                    fontSize: 12,
                                                                    color: worker.status === 'online' ? '#4caf50' : '#bdbdbd'
                                                                }}
                                                            />
                                                            <span>
                                                                {worker.status === 'online' ? 'Online' : 'Offline'}
                                                            </span>
                                                        </Box>
                                                    </Typography>
                                                }
                                            />
                                        </ListItemButton>
                                        <Divider variant="inset" component="li" sx={{ my: 0.5 }} />
                                    </React.Fragment>
                                ))}
                            </List>
                        </Paper>
                    </Grid>

                    {/* Chat Area */}
                    <Grid item xs={12} md={8}>
                        <Paper
                            elevation={3}
                            sx={{
                                height: '70vh',
                                display: 'flex',
                                flexDirection: 'column',
                                borderRadius: 3,
                                border: '1px solid rgba(0, 0, 0, 0.08)',
                                background: '#ffffff',
                                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
                            }}
                        >
                            {selectedWorker ? (
                                <>
                                    {/* Chat Header */}
                                    <Box sx={{
                                        p: 2.5,
                                        borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
                                        background: 'rgba(33, 150, 243, 0.02)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2
                                    }}>
                                        <Avatar
                                            sx={{
                                                bgcolor: 'primary.main',
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                            }}
                                        >
                                            {selectedWorker.name[0]}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976d2' }}>
                                                {selectedWorker.name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Healthcare Professional
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {/* Messages Area */}
                                    <Box sx={{
                                        flex: 1,
                                        overflow: 'auto',
                                        p: 3,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 2,
                                        backgroundColor: '#f8fafc',
                                        '&::-webkit-scrollbar': {
                                            width: '6px'
                                        },
                                        '&::-webkit-scrollbar-track': {
                                            background: '#f1f1f1',
                                            borderRadius: '10px'
                                        },
                                        '&::-webkit-scrollbar-thumb': {
                                            background: '#888',
                                            borderRadius: '10px',
                                            '&:hover': {
                                                background: '#555'
                                            }
                                        }
                                    }}>
                                        {messages.map((message) => (
                                            <Box
                                                key={message.id}
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent: message.sender.role === 'User' ? 'flex-end' : 'flex-start',
                                                    mb: 2
                                                }}
                                            >
                                                <Paper
                                                    elevation={0}
                                                    sx={{
                                                        p: 2,
                                                        maxWidth: '70%',
                                                        borderRadius: 3,
                                                        backgroundColor: message.sender.role === 'User'
                                                            ? 'primary.main'
                                                            : 'white',
                                                        color: message.sender.role === 'User'
                                                            ? 'white'
                                                            : 'text.primary',
                                                        boxShadow: message.sender.role === 'User'
                                                            ? '0 2px 8px rgba(25, 118, 210, 0.15)'
                                                            : '0 2px 8px rgba(0, 0, 0, 0.05)',
                                                    }}
                                                >
                                                    <Typography variant="body1">
                                                        {message.content}
                                                    </Typography>
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            display: 'block',
                                                            mt: 1,
                                                            opacity: 0.8
                                                        }}
                                                    >
                                                        {message.timestamp?.toDate()
                                                            ? format(message.timestamp.toDate(), 'HH:mm')
                                                            : ''}
                                                    </Typography>
                                                </Paper>
                                            </Box>
                                        ))}
                                    </Box>

                                    {/* Message Input */}
                                    <Box sx={{
                                        p: 2,
                                        borderTop: '1px solid rgba(0, 0, 0, 0.06)',
                                        background: '#ffffff'
                                    }}>
                                        <form onSubmit={handleSendMessage}>
                                            <Box sx={{
                                                display: 'flex',
                                                gap: 2,
                                                alignItems: 'center'
                                            }}>
                                                <IconButton
                                                    size="large"
                                                    sx={{
                                                        color: 'action.active',
                                                        '&:hover': {
                                                            color: 'primary.main',
                                                            backgroundColor: 'rgba(25, 118, 210, 0.08)'
                                                        }
                                                    }}
                                                >
                                                    <AttachFileIcon />
                                                </IconButton>
                                                <TextField
                                                    fullWidth
                                                    variant="outlined"
                                                    placeholder="Type your message..."
                                                    value={newMessage}
                                                    onChange={(e) => setNewMessage(e.target.value)}
                                                    sx={{
                                                        '& .MuiOutlinedInput-root': {
                                                            borderRadius: 3,
                                                            backgroundColor: '#f8fafc',
                                                            '&:hover': {
                                                                '& > fieldset': {
                                                                    borderColor: 'primary.main',
                                                                }
                                                            }
                                                        }
                                                    }}
                                                />
                                                <IconButton
                                                    type="submit"
                                                    size="large"
                                                    color="primary"
                                                    sx={{
                                                        bgcolor: 'primary.main',
                                                        color: 'white',
                                                        '&:hover': {
                                                            bgcolor: 'primary.dark'
                                                        },
                                                        transition: 'all 0.2s ease'
                                                    }}
                                                >
                                                    <SendIcon />
                                                </IconButton>
                                            </Box>
                                        </form>
                                    </Box>
                                </>
                            ) : (
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        height: '100%',
                                        p: 4,
                                        textAlign: 'center',
                                        color: 'text.secondary'
                                    }}
                                >
                                    <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 600 }}>
                                        Select a Healthcare Professional
                                    </Typography>
                                    <Typography variant="body1">
                                        Choose a healthcare worker from the list to start a conversation
                                    </Typography>
                                </Box>
                            )}
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </>
    );
}

export default ChatBox;

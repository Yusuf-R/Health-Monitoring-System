'use client';

import React, {useEffect, useState} from 'react';
import {
    Avatar,
    Box,
    CircularProgress,
    Container,
    Divider,
    Grid,
    IconButton,
    List,
    ListItemAvatar,
    ListItemButton,
    ListItemText,
    Paper,
    TextField,
    Typography,
    Tabs,
    Tab
} from '@mui/material';
import {Circle as CircleIcon, Send as SendIcon} from '@mui/icons-material';
import {addDoc, collection, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc, where} from 'firebase/firestore';
import {db} from '@/server/db/fireStore';
import {format} from 'date-fns';

function ChatBox({healthWorkerProfile}) {
    const [selectedChat, setSelectedChat] = useState(null);
    const [activeChats, setActiveChats] = useState([]);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [currentTab, setCurrentTab] = useState(0); // 0 for users, 1 for health workers
    const [availableUsers, setAvailableUsers] = useState([]);
    const [availableHealthWorkers, setAvailableHealthWorkers] = useState([]);

    // Fetch available users
    useEffect(() => {
        const usersQuery = query(
            collection(db, 'users'),
            where('role', '==', 'User')
        );

        const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
            const users = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setAvailableUsers(users);
        });

        return () => unsubscribe();
    }, []);

    // Fetch available health workers (excluding self)
    useEffect(() => {
        const healthWorkersQuery = query(
            collection(db, 'healthWorkers'),
            where('role', '==', 'HealthWorker')
        );

        const unsubscribe = onSnapshot(healthWorkersQuery, (snapshot) => {
            const healthWorkers = snapshot.docs
                .map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }))
                .filter(hw => hw.id !== healthWorkerProfile._id); // Exclude self

            setAvailableHealthWorkers(healthWorkers);
        });

        return () => unsubscribe();
    }, [healthWorkerProfile._id]);

    // Fetch active chats for the health worker
    useEffect(() => {
        if (!healthWorkerProfile?._id) {
            return;
        }

        // Query chats where the health worker is a participant, using a simpler query
        const chatsRef = collection(db, 'chats');
        const chatsQuery = query(
            chatsRef,
            where('type', '==', 'medical_consultation'),
            where('status', '==', 'active')
        );

        const unsubscribe = onSnapshot(chatsQuery, (snapshot) => {
            const allChats = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Filter chats where this health worker is a participant
            const healthWorkerChats = allChats.filter(chat =>
                chat.participants.some(p =>
                    p.userId === healthWorkerProfile._id &&
                    p.role === 'HealthWorker'
                )
            );

            console.log('All chats:', allChats);
            console.log('Filtered health worker chats:', healthWorkerChats);

            setActiveChats(healthWorkerChats);
            setLoading(false);
        }, (error) => {
            console.error('Error fetching chats:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [healthWorkerProfile?._id]);

    // Debug log for active chats
    useEffect(() => {
        console.log('Active Chats:', activeChats);
    }, [activeChats]);

    // Debug log for selected chat
    useEffect(() => {
        console.log('Selected Chat:', selectedChat);
    }, [selectedChat]);

    // Fetch messages for the selected chat
    useEffect(() => {
        if (!selectedChat?.id) {
            return;
        }

        console.log('Fetching messages for chat:', selectedChat.id);

        const messagesRef = collection(db, 'chats', selectedChat.id, 'messages');
        const messagesQuery = query(messagesRef, orderBy('timestamp', 'asc'));

        const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
            const fetchedMessages = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            console.log('Fetched messages:', fetchedMessages);
            setMessages(fetchedMessages);
        }, (error) => {
            console.error('Error fetching messages:', error);
        });

        return () => unsubscribe();
    }, [selectedChat?.id]);

    // Handle sending a message
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedChat) {
            return;
        }

        try {
            const messageData = {
                content: newMessage.trim(),
                sender: {
                    id: healthWorkerProfile._id,
                    role: 'HealthWorker',
                    name: healthWorkerProfile.firstName
                },
                timestamp: serverTimestamp(),
                status: 'sent'
            };

            // Add message to subcollection
            await addDoc(collection(db, 'chats', selectedChat.id, 'messages'), messageData);

            // Update chat's last message
            await updateDoc(doc(db, 'chats', selectedChat.id), {
                lastMessage: messageData.content,
                lastMessageAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    // Handle tab change
    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
        setSelectedChat(null); // Reset selected chat when switching tabs
    };

    // Start new chat or open existing chat
    const handleStartChat = async (participant) => {
        const isHealthWorker = currentTab === 1;

        // Check for existing chat
        const existingChat = activeChats.find(chat =>
            chat.participants.some(p => p.userId === participant.id)
        );

        if (existingChat) {
            setSelectedChat(existingChat);
            return;
        }

        // Create new chat
        try {
            const newChat = {
                type: isHealthWorker ? 'health_worker_chat' : 'medical_consultation',
                status: 'active',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                participants: [
                    {
                        userId: healthWorkerProfile._id,
                        role: 'HealthWorker',
                        name: healthWorkerProfile.firstName,
                        status: 'online'
                    },
                    {
                        userId: participant.id,
                        role: isHealthWorker ? 'HealthWorker' : 'User',
                        name: participant.firstName || participant.name,
                        status: participant.status || 'offline'
                    }
                ],
                lastMessage: null,
                lastMessageAt: null
            };

            const chatRef = await addDoc(collection(db, 'chats'), newChat);
            setSelectedChat({ id: chatRef.id, ...newChat });
        } catch (error) {
            console.error('Error creating chat:', error);
        }
    };

    if (loading) {
        return (
            <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh'}}>
                <CircularProgress/>
            </Box>
        );
    }

    return (
        <Container maxWidth="xl" sx={{py: 0.5, m: 0}}>
            <Typography variant="h6" sx={{mb: 2, fontWeight: 700, color: '#FFF'}}>
                Chat
            </Typography>

            <Grid container spacing={3}>
                {/* Contact List */}
                <Grid item xs={12} md={4}>
                    <Paper
                        elevation={0}
                        sx={{
                            height: '75vh',
                            overflow: 'hidden',
                            border: '1px solid rgba(0, 0, 0, 0.12)',
                            borderRadius: 2
                        }}
                    >
                        {/* Tabs */}
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <Tabs
                                value={currentTab}
                                onChange={handleTabChange}
                                variant="fullWidth"
                            >
                                <Tab label="Users" />
                                <Tab label="Health Workers" />
                            </Tabs>
                        </Box>

                        {/* Contact List */}
                        <List sx={{
                            overflow: 'auto',
                            height: 'calc(100% - 49px)', // 49px is the height of tabs
                            '&::-webkit-scrollbar': {
                                width: '8px',
                            },
                            '&::-webkit-scrollbar-track': {
                                background: '#f1f1f1',
                            },
                            '&::-webkit-scrollbar-thumb': {
                                background: '#888',
                                borderRadius: '4px',
                            },
                        }}>
                            {(currentTab === 0 ? availableUsers : availableHealthWorkers).map(contact => (
                                <React.Fragment key={contact.id}>
                                    <ListItemButton
                                        onClick={() => handleStartChat(contact)}
                                        sx={{
                                            transition: 'all 0.2s ease',
                                            '&:hover': {
                                                backgroundColor: 'rgba(25, 118, 210, 0.08)',
                                            },
                                            backgroundColor: selectedChat?.participants.some(
                                                p => p.userId === contact.id
                                            )
                                                ? 'rgba(25, 118, 210, 0.12)'
                                                : 'transparent',
                                        }}
                                    >
                                        <ListItemAvatar>
                                            <Avatar
                                                src={contact.avatar}
                                                sx={{
                                                    bgcolor: 'primary.main',
                                                }}
                                            >
                                                {(contact.firstName?.[0] || contact.name?.[0] || '').toUpperCase()}
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={
                                                <Typography sx={{fontWeight: 600, color: '#2c3e50'}}>
                                                    {contact.firstName || contact.name}
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
                                                                color: contact.status === 'online' ? '#4caf50' : '#bdbdbd'
                                                            }}
                                                        />
                                                        <span>
                                                            {contact.status === 'online' ? 'Online' : 'Offline'}
                                                        </span>
                                                    </Box>
                                                </Typography>
                                            }
                                        />
                                    </ListItemButton>
                                    <Divider variant="inset" component="li" sx={{my: 0.5}}/>
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
                        {selectedChat ? (
                            <>
                                {/* Messages Area */}
                                <Box sx={{
                                    flex: 1,
                                    overflow: 'auto',
                                    p: 3,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 2,
                                    backgroundColor: '#f8fafc',
                                }}>
                                    {messages.map(message => (
                                        <Box
                                            key={message.id}
                                            sx={{
                                                display: 'flex',
                                                justifyContent: message.sender.role === 'HealthWorker' ? 'flex-end' : 'flex-start',
                                                mb: 2
                                            }}
                                        >
                                            <Paper
                                                sx={{
                                                    p: 2,
                                                    maxWidth: '70%',
                                                    borderRadius: 3,
                                                    backgroundColor: message.sender.role === 'HealthWorker'
                                                        ? 'primary.main'
                                                        : 'white',
                                                    color: message.sender.role === 'HealthWorker'
                                                        ? 'white'
                                                        : 'text.primary',
                                                }}
                                            >
                                                <Typography>{message.content}</Typography>
                                                <Typography variant="caption" sx={{mt: 1, opacity: 0.8}}>
                                                    {message.timestamp?.toDate()
                                                        ? format(message.timestamp.toDate(), 'HH:mm')
                                                        : ''}
                                                </Typography>
                                            </Paper>
                                        </Box>
                                    ))}
                                </Box>

                                {/* Message Input */}
                                <Box sx={{p: 2}}>
                                    <form onSubmit={handleSendMessage}>
                                        <Box sx={{display: 'flex', gap: 2}}>
                                            <TextField
                                                fullWidth
                                                variant="outlined"
                                                placeholder="Type your message..."
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                            />
                                            <IconButton
                                                type="submit"
                                                color="primary"
                                                sx={{
                                                    bgcolor: 'primary.main',
                                                    color: 'white',
                                                    '&:hover': {bgcolor: 'primary.dark'}
                                                }}
                                            >
                                                <SendIcon/>
                                            </IconButton>
                                        </Box>
                                    </form>
                                </Box>
                            </>
                        ) : (
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    height: '100%',
                                    p: 4
                                }}
                            >
                                <Typography>Select a chat to view messages</Typography>
                            </Box>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
}

export default ChatBox;

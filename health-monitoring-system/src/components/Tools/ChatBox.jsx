import React, { useEffect, useState, useRef } from 'react';
import { Box, TextField, Button, Paper, Typography, Avatar } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import {collection, query, orderBy, onSnapshot, serverTimestamp} from 'firebase/firestore';
import { db } from '@/server/db/fireStore';
import {toast} from "sonner";

export default function ChatBox({ chatId, currentUser, otherUser }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    // Scroll to bottom when new messages arrive
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        // Listen for new messages
        const chatRef = collection(db, 'chats', chatId, 'messages');
        const q = query(chatRef, orderBy('timestamp', 'asc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newMessages = [];
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    newMessages.push({
                        id: change.doc.id,
                        ...change.doc.data()
                    });
                }
            });
            
            if (newMessages.length > 0) {
                setMessages(prev => [...prev, ...newMessages]);
                scrollToBottom();
            }
        });

        return () => unsubscribe();
    }, [chatId]);

    const handleSend = async () => {
        if (!newMessage.trim()) return;

        try {
            // Add message to Firebase
            const messagesRef = collection(db, 'chats', chatId, 'messages');
            await addDoc(messagesRef, {
                content: newMessage,
                sender: {
                    id: currentUser._id,
                    name: currentUser.fullName,
                    role: currentUser.role
                },
                timestamp: serverTimestamp()
            });

            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Failed to send message');
        }
    };

    return (
        <Paper sx={{ p: 2, height: '500px', display: 'flex', flexDirection: 'column' }}>
            {/* Chat Header */}
            <Box sx={{ pb: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h6">
                    Chat with {otherUser.fullName}
                </Typography>
            </Box>

            {/* Messages Area */}
            <Box sx={{ 
                flex: 1, 
                overflowY: 'auto', 
                display: 'flex', 
                flexDirection: 'column',
                gap: 1,
                py: 2 
            }}>
                {messages.map((message) => (
                    <Box
                        key={message.id}
                        sx={{
                            display: 'flex',
                            justifyContent: message.sender.id === currentUser._id ? 
                                'flex-end' : 'flex-start',
                            mb: 1
                        }}
                    >
                        <Box sx={{ 
                            display: 'flex', 
                            gap: 1,
                            flexDirection: message.sender.id === currentUser._id ? 
                                'row-reverse' : 'row'
                        }}>
                            <Avatar>{message.sender.name[0]}</Avatar>
                            <Paper sx={{ 
                                p: 1,
                                backgroundColor: message.sender.id === currentUser._id ? 
                                    'primary.main' : 'grey.100',
                                color: message.sender.id === currentUser._id ? 
                                    'white' : 'text.primary'
                            }}>
                                <Typography>{message.content}</Typography>
                            </Paper>
                        </Box>
                    </Box>
                ))}
                <div ref={messagesEndRef} />
            </Box>

            {/* Message Input */}
            <Box sx={{ 
                display: 'flex', 
                gap: 1,
                pt: 2,
                borderTop: 1,
                borderColor: 'divider'
            }}>
                <TextField
                    fullWidth
                    size="small"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type a message..."
                />
                <Button 
                    variant="contained" 
                    endIcon={<SendIcon />}
                    onClick={handleSend}
                >
                    Send
                </Button>
            </Box>
        </Paper>
    );
}

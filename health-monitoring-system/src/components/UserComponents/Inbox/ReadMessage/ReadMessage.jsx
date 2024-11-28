'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Box,
    Container,
    Typography,
    IconButton,
    Paper,
    Divider,
    CircularProgress
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/server/db/fireStore';
import { formatDistanceToNow } from 'date-fns';

function ReadMessage({ id }) {
    const router = useRouter();
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMessage = async () => {
            try {
                const messageRef = doc(db, "messages", id);
                const messageSnap = await getDoc(messageRef);

                if (messageSnap.exists()) {
                    const messageData = messageSnap.data();
                    setMessage({ id: messageSnap.id, ...messageData });

                    // Mark as read if unread
                    if (messageData.status === 'unread') {
                        await updateDoc(messageRef, {
                            status: 'read',
                            readAt: serverTimestamp()
                        });
                    }
                }
            } catch (error) {
                console.error('Error fetching message:', error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchMessage();
        }
    }, [id]);

    const handleBack = () => {
        router.back();
    };

    if (loading) {
        return (
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '50vh'
            }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!message) {
        return (
            <Container maxWidth="md" sx={{ py: 4, color: '#FFF' }}>
                <Typography variant="h6" color="error">Message not found</Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Box sx={{ mb: 4 }}>
                <IconButton
                    onClick={handleBack}
                    sx={{
                        mr: 2,
                        '&:hover': {
                            transform: 'scale(1.1)',
                            bgcolor: 'action.hover'
                        }
                    }}
                >
                    <ArrowBackIcon sx={{color: 'limegreen'}} />
                </IconButton>
                <Typography
                    variant="h5"
                    component="span"
                    sx={{
                        verticalAlign: 'middle',
                        fontWeight: 500,
                        color: '#FFF',
                    }}
                >
                    Back to Inbox
                </Typography>
            </Box>

            <Paper
                elevation={2}
                sx={{
                    p: 4,
                    borderRadius: 2,
                    bgcolor: 'background.paper',
                    transition: 'box-shadow 0.3s',
                    '&:hover': {
                        boxShadow: 6
                    }
                }}
            >
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h4" gutterBottom>
                        {message.title || 'Message'}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, color: 'text.secondary', mb: 2 }}>
                        <Typography variant="body2">
                            From: {message.senderName || 'Unknown Sender'}
                        </Typography>
                        <Typography variant="body2">
                            {message.createdAt ? formatDistanceToNow(message.createdAt.toDate(), { addSuffix: true }) : ''}
                        </Typography>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                </Box>

                <Typography
                    variant="body1"
                    sx={{
                        lineHeight: 1.8,
                        color: 'text.primary',
                        whiteSpace: 'pre-wrap'
                    }}
                >
                    {message.content}
                </Typography>
            </Paper>
        </Container>
    );
}

export default ReadMessage;
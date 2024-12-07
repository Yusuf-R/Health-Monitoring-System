'use client';

import React, { useState, useEffect } from 'react';
import {
    Box,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography,
    Paper,
    Grid,
    CircularProgress,
    IconButton
} from '@mui/material';
import { addDoc, collection, serverTimestamp, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/server/db/fireStore';
import { toast } from 'sonner';
import TipTapEditor from '@/components/TipTapEditor/TipTapEditor';
import {statesAndLGAs} from "@/utils/data";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useRouter } from "next/navigation";
import { NotificationManager } from '@/utils/notificationManager';
import { useSearchParams } from 'next/navigation';
import LazyLoading from "@/components/LazyLoading/LazyLoading";

const NEWS_CATEGORIES = [
    'Health Alert',
    'Medical Research',
    'Healthcare Policy',
    'Disease Outbreak',
    'Public Health',
    'Healthcare Innovation',
    'Medical Technology'
];

const textFieldStyle = {
    backgroundColor: '#FFF',
    color: '#000',
    overflow: 'auto',
};

function CreateNews({ healthWorkerProfile }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const editId = searchParams.get('edit');
    const [loading, setLoading] = useState(!!editId);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        snippet: '',
        content: '',
        category: 'Health Alert',
        state: '',
        lga: '',
        country: 'Nigeria'
    });

    useEffect(() => {
        const fetchNewsForEdit = async () => {
            if (editId) {
                try {
                    const docRef = doc(db, 'news', editId);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        setFormData({
                            title: data.title || '',
                            snippet: data.snippet || '',
                            content: data.content || '',
                            category: data.category || 'Health Alert',
                            state: data.scope?.state || '',
                            lga: data.scope?.lga || '',
                            country: data.scope?.country || 'Nigeria'
                        });
                    }
                } catch (error) {
                    console.error('Error fetching news:', error);
                    toast.error('Failed to load news for editing');
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchNewsForEdit();
    }, [editId]);

    const handleBack = () => {
        router.back();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title.trim() || !formData.snippet.trim() || !formData.content.trim()) {
            toast.error('Please fill in all required fields');
            return;
        }

        setIsSubmitting(true);
        try {
            const newsData = {
                title: formData.title.trim(),
                snippet: formData.snippet.trim(),
                content: formData.content.trim(),
                category: formData.category,
                scope: {
                    state: formData.state,
                    lga: formData.lga,
                    country: formData.country
                },
                author: {
                    id: healthWorkerProfile._id,
                    name: healthWorkerProfile.firstName,
                    role: 'HealthWorker'
                }
            };

            if (editId) {
                const newsRef = doc(db, 'news', editId);
                await updateDoc(newsRef, {
                    ...newsData,
                    updatedAt: serverTimestamp()
                });
                toast.success('News article updated successfully');
            } else {
                const newsRef = collection(db, 'news');
                const newsDoc = await addDoc(newsRef, {
                    ...newsData,
                    timestamp: serverTimestamp(),
                    createdAt: serverTimestamp(),
                    status: 'published'
                });

                // Create notification for new news
                await NotificationManager.createNewsNotification(
                    {
                        id: newsDoc.id,
                        title: newsData.title,
                        category: newsData.category,
                        snippet: newsData.snippet,
                        type: 'news'
                    },
                    {
                        lga: formData.lga,
                        state: formData.state,
                        country: formData.country
                    },
                    {
                        id: healthWorkerProfile._id,
                        name: `${healthWorkerProfile.firstName} ${healthWorkerProfile.lastName}`,
                        role: 'HealthWorker'
                    }
                );
                toast.success('News article published successfully');
            }

            router.push('/health-worker/info-hub/news');
        } catch (error) {
            console.error('Error publishing news:', error);
            toast.error(editId ? 'Failed to update news' : 'Failed to publish news');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return <LazyLoading />;
    }

    return (
        <Paper elevation={3} sx={{ p: 3, maxWidth: '800px', mx: 'auto', my: 4 }}>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                    backgroundColor: '#3949ab',
                    color: 'white',
                    padding: '5px 5px',
                    borderRadius: 2,
                    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
                }}
            >
                <IconButton
                    onClick={handleBack}
                    sx={{
                        '&:hover': {
                            transform: 'scale(1.1)',
                            backgroundColor: 'rgba(0, 0, 0, 0.1)',
                        },
                        transition: 'transform 0.2s ease-in-out',
                    }}
                >
                    <ArrowBackIcon sx={{ color: '#81c784', fontSize: '40px' }} />
                </IconButton>

                <Typography
                    variant="h5"
                    gutterBottom
                    sx={{
                        fontWeight: 600,
                        textAlign: 'center',
                        flexGrow: 1,
                        color: '#ffffff',
                    }}
                >
                    {editId ? 'Edit News Article' : 'Create News Article'}
                </Typography>
            </Box>

            <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Title"
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            required
                            sx={textFieldStyle}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Snippet"
                            value={formData.snippet}
                            onChange={(e) => setFormData(prev => ({ ...prev, snippet: e.target.value }))}
                            multiline
                            rows={2}
                            required
                            sx={textFieldStyle}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Typography variant="subtitle1" gutterBottom>
                            Content
                        </Typography>
                        <TipTapEditor
                            content={formData.content}
                            onChange={(newContent) => setFormData(prev => ({ ...prev, content: newContent }))}
                            style={{ height: '200px', marginBottom: '50px' }}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth sx={textFieldStyle}>
                            <InputLabel>Category</InputLabel>
                            <Select
                                value={formData.category}
                                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                label="Category"
                            >
                                {NEWS_CATEGORIES.map((cat) => (
                                    <MenuItem key={cat} value={cat}>
                                        {cat}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth sx={textFieldStyle}>
                            <InputLabel>State</InputLabel>
                            <Select
                                value={formData.state}
                                onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value, lga: '' }))}
                                label="State"
                                MenuProps={{
                                    PaperProps: {
                                        style: {
                                            maxHeight: 300,
                                            backgroundColor: '#134357',
                                        }
                                    },
                                }}
                            >
                                {Object.keys(statesAndLGAs).map((state) => (
                                    <MenuItem key={state} value={state}
                                              sx={{color: 'white', '&:hover': {backgroundColor: '#051935'}}}>
                                        {state}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth sx={textFieldStyle}>
                            <InputLabel>LGA</InputLabel>
                            <Select
                                value={formData.lga}
                                onChange={(e) => setFormData(prev => ({ ...prev, lga: e.target.value }))}
                                label="LGA"
                                disabled={!formData.state}
                                variant={'filled'}
                                MenuProps={{
                                    PaperProps: {
                                        style: {
                                            maxHeight: 300,
                                            backgroundColor: '#134357',
                                        }
                                    },
                                }}
                            >
                                {formData.state && statesAndLGAs[formData.state].map((lga) => (
                                    <MenuItem key={lga} value={lga}
                                              sx={{color: 'white', '&:hover': {backgroundColor: '#051935'}}}>
                                        {lga}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Country"
                            value={formData.country}
                            disabled
                            sx={textFieldStyle}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            disabled={isSubmitting}
                            sx={{
                                mt: 2,
                                bgcolor: '#46F0F0',
                                color: '#000',
                                '&:hover': {
                                    bgcolor: '#3CC7C7'
                                }
                            }}
                        >
                            {isSubmitting ? (
                                <>
                                    <CircularProgress size={24} sx={{ mr: 1 }} />
                                    {editId ? 'Updating...' : 'Publishing...'}
                                </>
                            ) : (
                                editId ? 'Update News' : 'Publish News'
                            )}
                        </Button>
                    </Grid>
                </Grid>
            </form>
        </Paper>
    );
}

export default CreateNews;

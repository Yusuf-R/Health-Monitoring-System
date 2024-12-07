'use client';

import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Grid,
    TextField,
    Button,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Divider
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { useRouter, useSearchParams } from 'next/navigation';
import { collection, doc, getDoc, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/server/db/fireStore';
import { toast } from 'sonner';
import { NotificationManager } from '@/utils/notificationManager';
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const CATEGORIES = [
    "Women's Health",
    "Neurological Conditions",
    "Sleep Disorders",
    "Infectious Diseases",
    "Mental Health",
    "Cardiovascular Health",
    "Respiratory Conditions",
    "Digestive Health",
    "Pediatric Health",
    "Chronic Diseases"
];

export default function CreateHealthCheck({ healthWorkerProfile }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const editId = searchParams.get('edit');

    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [snippet, setSnippet] = useState('');
    const [introduction, setIntroduction] = useState('');
    const [symptoms, setSymptoms] = useState([]);
    const [newSymptom, setNewSymptom] = useState('');
    const [complications, setComplications] = useState([]);
    const [newComplication, setNewComplication] = useState('');
    const [tips, setTips] = useState([]);
    const [newTip, setNewTip] = useState('');
    const [emergencySigns, setEmergencySigns] = useState([]);
    const [newEmergencySign, setNewEmergencySign] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (editId) {
            fetchHealthCheckForEdit();
        }
    }, [editId]);


    const handleBack = () => {
        router.back();
    };


    const fetchHealthCheckForEdit = async () => {
        try {
            const docRef = doc(db, 'healthConditions', editId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                setTitle(data.title || '');
                setCategory(data.category || '');
                setSnippet(data.snippet || '');
                setIntroduction(data.content?.introduction || '');
                setSymptoms(data.content?.symptoms || []);
                setComplications(data.content?.complications || []);
                setTips(data.content?.tips || []);
                setEmergencySigns(data.content?.emergencySigns || []);
            } else {
                toast.error('Health check not found');
                router.push('/health-worker/info-hub/health-check');
            }
        } catch (error) {
            console.error('Error fetching health check:', error);
            toast.error('Error loading health check data');
        }
    };

    const handleAddListItem = (setter, newItem, resetInput) => {
        if (newItem.trim()) {
            setter(prev => [...prev, newItem.trim()]);
            resetInput('');
        }
    };

    const handleRemoveListItem = (setter, index) => {
        setter(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !category || !snippet.trim() || !introduction.trim()) {
            toast.error('Please fill in all required fields');
            return;
        }

        setIsSubmitting(true);
        try {
            const healthCheckData = {
                title: title.trim(),
                category,
                snippet: snippet.trim(),
                content: {
                    introduction: introduction.trim(),
                    symptoms,
                    complications,
                    tips,
                    emergencySigns
                },
                author: {
                    id: healthWorkerProfile._id,
                    name: `${healthWorkerProfile.firstName} ${healthWorkerProfile.lastName}`,
                    role: 'HealthWorker'
                }
            };

            if (editId) {
                const docRef = doc(db, 'healthConditions', editId);
                await updateDoc(docRef, {
                    ...healthCheckData,
                    updatedAt: serverTimestamp()
                });
                toast.success('Health check updated successfully');
            } else {
                const collectionRef = collection(db, 'healthConditions');
                const docRef = await addDoc(collectionRef, {
                    ...healthCheckData,
                    createdAt: serverTimestamp()
                });

                // Create notification for new health check
                await NotificationManager.createHealthCheckNotification(
                    {
                        id: docRef.id,
                        title: healthCheckData.title,
                        category: healthCheckData.category,
                        snippet: healthCheckData.content.introduction
                    },
                    {
                        id: healthWorkerProfile._id,
                        name: `${healthWorkerProfile.firstName} ${healthWorkerProfile.lastName}`,
                        role: 'HealthWorker'
                    }
                );

                toast.success('Health check created successfully');
            }

            router.push('/health-worker/personalized/health-check');
        } catch (error) {
            console.error('Error saving health check:', error);
            toast.error('Failed to save health check');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderListInput = (value, setValue, items, setItems, label) => (
        <Box sx={{ mb: 2 }}>
            <Grid container spacing={2} alignItems="center">
                <Grid item xs={10}>
                    <TextField
                        fullWidth
                        label={label}
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        variant="outlined"
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddListItem(setItems, value, () => setValue(''));
                            }
                        }}
                    />
                </Grid>
                <Grid item xs={2}>
                    <IconButton
                        onClick={() => handleAddListItem(setItems, value, () => setValue(''))}
                        color="primary"
                        disabled={!value.trim()}
                    >
                        <AddIcon />
                    </IconButton>
                </Grid>
            </Grid>
            <List>
                {items.map((item, index) => (
                    <ListItem
                        key={index}
                        secondaryAction={
                            <IconButton
                                edge="end"
                                onClick={() => handleRemoveListItem(setItems, index)}
                            >
                                <DeleteIcon />
                            </IconButton>
                        }
                    >
                        <ListItemText primary={item} />
                    </ListItem>
                ))}
            </List>
        </Box>
    );

    return (
        <Box sx={{ p: 3 }}>
            <Paper elevation={3} sx={{ p: 3 }}>
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
                        {editId ? 'Edit Health Check' : 'Create Health Check'}
                    </Typography>
                </Box>
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth required>
                                <InputLabel>Category</InputLabel>
                                <Select
                                    value={category}
                                    label="Category"
                                    onChange={(e) => setCategory(e.target.value)}
                                 variant={'filled'}
                                >
                                    {CATEGORIES.map((cat) => (
                                        <MenuItem key={cat} value={cat}>
                                            {cat}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Snippet"
                                value={snippet}
                                onChange={(e) => setSnippet(e.target.value)}
                                required
                                multiline
                                rows={2}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Introduction"
                                value={introduction}
                                onChange={(e) => setIntroduction(e.target.value)}
                                required
                                multiline
                                rows={3}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Divider sx={{ my: 2 }} />
                            {renderListInput(newSymptom, setNewSymptom, symptoms, setSymptoms, 'Add Symptom')}
                            <Divider sx={{ my: 2 }} />
                            {renderListInput(newComplication, setNewComplication, complications, setComplications, 'Add Complication')}
                            <Divider sx={{ my: 2 }} />
                            {renderListInput(newTip, setNewTip, tips, setTips, 'Add Tip')}
                            <Divider sx={{ my: 2 }} />
                            {renderListInput(newEmergencySign, setNewEmergencySign, emergencySigns, setEmergencySigns, 'Add Emergency Sign')}
                        </Grid>
                        <Grid item xs={12}>
                            <Button
                                type="submit"
                                variant="contained"
                                fullWidth
                                disabled={isSubmitting}
                                sx={{
                                    mt: 2,
                                    backgroundColor: '#1a237e',
                                    '&:hover': {
                                        backgroundColor: '#283593'
                                    }
                                }}
                            >
                                {isSubmitting ? 'Saving...' : (editId ? 'Update Health Check' : 'Create Health Check')}
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Box>
    );
}

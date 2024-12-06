'use client';

import React, { useState } from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    Paper,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    CircularProgress, IconButton
} from '@mui/material';
import { addDoc, collection, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/server/db/fireStore';
import { toast } from 'sonner';
import TipTapEditor from '@/components/TipTapEditor/TipTapEditor';
import {statesAndLGAs} from "@/utils/data";
import {ArrowBack as ArrowBackIcon} from "@mui/icons-material";
import {useRouter} from "next/navigation";

const NEWS_CATEGORIES = [
    'Health Alert',
    'Medical Research',
    'Public Health',
    'Healthcare Policy',
    'Community Health',
    'Disease Outbreak',
    'Health Tips',
    'Medical Technology'
];

function CreateNews({ healthWorkerProfile }) {
    const [title, setTitle] = useState('');
    const [snippet, setSnippet] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('Health Alert');
    const [type, setType] = useState('advice');
    const [state, setState] = useState('');
    const [lga, setLGA] = useState('');
    const [country, setCountry] = useState("Nigeria")
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const handleBack = () => {
        router.back();
    };

    // // State of Origin
    const getStateOptions = () => {
        return Object.keys(statesAndLGAs).map((stateName) => (
            <MenuItem key={stateName} value={stateName}
                      sx={{color: 'white', '&:hover': {backgroundColor: '#051935'}}}>
                {stateName}
            </MenuItem>
        ));
    };
    const handleStateChange = (event) => {
        // prevent default action of submitting the form
        event.preventDefault();
        setState(event.target.value)
        setLGA('');
    };

    // LGA
    const getLGAOptions = () => {
        if (!state) {
            return [];
        }
        return statesAndLGAs[state].map((lgaName) => (
            <MenuItem key={lgaName} value={lgaName}
                      sx={{color: 'white', '&:hover': {backgroundColor: '#051935'}}}> {lgaName} </MenuItem>
        ));
    };
    const handleLGAChange = (event) => {
        // prevent default action of submitting the form
        event.preventDefault();
        setLGA(event.target.value)
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !snippet.trim() || !content.trim()) {
            toast.error('Please fill in all required fields');
            return;
        }

        setIsSubmitting(true);
        try {
            const newsData = {
                title: title.trim(),
                snippet: snippet.trim(),
                content: content.trim(),
                category,
                scope: {lga, state, country},
                timestamp: new Date().toISOString(),
                author: {
                    id: healthWorkerProfile._id,
                    name: healthWorkerProfile.firstName,
                    role: 'HealthWorker'
                },
                status: 'published'
            };

            const docRef = await addDoc(collection(db, 'news'), newsData);

            // Get all users in the specified scope
            const usersRef = collection(db, 'users');
            let scopeQuery;

            if (lga) {
                // Local news - only users in specific LGA
                scopeQuery = query(usersRef, where('lga', '==', lga));
            } else if (state) {
                // State news - only users in specific state
                scopeQuery = query(usersRef, where('state', '==', state));
            } else {
                // National news - all users in the collection
                scopeQuery = query(usersRef);
            }

            const usersSnapshot = await getDocs(scopeQuery);

            if (usersSnapshot.empty) {
                console.log('No users found in the specified scope');
            }

            // Create notifications for all users in the scope
            const notificationPromises = usersSnapshot.docs.map(userDoc => {
                const notificationData = {
                    type: 'new_news',
                    title: `${category}: ${title}`,
                    message: `New ${category.toLowerCase()} has been published${lga ? ` for ${lga}` : state ? ` for ${state}` : ' nationwide'}: ${title}`,
                    status: 'unread',
                    actionUrl: `/news/${docRef.id}`,
                    createdAt: serverTimestamp(),
                    contentId: docRef.id,
                    contentType: 'news',
                    author: {
                        id: healthWorkerProfile._id,
                        name: healthWorkerProfile.firstName,
                        role: 'HealthWorker'
                    },
                    userId: userDoc.id,
                    scope: {lga, state, country},
                    read: false
                };

                return addDoc(collection(db, 'notifications'), notificationData);
            });

            // Wait for all notifications to be created
            await Promise.all(notificationPromises);

            toast.success('News article published successfully!');

            // Reset form
            setTitle('');
            setSnippet('');
            setContent('');
            setType('advice');
            setState('');
            setLGA('');
            setCategory('Health Alert');


        } catch (error) {
            console.error('Error publishing news:', error);
            setIsSubmitting(false);
            toast.error('Failed to publish news. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Paper elevation={3} sx={{ p: 3, maxWidth: '800px', mx: 'auto', my: 4 }}>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                    backgroundColor: '#3949ab', // Slightly lighter shade for better contrast
                    color: 'white',
                    padding: '5px 5px', // Increased padding for better spacing
                    borderRadius: 2, // Smaller, subtle corner radius
                    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)', // Softer shadow for a modern feel
                }}
            >
                <IconButton
                    onClick={handleBack}
                    sx={{
                        '&:hover': {
                            transform: 'scale(1.1)',
                            backgroundColor: 'rgba(0, 0, 0, 0.1)', // Subtle hover effect
                        },
                        transition: 'transform 0.2s ease-in-out', // Smooth hover animation
                    }}
                >
                    <ArrowBackIcon sx={{ color: '#81c784', fontSize: '40px' }} />
                </IconButton>

                <Typography
                    variant="h5" // Larger and bolder for prominence
                    gutterBottom
                    sx={{
                        fontWeight: 600, // Make the text bold
                        textAlign: 'center', // Center align the text
                        flexGrow: 1, // Ensure it takes up the remaining space
                        color: '#ffffff', // White for contrast
                    }}
                >
                    Create News Article
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
                        <TextField
                            fullWidth
                            label="Snippet"
                            value={snippet}
                            onChange={(e) => setSnippet(e.target.value)}
                            multiline
                            rows={2}
                            required
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Typography variant="subtitle1" gutterBottom>
                            Content
                        </Typography>
                        <TipTapEditor
                            value={content}
                            onChange={setContent}
                            style={{ height: '200px', marginBottom: '50px' }}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel>Category</InputLabel>
                            <Select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                label="Category"
                                variant={"filled"}
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
                        <TextField
                            fullWidth
                            label="Country"
                            value={country}
                            readOnly
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel>State</InputLabel>
                            <Select
                                value={state}
                                onChange={handleStateChange}
                                variant="filled"
                                MenuProps={{
                                    PaperProps: {
                                        style: {
                                            maxHeight: 300,
                                            backgroundColor: '#134357',
                                        }
                                    },
                                }}
                                sx={{
                                    backgroundColor: '#FFF',
                                    color: '#000',
                                    overflow: 'auto',
                                }}

                            >
                                {getStateOptions()}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel>LGA</InputLabel>
                            <Select
                                value={lga}
                                onChange={handleLGAChange}
                                variant="filled"
                                MenuProps={{
                                    PaperProps: {
                                        style: {
                                            maxHeight: 300,
                                            backgroundColor: '#134357',
                                        }
                                    },
                                }}
                                sx={{
                                    backgroundColor: '#FFF',
                                    color: '#000',
                                    overflow: 'auto',
                                }}
                            >
                                {getLGAOptions()}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            fullWidth
                            disabled={isSubmitting}
                            sx={{ mt: 2 }}
                        >
                            {isSubmitting ? (
                                <>
                                    <CircularProgress size={24} sx={{ mr: 1 }} />
                                    Publishing...
                                </>
                            ) : (
                                'Publish News'
                            )}
                        </Button>
                    </Grid>
                </Grid>
            </form>
        </Paper>
    );
}

export default CreateNews;

'use client';
import React, { useEffect, useState } from 'react';
import {
    alpha,
    Box,
    Button,
    Card,
    CardContent,
    Container,
    Grid,
    Paper,
    Stack,
    Tabs,
    Tab,
    TextField,
    Typography,
    Chip,
    CircularProgress,
    useTheme,
    Slider,
    FormControlLabel,
    Checkbox,
    Fade,
    Alert,
} from '@mui/material';
import {
    Healing as SymptomIcon,
    Insights as InsightsIcon,
    LocalHospital as HospitalIcon,
    DirectionsRun as ActivitiesIcon,
    ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { db } from '@/server/db/fireStore';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const features = [
    {
        title: "Log Your Symptoms",
        icon: <SymptomIcon />,
        route: '/user/personalized/logger/symptom-logger',
        btnColor: '#4CAF50',
    },
    {
        title: "View Insights",
        icon: <InsightsIcon />,
        route: '/user/personalized/logger/insights',
        btnColor: '#007FFF',
    },
    {
        title: "Activities",
        icon: <ActivitiesIcon />,
        route: '/user/personalized/logger/activity-tracker',
        btnColor: '#00BCD4',
    },
    {
        title: "Connect with Doctors",
        icon: <HospitalIcon />,
        route: '/user/settings/chats',
        btnColor: '#9C27B0',
    },
];

const categories = [
    "General Symptoms",
    "Infectious Diseases",
    "Chronic Conditions",
    "Mental Health",
    "Other",
];

const categoryColors = {
    "General Symptoms": '#ff6b6b',
    "Infectious Diseases": '#ff9900',
    "Chronic Conditions": '#4CAF50',
    "Mental Health": '#2196f3',
    "Other": '#9e9e9e',
};

const symptomOptions = [
    "Fever",
    "Headache",
    "Nausea",
    "Cough",
    "Fatigue",
    "Dizziness",
    "Shortness of Breath",
    "Chest Pain",
];

function SymptomLogger({ userProfile }) {
    const [selectedTab, setSelectedTab] = useState('/user/personalized/logger/symptom-logger');
    const router = useRouter();
    const [symptomDetails, setSymptomDetails] = useState('');
    const [impact, setImpact] = useState('');
    const [possibleCauses, setPossibleCauses] = useState('');
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [symptomIntensity, setSymptomIntensity] = useState(5);
    const [additionalNotes, setAdditionalNotes] = useState('');
    const [accompanyingSymptoms, setAccompanyingSymptoms] = useState([]);
    const [contactRequested, setContactRequested] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('General Symptoms');
    const theme = useTheme();

    const handleFormSubmit = async () => {
        if (!symptomDetails.trim()) {
            setErrorMessage('Please provide details about your symptoms.');
            return;
        }

        setLoading(true);
        setErrorMessage('');
        try {
            const symptomsCollection = collection(db, 'loggedSymptoms');
            const symptomDoc = await addDoc(symptomsCollection, {
                userId: userProfile?._id || 'anonymous',
                symptomDetails,
                symptomIntensity,
                impact,
                possibleCauses,
                additionalNotes,
                accompanyingSymptoms,
                contactRequested,
                category: selectedCategory,
                status: 'submitted',
                timestamp: serverTimestamp(),
            });

            // Create a message for both cases
            const messagesCollection = collection(db, 'messages');
            if (contactRequested) {
                await addDoc(messagesCollection, {
                    receiverId: userProfile?._id,
                    senderName: 'Health System',
                    title: 'Symptom Log Follow-up - Healthcare Provider Review',
                    content: `Thank you for logging your symptoms. Based on your request, a healthcare provider will review your symptoms and contact you shortly.

Symptom Details:
- Category: ${selectedCategory}
- Intensity: ${symptomIntensity}/10
- Primary Symptoms: ${symptomDetails}
${accompanyingSymptoms.length > 0 ? `- Accompanying Symptoms: ${accompanyingSymptoms.join(', ')}` : ''}
${impact ? `- Impact: ${impact}` : ''}
${possibleCauses ? `- Possible Causes: ${possibleCauses}` : ''}
${additionalNotes ? `- Additional Notes: ${additionalNotes}` : ''}

Reference ID: ${symptomDoc.id}

A healthcare provider will review this information and reach out to you through this messaging system.`,
                    status: 'unread',
                    type: 'symptom_followup',
                    createdAt: serverTimestamp(),
                });
            } else {
                await addDoc(messagesCollection, {
                    receiverId: userProfile?._id,
                    senderName: 'Health System',
                    title: 'Symptom Log Confirmation',
                    content: `Thank you for logging your symptoms. We are closely monitoring your logged conditions, and any necessary follow-up actions will be communicated promptly.

Symptom Details:
- Category: ${selectedCategory}
- Intensity: ${symptomIntensity}/10
- Primary Symptoms: ${symptomDetails}
${accompanyingSymptoms.length > 0 ? `- Accompanying Symptoms: ${accompanyingSymptoms.join(', ')}` : ''}
${impact ? `- Impact: ${impact}` : ''}
${possibleCauses ? `- Possible Causes: ${possibleCauses}` : ''}
${additionalNotes ? `- Additional Notes: ${additionalNotes}` : ''}

Reference ID: ${symptomDoc.id}

Continue monitoring your symptoms and log any changes. If your condition worsens, please update your symptoms and request healthcare provider contact.`,
                    status: 'unread',
                    type: 'symptom_log',
                    createdAt: serverTimestamp(),
                });
            }

            // Conditional success message based on contact request
            const successMsg = contactRequested
                ? 'Your symptoms have been logged successfully. A healthcare provider will contact you shortly to discuss your symptoms and provide appropriate guidance.'
                : 'Your symptoms have been logged successfully. We are closely monitoring your logged conditions, and any necessary follow-up actions will be communicated promptly.';

            setSuccessMessage(successMsg);
            toast.success(successMsg);

            // Reset form
            setSymptomDetails('');
            setSymptomIntensity(5);
            setImpact('');
            setPossibleCauses('');
            setAdditionalNotes('');
            setAccompanyingSymptoms([]);
            setContactRequested(false);
            setSelectedCategory('General Symptoms');
        } catch (error) {
            setErrorMessage('Error logging your symptoms. Please try again.');
            toast.error('Error logging your symptoms. Please try again.');
            console.error('Error submitting symptoms:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSymptomSelect = (symptom) => {
        setAccompanyingSymptoms((prev) =>
            prev.includes(symptom)
                ? prev.filter((s) => s !== symptom)
                : [...prev, symptom]
        );
    };

    useEffect(() => {
        if (selectedTab === '/user/personalized/logger/symptom-logger') {
            router.push(selectedTab);
        }
    }, [selectedTab, router]);

    const handleTabChange = (event, newValue) => {
        setSelectedTab(newValue);
        const selectedFeature = features.find(feature => feature.route === newValue);
        if (selectedFeature) {
            router.push(selectedFeature.route);
        }
    };

    return (
        <>
            <Container maxWidth="xl" sx={{ py: 0.5, m: 0 }}>
                <Stack
                    elevation={3}
                    direction="row"
                    spacing={0}
                    sx={{
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderRadius: 2,
                        mb: 3,
                    }}
                >
                    <Tabs
                        value={selectedTab}
                        onChange={handleTabChange}
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
                                color: "#FFF",
                                '&.Mui-selected': {
                                    color: '#46F0F9',
                                },
                            },
                        }}
                    >
                        <Tab
                            label="ALL"
                            value="All"
                            icon={<ArrowForwardIcon sx={{ color: '#46F0F9' }} />}
                            iconPosition="start"
                        />
                        {features.map((feature) => (
                            <Tab
                                key={feature.title}
                                label={feature.title.toUpperCase()}
                                value={feature.route}
                                icon={React.cloneElement(feature.icon, {
                                    sx: { color: feature.btnColor },
                                })}
                                iconPosition="start"
                                sx={{
                                    fontSize: '0.9rem',
                                    fontWeight: 500,
                                }}
                            />
                        ))}
                    </Tabs>
                </Stack>
            </Container>
            <Container maxWidth="xl" sx={{ py: 0.5, m: 0 }}>
                <Paper
                    elevation={3}
                    sx={{
                        p: 3,
                        mb: 3,
                        borderRadius: '24px',
                        background: `linear-gradient(135deg, ${alpha('#004e92', 0.95)} 0%, ${alpha('#000428', 0.9)} 100%)`,
                        color: '#fff',
                    }}
                >
                    <Stack spacing={3} alignItems="center">
                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: 700,
                                background: 'linear-gradient(45deg, #46F0F9 30%, #E0F7FA 90%)',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                textAlign: 'center',
                                mb: 2,
                            }}
                        >
                            Symptom Logger 📋
                        </Typography>
                        <Typography variant="h6" sx={{ color: alpha('#fff', 0.9), textAlign: 'center', maxWidth: '800px' }}>
                            Track your health journey with precision and care. Log your symptoms, monitor patterns, and stay connected with healthcare providers.
                        </Typography>
                    </Stack>
                </Paper>

                <Paper
                    elevation={3}
                    sx={{
                        p: 4,
                        borderRadius: '16px',
                        bgcolor: theme.palette.mode === 'dark' ? alpha('#000', 0.6) : alpha('#fff', 0.9),
                    }}
                >
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                        Select Symptom Category
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mb: 4, flexWrap: 'wrap', gap: 1 }}>
                        {categories.map((category) => (
                            <Chip
                                key={category}
                                label={category}
                                onClick={() => setSelectedCategory(category)}
                                sx={{
                                    bgcolor: selectedCategory === category ? categoryColors[category] : 'transparent',
                                    color: selectedCategory === category ? '#fff' : 'text.primary',
                                    border: `1px solid ${categoryColors[category]}`,
                                    '&:hover': {
                                        bgcolor: alpha(categoryColors[category], 0.2),
                                    },
                                }}
                            />
                        ))}
                    </Stack>

                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Describe your symptoms"
                        placeholder="Please provide detailed information about your symptoms..."
                        value={symptomDetails}
                        onChange={(e) => setSymptomDetails(e.target.value)}
                        sx={{ mb: 3 }}
                    />

                    <Box sx={{ mb: 4 }}>
                        <Typography gutterBottom>Symptom Intensity</Typography>
                        <Slider
                            value={symptomIntensity}
                            onChange={(e, newValue) => setSymptomIntensity(newValue)}
                            step={1}
                            min={1}
                            max={10}
                            marks={[
                                { value: 1, label: 'Mild' },
                                { value: 5, label: 'Moderate' },
                                { value: 10, label: 'Severe' },
                            ]}
                            sx={{
                                color: theme.palette.primary.main,
                                '& .MuiSlider-mark': {
                                    backgroundColor: '#bfbfbf',
                                },
                            }}
                        />
                    </Box>

                    <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                        Accompanying Symptoms
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mb: 4, flexWrap: 'wrap', gap: 1 }}>
                        {symptomOptions.map((symptom) => (
                            <Chip
                                key={symptom}
                                label={symptom}
                                onClick={() => handleSymptomSelect(symptom)}
                                sx={{
                                    bgcolor: accompanyingSymptoms.includes(symptom)
                                        ? alpha(theme.palette.primary.main, 0.9)
                                        : 'transparent',
                                    color: accompanyingSymptoms.includes(symptom) ? '#fff' : 'text.primary',
                                    border: `1px solid ${theme.palette.primary.main}`,
                                    '&:hover': {
                                        bgcolor: alpha(theme.palette.primary.main, 0.2),
                                    },
                                }}
                            />
                        ))}
                    </Stack>

                    <Grid container spacing={3} sx={{ mb: 3 }}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Possible Causes"
                                placeholder="What might have triggered these symptoms?"
                                value={possibleCauses}
                                onChange={(e) => setPossibleCauses(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Impact on Daily Life"
                                placeholder="How did this affect your daily activities?"
                                value={impact}
                                onChange={(e) => setImpact(e.target.value)}
                            />
                        </Grid>
                    </Grid>

                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Additional Notes"
                        placeholder="Any other relevant information..."
                        value={additionalNotes}
                        onChange={(e) => setAdditionalNotes(e.target.value)}
                        sx={{ mb: 3 }}
                    />

                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={contactRequested}
                                onChange={(e) => setContactRequested(e.target.checked)}
                                sx={{
                                    color: theme.palette.primary.main,
                                    '&.Mui-checked': {
                                        color: theme.palette.primary.main,
                                    },
                                }}
                            />
                        }
                        label={
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                Request contact from a healthcare provider
                            </Typography>
                        }
                        sx={{ mb: 3 }}
                    />

                    <Fade in={!!successMessage || !!errorMessage}>
                        <Box sx={{ mb: 3 }}>
                            {successMessage && (
                                <Alert severity="success" sx={{ mb: 2 }}>
                                    {successMessage}
                                </Alert>
                            )}
                            {errorMessage && (
                                <Alert severity="error" sx={{ mb: 2 }}>
                                    {errorMessage}
                                </Alert>
                            )}
                        </Box>
                    </Fade>

                    <Button
                        fullWidth
                        variant="contained"
                        onClick={handleFormSubmit}
                        disabled={loading}
                        sx={{
                            py: 1.5,
                            bgcolor: theme.palette.primary.main,
                            color: '#fff',
                            '&:hover': {
                                bgcolor: theme.palette.primary.dark,
                            },
                        }}
                    >
                        {loading ? (
                            <CircularProgress size={24} color="inherit" />
                        ) : (
                            'Log Symptoms'
                        )}
                    </Button>
                </Paper>
            </Container>
        </>
    );
}

export default SymptomLogger;

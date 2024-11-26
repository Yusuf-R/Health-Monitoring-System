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
    useTheme, Slider, FormControlLabel, Checkbox,
} from '@mui/material';
import {
    Healing as SymptomIcon,
    Insights as InsightsIcon,
    LocalHospital as HospitalIcon,
    DirectionsRun as ActivitiesIcon,
} from '@mui/icons-material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { db } from '@/server/db/fireStore';
import { addDoc, collection } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import {toast} from 'sonner';

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
            await addDoc(symptomsCollection, {
                userId: userProfile?._id || 'anonymous',
                symptomDetails,
                symptomIntensity,
                impact,
                possibleCauses,
                additionalNotes,
                accompanyingSymptoms,
                contactRequested,
                status: 'submitted',
                timestamp: new Date(),
            });
            setSuccessMessage('Your symptoms have been logged successfully.');
            toast.success('Your Symptoms have been logged successfully\nA healthcare provider will reach out to you shortly.');
            toast.info('A healthcare provider will reach out to you shortly.');
            setSymptomDetails('');
            setSymptomIntensity(5);
            setImpact('');
            setPossibleCauses('');
            setAdditionalNotes('');
            setAccompanyingSymptoms([]);
            setContactRequested(false);
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
            <Container maxWidth="xl" sx={{ py: 0.5,m:0 }}>
                {/* Header */}
                <Paper
                    elevation={3}
                    sx={{
                        p: 2,
                        mb: 1,
                        borderRadius: '24px',
                        bgcolor: theme.palette.mode === 'dark' ? alpha('#004e92', 0.9) : alpha('#004e92', 0.8),
                        color: '#fff',
                        textAlign: 'center',
                    }}
                >
                    <Stack spacing={3} alignItems="center">
                        <Typography
                            variant="h5"
                            sx={{
                                fontWeight: 700,
                                background: 'linear-gradient(45deg, #46F0F9 30%, #E0F7FA 90%)',
                                backgroundClip: 'text',
                                textFillColor: 'transparent',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            Symptom Logger 📋
                        </Typography>
                        <Typography variant="h6" sx={{ color: alpha('#fff', 0.9) }}>
                            📋 Welcome to the Symptom Logger! Your one-stop tool for tracking and managing your health symptoms. Whether you're experiencing a recurring headache, a sudden fever, or anything in between, this tool helps you log your symptoms, discover insights, and share with healthcare providers for support and care.
                        </Typography>
                        <Typography variant="h6" sx={{ color: alpha('#fff', 0.8) }}>
                            1️⃣ **Log Your Symptoms**
                            2️⃣ **Track and Manage**
                            3️⃣ **Connect with Experts**
                        </Typography>
                    </Stack>
                </Paper>
                {/* (Symptom Form and additional features go here) */}
                <Paper
                    elevation={3}
                    sx={{
                        p: 3,
                        borderRadius: '16px',
                        bgcolor: theme.palette.mode === 'dark' ? alpha('#000', 0.6) : alpha('#fff', 0.9),
                        color: '#000',
                    }}
                >
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                        Log Your Symptoms
                    </Typography>

                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        placeholder="Describe your symptoms..."
                        value={symptomDetails}
                        onChange={(e) => setSymptomDetails(e.target.value)}
                        sx={{ mb: 2 }}
                    />

                    <Typography gutterBottom>Symptom Intensity (1-10)</Typography>
                    <Slider
                        value={symptomIntensity}
                        onChange={(e, newValue) => setSymptomIntensity(newValue)}
                        step={1}
                        min={1}
                        max={10}
                        valueLabelDisplay="auto"
                        sx={{ mb: 3 }}
                    />

                    <Typography variant="body1" sx={{ mb: 1 }}>
                        Accompanying Symptoms
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap' }}>
                        {symptomOptions.map((symptom) => (
                            <Chip
                                key={symptom}
                                label={symptom}
                                clickable
                                onClick={() => handleSymptomSelect(symptom)}
                                color={accompanyingSymptoms.includes(symptom) ? 'primary' : 'default'}
                            />
                        ))}
                    </Stack>

                    <TextField
                        fullWidth
                        placeholder="Possible causes (optional)"
                        value={possibleCauses}
                        onChange={(e) => setPossibleCauses(e.target.value)}
                        sx={{ mb: 2 }}
                    />

                    <TextField
                        fullWidth
                        placeholder="How did this impact your day?"
                        value={impact}
                        onChange={(e) => setImpact(e.target.value)}
                        sx={{ mb: 2 }}
                    />

                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        placeholder="Additional notes..."
                        value={additionalNotes}
                        onChange={(e) => setAdditionalNotes(e.target.value)}
                        sx={{ mb: 2 }}
                    />

                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={contactRequested}
                                onChange={(e) => setContactRequested(e.target.checked)}
                            />
                        }
                        label="Request contact from a healthcare provider"
                    />

                    {errorMessage && (
                        <Typography color="error" sx={{ mt: 2 }}>
                            {errorMessage}
                        </Typography>
                    )}
                    {successMessage && (
                        <Typography color="success.main" sx={{ mt: 2 }}>
                            {successMessage}
                        </Typography>
                    )}

                    <Button
                        variant="contained"
                        fullWidth
                        disabled={loading}
                        onClick={handleFormSubmit}
                        sx={{
                            mt: 3,
                            bgcolor: '#4CAF50',
                            '&:hover': { bgcolor: alpha('#4CAF50', 0.8) },
                        }}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Submit Symptoms'}
                    </Button>
                </Paper>

            </Container>
        </>
    );
}

export default SymptomLogger;

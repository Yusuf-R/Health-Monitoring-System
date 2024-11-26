'use client';
import React, { useState } from 'react';
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
    TextField,
    Typography,
    useTheme,
    CircularProgress,
} from '@mui/material';
import {
    DirectionsRun as StepsIcon,
    LocalDrink as WaterIcon,
    FitnessCenter as ExerciseIcon,
    Hotel as SleepIcon,
    Apple as FruitIcon,
} from '@mui/icons-material';
import { db } from '@/server/db/fireStore';
import { doc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { format } from 'date-fns';

const activityMetrics = [
    {
        title: "Drink Water",
        icon: <WaterIcon />,
        target: "8 glasses/day",
        inputType: "number",
        placeholder: "Glasses of water (e.g., 5)",
        valueKey: "water",
        btnColor: '#4CAF50',
    },
    {
        title: "Steps Taken",
        icon: <StepsIcon />,
        target: "3000 steps/week",
        inputType: "number",
        placeholder: "Steps taken today",
        valueKey: "steps",
        btnColor: '#2196f3',
    },
    {
        title: "Exercise",
        icon: <ExerciseIcon />,
        target: "30 min/day",
        inputType: "number",
        placeholder: "Exercise intervals (e.g., 2)",
        valueKey: "exercise",
        btnColor: '#FF9800',
    },
    {
        title: "Sleep Routine",
        icon: <SleepIcon />,
        target: "8 hours/night",
        inputType: "number",
        placeholder: "Hours slept (e.g., 6)",
        valueKey: "sleep",
        btnColor: '#9C27B0',
    },
    {
        title: "Fruits Intake",
        icon: <FruitIcon />,
        target: "5 servings/day",
        inputType: "number",
        placeholder: "Servings of fruit (e.g., 3)",
        valueKey: "fruits",
        btnColor: '#FF5722',
    },
];

function ActivitiesTracker({ userProfile }) {
    const theme = useTheme();
    const userId = userProfile?._id || 'anonymous';
    const [loadingKeys, setLoadingKeys] = useState({});
    const [inputValues, setInputValues] = useState({});
    const [messages, setMessages] = useState({});
    const currentDay = format(new Date(), 'yyyy-MM-dd');
    const activitiesDocRef = doc(db, 'loggedActivities', `${userId}_${currentDay}`);

    const handleInputChange = (key, value) => {
        setInputValues((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmitMetric = async (metricKey) => {
        const value = inputValues[metricKey];

        if (!value || value <= 0) {
            setMessages((prev) => ({
                ...prev,
                [metricKey]: { type: 'error', text: 'Please provide a valid input.' },
            }));
            return;
        }

        setLoadingKeys((prev) => ({ ...prev, [metricKey]: true }));
        try {
            const entry = {
                timestamp: new Date().toISOString(),
                value: Number(value),
            };

            await updateDoc(activitiesDocRef, {
                [metricKey]: arrayUnion(entry),
            }).catch(async (error) => {
                if (error.code === 'not-found') {
                    await setDoc(activitiesDocRef, {
                        userId,
                        [metricKey]: [entry],
                        date: currentDay,
                    });
                } else {
                    throw error;
                }
            });

            setMessages((prev) => ({
                ...prev,
                [metricKey]: { type: 'success', text: 'Entry logged successfully!' },
            }));
            setInputValues((prev) => ({ ...prev, [metricKey]: '' }));
        } catch (error) {
            setMessages((prev) => ({
                ...prev,
                [metricKey]: { type: 'error', text: 'Failed to log activity. Please try again.' },
            }));
            console.error('Error logging metric:', error);
        } finally {
            setLoadingKeys((prev) => ({ ...prev, [metricKey]: false }));
        }
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* Header Section */}
            <Paper
                elevation={3}
                sx={{
                    p: 4,
                    mb: 4,
                    borderRadius: '24px',
                    bgcolor: theme.palette.mode === 'dark' ? alpha('#004e92', 0.9) : alpha('#004e92', 0.8),
                    color: '#fff',
                    textAlign: 'center',
                }}
            >
                <Stack spacing={3} alignItems="center">
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 700,
                            background: 'linear-gradient(45deg, #46F0F9 30%, #E0F7FA 90%)',
                            backgroundClip: 'text',
                            textFillColor: 'transparent',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        Daily Health Activities Tracker 🏃‍♀️
                    </Typography>
                    <Typography variant="h6" sx={{ color: alpha('#fff', 0.9) }}>
                        Log your daily progress and work towards achieving a healthier lifestyle. Small steps lead to big changes!
                    </Typography>
                </Stack>
            </Paper>

            {/* Activity Cards */}
            <Grid container spacing={4}>
                {activityMetrics.map((metric) => (
                    <Grid item xs={12} sm={6} md={4} key={metric.valueKey}>
                        <Card
                            elevation={3}
                            sx={{
                                p: 3,
                                borderRadius: '16px',
                                bgcolor: theme.palette.mode === 'dark' ? alpha('#000', 0.6) : alpha('#fff', 0.8),
                                transition: 'transform 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                },
                            }}
                        >
                            <CardContent>
                                <Stack spacing={2}>
                                    {/* Icon */}
                                    <Box
                                        sx={{
                                            display: 'inline-flex',
                                            p: 2,
                                            borderRadius: '12px',
                                            bgcolor: alpha(metric.btnColor, 0.1),
                                        }}
                                    >
                                        {React.cloneElement(metric.icon, {
                                            sx: { fontSize: 40, color: metric.btnColor },
                                        })}
                                    </Box>

                                    {/* Content */}
                                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                                        {metric.title}
                                    </Typography>
                                    <Typography sx={{ color: theme.palette.text.secondary }}>
                                        Target: {metric.target}
                                    </Typography>

                                    {/* Input */}
                                    <TextField
                                        fullWidth
                                        type={metric.inputType}
                                        placeholder={metric.placeholder}
                                        value={inputValues[metric.valueKey] || ''}
                                        onChange={(e) => handleInputChange(metric.valueKey, e.target.value)}
                                        sx={{
                                            bgcolor: alpha(theme.palette.background.paper, 0.9),
                                            borderRadius: '8px',
                                            '& fieldset': { border: 'none' },
                                        }}
                                    />

                                    {/* Status Message */}
                                    {messages[metric.valueKey] && (
                                        <Typography
                                            sx={{
                                                mt: 1,
                                                color:
                                                    messages[metric.valueKey].type === 'success'
                                                        ? 'limegreen'
                                                        : 'error.main',
                                            }}
                                        >
                                            {messages[metric.valueKey].text}
                                        </Typography>
                                    )}

                                    {/* Submit Button */}
                                    <Button
                                        variant="contained"
                                        fullWidth
                                        disabled={loadingKeys[metric.valueKey]}
                                        onClick={() => handleSubmitMetric(metric.valueKey)}
                                        sx={{
                                            mt: 2,
                                            bgcolor: metric.btnColor,
                                            '&:hover': { bgcolor: alpha(metric.btnColor, 0.8) },
                                        }}
                                    >
                                        {loadingKeys[metric.valueKey] ? (
                                            <CircularProgress size={24} sx={{ color: '#FFF' }} />
                                        ) : (
                                            'Log Activity'
                                        )}
                                    </Button>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
}

export default ActivitiesTracker;

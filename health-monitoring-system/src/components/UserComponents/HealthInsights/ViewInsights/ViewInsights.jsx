'use client';
import React, { useEffect, useState } from 'react';
import {
    alpha,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Container,
    Grid,
    Paper,
    Stack,
    Typography,
    useTheme,
} from '@mui/material';
import {
    DirectionsRun as StepsIcon,
    LocalDrink as WaterIcon,
    FitnessCenter as ExerciseIcon,
    Hotel as SleepIcon,
    Apple as FruitIcon,
} from '@mui/icons-material';
import { db } from '@/server/db/fireStore';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { startOfWeek, endOfWeek, format } from 'date-fns';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const metricsIcons = {
    water: <WaterIcon />,
    steps: <StepsIcon />,
    exercise: <ExerciseIcon />,
    sleep: <SleepIcon />,
    fruits: <FruitIcon />,
};

function ViewInsights({ userProfile }) {
    const theme = useTheme();
    const [loading, setLoading] = useState(true);
    const [activities, setActivities] = useState([]);
    const userId = userProfile?._id || 'anonymous';
    const currentDay = format(new Date(), 'yyyy-MM-dd');
    const weekStart = format(startOfWeek(new Date()), 'yyyy-MM-dd');
    const weekEnd = format(endOfWeek(new Date()), 'yyyy-MM-dd');

    useEffect(() => {
        fetchActivities();
    }, []);

    const fetchActivities = async () => {
        try {
            const activitiesCollection = collection(db, 'loggedActivities');
            const q = query(
                activitiesCollection,
                where('userId', '==', userId),
                where('date', '>=', weekStart),
                where('date', '<=', weekEnd)
            );

            const snapshot = await getDocs(q);
            const fetchedActivities = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setActivities(fetchedActivities);
        } catch (error) {
            console.error('Error fetching activities:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateWeeklyChartData = (metricKey) => {
        const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const data = Array(7).fill(0);

        activities.forEach((activity) => {
            activity[metricKey]?.forEach((entry) => {
                const dayIndex = new Date(entry.timestamp).getDay() - 1; // Adjust for JS week starting on Sunday
                if (dayIndex >= 0 && dayIndex < 7) {
                    data[dayIndex] += entry.value;
                }
            });
        });

        return {
            labels: daysOfWeek,
            datasets: [
                {
                    label: `Weekly ${metricKey.charAt(0).toUpperCase() + metricKey.slice(1)}`,
                    data,
                    backgroundColor: alpha(theme.palette.primary.main, 0.8),
                },
            ],
        };
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* Header */}
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
                            fontWeight: 900,
                            background: 'linear-gradient(45deg, #46F0F9 30%, #E0F7FA 90%)',
                            backgroundClip: 'text',
                            textFillColor: 'transparent',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        Your Health Insights
                    </Typography>
                    <Typography variant="h6" sx={{ color: alpha('#fff', 0.9) }}>
                        Discover trends and monitor your daily, weekly, and monthly progress towards a healthier life. 📝
                    </Typography>
                </Stack>
            </Paper>

            {/* Daily Metrics */}
            <Grid container spacing={4}>
                {['water', 'steps', 'exercise', 'sleep', 'fruits'].map((metricKey) => (
                    <Grid item xs={12} sm={6} md={4} key={metricKey}>
                        <Card
                            elevation={3}
                            sx={{
                                p: 3,
                                borderRadius: '16px',
                                bgcolor: theme.palette.mode === 'dark' ? alpha('#000', 0.6) : alpha('#fff', 0.8),
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
                                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                                        }}
                                    >
                                        {metricsIcons[metricKey]}
                                    </Box>

                                    {/* Content */}
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        {metricKey.charAt(0).toUpperCase() + metricKey.slice(1)}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                        {activities[0]?.[metricKey]?.reduce(
                                            (sum, entry) => sum + entry.value,
                                            0
                                        ) || 0}{' '}
                                        logged today
                                    </Typography>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Weekly Progress */}
            <Paper elevation={3} sx={{ mt: 4, p: 4, borderRadius: '16px' }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Weekly Progress
                </Typography>
                {['water', 'steps', 'exercise', 'sleep', 'fruits'].map((metricKey) => (
                    <Box key={metricKey} sx={{ mb: 4 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                            {metricKey.charAt(0).toUpperCase() + metricKey.slice(1)}
                        </Typography>
                        <Bar data={generateWeeklyChartData(metricKey)} />
                    </Box>
                ))}
            </Paper>
        </Container>
    );
}

export default ViewInsights;

'use client';
import React, { useEffect, useState } from 'react';
import {
    alpha,
    Box,
    Button,
    ButtonGroup,
    Card,
    CardContent,
    CircularProgress,
    Container,
    Grid,
    Paper,
    Stack,
    Typography,
    useTheme,
    Tabs,
    Tab,
    Divider,
    LinearProgress,
    Chip,
} from '@mui/material';
import {
    DirectionsRun as StepsIcon,
    LocalDrink as WaterIcon,
    FitnessCenter as ExerciseIcon,
    Hotel as SleepIcon,
    Apple as FruitIcon,
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
    TrendingFlat as TrendingFlatIcon,
    CalendarToday as CalendarTodayIcon,
    DateRange as DateRangeIcon,
    EventNote as EventNoteIcon,
    Today as TodayIcon,
    ViewWeek as ViewWeekIcon,
    ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { db } from '@/server/db/fireStore';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import {
    startOfWeek,
    endOfWeek,
    startOfMonth,
    endOfMonth,
    startOfYear,
    endOfYear,
    format,
    startOfDay,
    endOfDay,
    subDays,
    subMonths,
    subYears,
    parseISO,
    isWithinInterval
} from 'date-fns';
import { useRouter } from 'next/navigation';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const metricsIcons = {
    water: <WaterIcon />,
    steps: <StepsIcon />,
    exercise: <ExerciseIcon />,
    sleep: <SleepIcon />,
    fruits: <FruitIcon />,
};

const metricUnits = {
    water: 'glasses',
    steps: 'steps',
    exercise: 'minutes',
    sleep: 'hours',
    fruits: 'servings',
};

// Daily targets
const dailyMetricGoals = {
    water: 8,
    steps: 10000,
    exercise: 30,
    sleep: 8,
    fruits: 5,
};

// Weekly targets (daily * 7)
const weeklyMetricGoals = {
    water: dailyMetricGoals.water * 7,
    steps: dailyMetricGoals.steps * 7,
    exercise: dailyMetricGoals.exercise * 7,
    sleep: dailyMetricGoals.sleep * 7,
    fruits: dailyMetricGoals.fruits * 7,
};

// Monthly targets (daily * 30)
const monthlyMetricGoals = {
    water: dailyMetricGoals.water * 30,
    steps: dailyMetricGoals.steps * 30,
    exercise: dailyMetricGoals.exercise * 30,
    sleep: dailyMetricGoals.sleep * 30,
    fruits: dailyMetricGoals.fruits * 30,
};

// Yearly targets (daily * 365)
const yearlyMetricGoals = {
    water: dailyMetricGoals.water * 365,
    steps: dailyMetricGoals.steps * 365,
    exercise: dailyMetricGoals.exercise * 365,
    sleep: dailyMetricGoals.sleep * 365,
    fruits: dailyMetricGoals.fruits * 365,
};

const getMetricGoal = (period) => {
    switch (period) {
        case 'week':
            return weeklyMetricGoals;
        case 'month':
            return monthlyMetricGoals;
        case 'year':
            return yearlyMetricGoals;
        default:
            return dailyMetricGoals;
    }
};

const metricColors = {
    water: {
        light: '#E3F2FD',
        main: '#2196F3',
        dark: '#1976D2'
    },
    steps: {
        light: '#E8F5E9',
        main: '#4CAF50',
        dark: '#388E3C'
    },
    exercise: {
        light: '#FFF3E0',
        main: '#FF9800',
        dark: '#F57C00'
    },
    sleep: {
        light: '#F3E5F5',
        main: '#9C27B0',
        dark: '#7B1FA2'
    },
    fruits: {
        light: '#FFEBEE',
        main: '#F44336',
        dark: '#D32F2F'
    }
};

function ViewInsights({ userProfile }) {
    const theme = useTheme();
    const [loading, setLoading] = useState(true);
    const [dailyActivities, setDailyActivities] = useState([]);
    const [periodActivities, setPeriodActivities] = useState([]);
    const [selectedView, setSelectedView] = useState(0);
    const [selectedPeriod, setSelectedPeriod] = useState('week'); // 'week', 'month', 'year'
    const [trends, setTrends] = useState({});
    const userId = userProfile?._id || 'anonymous';
    const router = useRouter();

    useEffect(() => {
        fetchActivities();
    }, [selectedPeriod]);

    const getDateRange = (period) => {
        const now = new Date();
        switch (period) {
            case 'week':
                return {
                    start: startOfWeek(now),
                    end: endOfWeek(now),
                    previous: {
                        start: startOfWeek(subDays(now, 7)),
                        end: endOfWeek(subDays(now, 7))
                    }
                };
            case 'month':
                return {
                    start: startOfMonth(now),
                    end: endOfMonth(now),
                    previous: {
                        start: startOfMonth(subMonths(now, 1)),
                        end: endOfMonth(subMonths(now, 1))
                    }
                };
            case 'year':
                return {
                    start: startOfYear(now),
                    end: endOfYear(now),
                    previous: {
                        start: startOfYear(subYears(now, 1)),
                        end: endOfYear(subYears(now, 1))
                    }
                };
            default:
                return getDateRange('week');
        }
    };

    const fetchActivities = async () => {
        try {
            const activitiesCollection = collection(db, 'loggedActivities');
            const today = new Date();
            const dateRange = getDateRange(selectedPeriod);

            // Query for the selected period
            const periodQuery = query(
                activitiesCollection,
                where('userId', '==', userId),
                where('date', '>=', format(dateRange.start, 'yyyy-MM-dd')),
                where('date', '<=', format(dateRange.end, 'yyyy-MM-dd')),
                orderBy('date', 'desc')
            );

            // Query for today's activities
            const todayQuery = query(
                activitiesCollection,
                where('userId', '==', userId),
                where('date', '==', format(today, 'yyyy-MM-dd'))
            );

            // Query for previous period
            const previousPeriodQuery = query(
                activitiesCollection,
                where('userId', '==', userId),
                where('date', '>=', format(dateRange.previous.start, 'yyyy-MM-dd')),
                where('date', '<', format(dateRange.start, 'yyyy-MM-dd')),
                orderBy('date', 'desc')
            );

            const [periodSnapshot, todaySnapshot, prevPeriodSnapshot] = await Promise.all([
                getDocs(periodQuery),
                getDocs(todayQuery),
                getDocs(previousPeriodQuery)
            ]);

            const fetchedPeriodActivities = periodSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            const fetchedDailyActivities = todaySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            const prevPeriodActivities = prevPeriodSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Calculate trends
            const calculatedTrends = {};
            ['water', 'steps', 'exercise', 'sleep', 'fruits'].forEach(metric => {
                // Calculate current period total
                const currentTotal = fetchedPeriodActivities.reduce((sum, activity) => {
                    if (!activity[metric] || !Array.isArray(activity[metric])) return sum;
                    return sum + activity[metric].reduce((metricSum, entry) => metricSum + (entry.value || 0), 0);
                }, 0);

                // Calculate previous period total
                const previousTotal = prevPeriodActivities.reduce((sum, activity) => {
                    if (!activity[metric] || !Array.isArray(activity[metric])) return sum;
                    return sum + activity[metric].reduce((metricSum, entry) => metricSum + (entry.value || 0), 0);
                }, 0);

                // Calculate trend
                let trend = 0;
                if (previousTotal > 0) {
                    trend = ((currentTotal - previousTotal) / previousTotal) * 100;
                } else if (currentTotal > 0) {
                    trend = 100; // If there was no previous data but we have current data, show as 100% increase
                }

                calculatedTrends[metric] = trend;
            });

            console.log('Daily Activities:', fetchedDailyActivities); // Debug log
            console.log('Calculated Trends:', calculatedTrends); // Debug log

            setDailyActivities(fetchedDailyActivities);
            setPeriodActivities(fetchedPeriodActivities);
            setTrends(calculatedTrends);
        } catch (error) {
            console.error('Error fetching activities:', error);
        } finally {
            setLoading(false);
        }
    };

    const getMetricValue = (activity, metric) => {
        if (!activity || !activity[metric] || !Array.isArray(activity[metric])) return 0;
        return activity[metric].reduce((sum, entry) => sum + (entry.value || 0), 0);
    };

    const getTrendIcon = (trend) => {
        if (trend > 5) return <TrendingUpIcon sx={{ color: 'success.main' }} />;
        if (trend < -5) return <TrendingDownIcon sx={{ color: 'error.main' }} />;
        return <TrendingFlatIcon sx={{ color: 'warning.main' }} />;
    };

    const DailyOverview = () => (
        <Grid container spacing={3}>
            {Object.keys(metricsIcons).map((metric) => {
                const currentValue = getMetricValue(dailyActivities[0], metric);
                const progress = (currentValue / dailyMetricGoals[metric]) * 100;
                const colors = metricColors[metric];
                const trend = trends[metric] || 0;

                return (
                    <Grid item xs={12} md={6} lg={4} key={metric}>
                        <Card
                            elevation={3}
                            sx={{
                                p: 3,
                                borderRadius: '16px',
                                background: `linear-gradient(135deg, ${colors.light} 0%, ${alpha(colors.light, 0.9)} 100%)`,
                                border: `1px solid ${alpha(colors.main, 0.1)}`,
                                transition: 'transform 0.2s ease-in-out',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: `0 8px 24px ${alpha(colors.main, 0.15)}`,
                                },
                            }}
                        >
                            <Stack spacing={2}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1,
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                p: 1.5,
                                                borderRadius: '12px',
                                                bgcolor: alpha(colors.main, 0.1),
                                                color: colors.dark,
                                            }}
                                        >
                                            {metricsIcons[metric]}
                                        </Box>
                                        <Typography variant="h6" sx={{ fontWeight: 600, color: colors.dark }}>
                                            {metric.charAt(0).toUpperCase() + metric.slice(1)}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ color: colors.dark }}>
                                        {getTrendIcon(trend)}
                                    </Box>
                                </Box>

                                <Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="body2" sx={{ color: alpha(colors.dark, 0.7) }}>
                                            Progress
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: colors.dark, fontWeight: 500 }}>
                                            {currentValue} / {dailyMetricGoals[metric]} {metricUnits[metric]}
                                        </Typography>
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={Math.min(progress, 100)}
                                        sx={{
                                            height: 8,
                                            borderRadius: 4,
                                            bgcolor: alpha(colors.main, 0.1),
                                            '& .MuiLinearProgress-bar': {
                                                borderRadius: 4,
                                                bgcolor: colors.main,
                                            },
                                        }}
                                    />
                                </Box>

                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    {trend !== 0 && (
                                        <Chip
                                            size="small"
                                            label={`${Math.abs(trend).toFixed(1)}% ${trend > 0 ? 'increase' : 'decrease'}`}
                                            sx={{
                                                bgcolor: alpha(colors.main, 0.1),
                                                color: colors.dark,
                                                borderColor: alpha(colors.main, 0.2),
                                                '& .MuiChip-icon': {
                                                    color: colors.dark,
                                                },
                                            }}
                                            variant="outlined"
                                        />
                                    )}
                                </Box>
                            </Stack>
                        </Card>
                    </Grid>
                );
            })}
        </Grid>
    );

    const PeriodAnalytics = () => {
        const buttonSx = (isActive) => ({
            px: 3,
            py: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            color: isActive ? 'white' : 'primary.main',
            bgcolor: isActive ? 'primary.main' : 'transparent',
            borderColor: 'primary.main',
            '&:hover': {
                bgcolor: isActive ? 'primary.dark' : alpha(theme.palette.primary.main, 0.1),
            },
            transition: 'all 0.2s ease-in-out',
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.95rem',
            borderRadius: '10px',
            ...(isActive && {
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.25)}`,
            }),
        });

        const chartOptions = {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            const label = context.dataset.label || '';
                            const value = context.parsed.y;
                            return `${label}: ${value} ${metricUnits[context.dataset.metric]}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        drawBorder: false,
                        color: (context) => {
                            if (context.tick.value === 0) {
                                return 'rgba(0, 0, 0, 0.1)';
                            }
                            return 'rgba(0, 0, 0, 0.05)';
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            barThickness: 'flex',
            maxBarThickness: 40,
            categoryPercentage: 0.8,
            barPercentage: 0.9,
        };

        const getLabels = () => {
            switch (selectedPeriod) {
                case 'week':
                    return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                case 'month':
                    return Array.from({ length: 31 }, (_, i) => `${i + 1}`);
                case 'year':
                    return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                default:
                    return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            }
        };

        return (
            <>
                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color:'#FFF'}}>
                        {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)}ly Analysis
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            onClick={() => setSelectedPeriod('week')}
                            sx={buttonSx(selectedPeriod === 'week')}
                            startIcon={<CalendarTodayIcon />}
                        >
                            Week
                        </Button>
                        <Button
                            onClick={() => setSelectedPeriod('month')}
                            sx={buttonSx(selectedPeriod === 'month')}
                            startIcon={<DateRangeIcon />}
                        >
                            Month
                        </Button>
                        <Button
                            onClick={() => setSelectedPeriod('year')}
                            sx={buttonSx(selectedPeriod === 'year')}
                            startIcon={<EventNoteIcon />}
                        >
                            Year
                        </Button>
                    </Box>
                </Box>

                <Grid container spacing={4}>
                    {Object.keys(metricsIcons).map((metric) => {
                        const colors = metricColors[metric];
                        return (
                            <Grid item xs={12} key={metric}>
                                <Paper
                                    elevation={3}
                                    sx={{
                                        p: 3,
                                        borderRadius: '16px',
                                        background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
                                    }}
                                >
                                    <Stack spacing={3}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Box
                                                    sx={{
                                                        p: 1,
                                                        borderRadius: '12px',
                                                        bgcolor: alpha(colors.main, 0.1),
                                                        color: colors.dark,
                                                    }}
                                                >
                                                    {metricsIcons[metric]}
                                                </Box>
                                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                                    {metric.charAt(0).toUpperCase() + metric.slice(1)} Trend
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Chip
                                                    icon={getTrendIcon(trends[metric])}
                                                    label={`${Math.abs(trends[metric]).toFixed(1)}% vs last ${selectedPeriod}`}
                                                    color={trends[metric] > 0 ? 'success' : 'error'}
                                                    variant="outlined"
                                                />
                                            </Box>
                                        </Box>

                                        <Box sx={{ height: 300, position: 'relative' }}>
                                            <Bar
                                                options={chartOptions}
                                                data={{
                                                    labels: getLabels(),
                                                    datasets: [
                                                        {
                                                            label: metric,
                                                            data: (() => {
                                                                const data = new Array(getLabels().length).fill(0);
                                                                periodActivities.forEach(activity => {
                                                                    if (!activity.date) return;
                                                                    
                                                                    const date = parseISO(activity.date);
                                                                    let index;
                                                                    
                                                                    switch (selectedPeriod) {
                                                                        case 'week':
                                                                            index = date.getDay(); // 0-6 (Sunday-Saturday)
                                                                            break;
                                                                        case 'month':
                                                                            index = date.getDate() - 1; // 0-30
                                                                            break;
                                                                        case 'year':
                                                                            index = date.getMonth(); // 0-11
                                                                            break;
                                                                        default:
                                                                            return;
                                                                    }
                                                                    
                                                                    const metricArray = activity[metric] || [];
                                                                    const value = metricArray.reduce((sum, entry) => sum + (entry.value || 0), 0);
                                                                    data[index] = (data[index] || 0) + value;
                                                                });
                                                                return data;
                                                            })(),
                                                            backgroundColor: alpha(colors.main, 0.8),
                                                            borderColor: colors.main,
                                                            borderWidth: 1,
                                                            borderRadius: 4,
                                                            hoverBackgroundColor: colors.main,
                                                            metric: metric
                                                        }
                                                    ],
                                                }}
                                            />
                                        </Box>

                                        <Box>
                                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                                {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)}ly Summary
                                            </Typography>
                                            <Grid container spacing={2}>
                                                <Grid item xs={4}>
                                                    <Paper
                                                        sx={{
                                                            p: 1.5,
                                                            textAlign: 'center',
                                                            bgcolor: alpha(colors.light, 0.5),
                                                            border: `1px solid ${alpha(colors.main, 0.1)}`
                                                        }}
                                                    >
                                                        <Typography variant="body2" color="text.secondary">
                                                            Achieved/Target
                                                        </Typography>
                                                        <Typography variant="h6" sx={{ color: colors.dark }}>
                                                            {periodActivities.reduce((sum, activity) => {
                                                                const metricArray = activity[metric] || [];
                                                                return sum + metricArray.reduce((metricSum, entry) => metricSum + (entry.value || 0), 0);
                                                            }, 0)} / {getMetricGoal(selectedPeriod)[metric]}
                                                        </Typography>
                                                    </Paper>
                                                </Grid>
                                                <Grid item xs={4}>
                                                    <Paper
                                                        sx={{
                                                            p: 1.5,
                                                            textAlign: 'center',
                                                            bgcolor: alpha(colors.light, 0.5),
                                                            border: `1px solid ${alpha(colors.main, 0.1)}`
                                                        }}
                                                    >
                                                        <Typography variant="body2" color="text.secondary">
                                                            Goal
                                                        </Typography>
                                                        <Typography variant="h6" sx={{ color: colors.dark }}>
                                                            {getMetricGoal(selectedPeriod)[metric]}
                                                        </Typography>
                                                    </Paper>
                                                </Grid>
                                                <Grid item xs={4}>
                                                    <Paper
                                                        sx={{
                                                            p: 1.5,
                                                            textAlign: 'center',
                                                            bgcolor: alpha(colors.light, 0.5),
                                                            border: `1px solid ${alpha(colors.main, 0.1)}`
                                                        }}
                                                    >
                                                        <Typography variant="body2" color="text.secondary">
                                                            Progress
                                                        </Typography>
                                                        <Typography
                                                            variant="h6"
                                                            sx={{
                                                                color: periodActivities.reduce((sum, activity) => {
                                                                    const metricArray = activity[metric] || [];
                                                                    return sum + metricArray.reduce((metricSum, entry) => metricSum + (entry.value || 0), 0);
                                                                }, 0) / getMetricGoal(selectedPeriod)[metric] >= 1
                                                                    ? 'success.main'
                                                                    : 'error.main'
                                                            }}
                                                        >
                                                            {Math.round((periodActivities.reduce((sum, activity) => {
                                                                const metricArray = activity[metric] || [];
                                                                return sum + metricArray.reduce((metricSum, entry) => metricSum + (entry.value || 0), 0);
                                                            }, 0) / getMetricGoal(selectedPeriod)[metric]) * 100)}%
                                                        </Typography>
                                                    </Paper>
                                                </Grid>
                                            </Grid>
                                        </Box>
                                    </Stack>
                                </Paper>
                            </Grid>
                        );
                    })}
                </Grid>
            </>
        );
    };

    const TabPanel = ({ children, value, index, ...other }) => {
        return (
            <div
                role="tabpanel"
                hidden={value !== index}
                id={`insights-tabpanel-${index}`}
                aria-labelledby={`insights-tab-${index}`}
                {...other}
            >
                {value === index && (
                    <Box sx={{ py: 3 }}>
                        {children}
                    </Box>
                )}
            </div>
        );
    };

    const [selectedTab, setSelectedTab] = useState(1);

    const handleTabChange = (event, newValue) => {
        if (newValue === 0) {
            router.push('/user/personalized/logger');
        } else {
            setSelectedTab(newValue);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ py: 0.5, m: 0 }}>
            {/* Header */}
            <Paper
                elevation={3}
                sx={{
                    p: 4,
                    mb: 2,
                    borderRadius: '24px',
                    background: `linear-gradient(135deg, ${alpha('#004e92', 0.95)} 0%, ${alpha('#000428', 0.9)} 100%)`,
                    color: '#fff',
                }}
            >
                <Stack spacing={3} alignItems="center">
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 900,
                            background: 'linear-gradient(45deg, #46F0F9 30%, #E0F7FA 90%)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            textAlign: 'center',
                        }}
                    >
                        Health Analytics Dashboard
                    </Typography>
                    <Typography variant="h6" sx={{ color: alpha('#fff', 0.9), textAlign: 'center', maxWidth: '1000px' }}>
                        Track your progress, analyze trends, and achieve your health goals with detailed insights
                    </Typography>
                </Stack>
            </Paper>

            {/* View Selector */}
            <Box sx={{ width: '100%' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs
                        value={selectedTab}
                        onChange={handleTabChange}
                        sx={{
                            '& .MuiTab-root': {
                                textTransform: 'none',
                                fontSize: '1rem',
                                fontWeight: 600,
                                minHeight: 48,
                                px: 3,
                            },
                        }}
                    >
                        <Tab
                            icon={<ArrowBackIcon />}
                            iconPosition="start"
                            label="Logger"
                            sx={{
                                color: '#00b8e6',
                                '&.Mui-selected': {
                                    color: '#00b8e6',
                                },
                            }}
                        />
                        <Tab
                            icon={<TodayIcon />}
                            iconPosition="start"
                            label="Daily Overview"
                            sx={{
                                color: 'gold',
                                '&.Mui-selected': {
                                    color: 'gold',
                                },
                            }}
                        />
                        <Tab
                            icon={<ViewWeekIcon />}
                            iconPosition="start"
                            label="Weekly Overview"
                            sx={{
                                color: 'limegreen',
                                '&.Mui-selected': {
                                    color: 'limegreen',
                                },
                            }}
                        />
                    </Tabs>
                </Box>

                <TabPanel value={selectedTab} index={1}>
                    <DailyOverview />
                </TabPanel>
                <TabPanel value={selectedTab} index={2}>
                    <PeriodAnalytics />
                </TabPanel>
            </Box>
        </Container>
    );
}

export default ViewInsights;

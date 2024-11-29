'use client';
import React, {useState} from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Button,
    Card,
    CardContent,
    useTheme,
    Avatar,
    IconButton,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
    HealthAndSafety,
    People,
    Assignment,
    Notifications,
    ArrowForward,
    PlayArrow,
    AccountCircle,
    Schedule,
} from '@mui/icons-material';
import {useRouter} from "next/navigation";

const FeatureCard = ({ icon, title, description, delay }) => {
    const theme = useTheme();


    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
        >
            <Card
                sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s',
                    '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: theme.shadows[8],
                    },
                }}
            >
                <CardContent>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            mb: 2,
                        }}
                    >
                        <Avatar
                            sx={{
                                bgcolor: theme.palette.primary.main,
                                width: 48,
                                height: 48,
                            }}
                        >
                            {icon}
                        </Avatar>
                    </Box>
                    <Typography variant="h6" gutterBottom>
                        {title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {description}
                    </Typography>
                </CardContent>
            </Card>
        </motion.div>
    );
};

const GetStarted = () => {
    const theme = useTheme();
    const router = useRouter();
    const [loading, setLoading] = useState(false); // Loading state

    const handleGetStarted = () => {
        setLoading(true);
        router.push('/health-worker/settings/profile/update');
    };

    const features = [
        {
            icon: <HealthAndSafety />,
            title: 'Patient Care',
            description: 'Manage patient records, track health progress, and provide personalized care plans.',
        },
        {
            icon: <People />,
            title: 'Community Engagement',
            description: 'Connect with your community, organize health camps, and conduct awareness programs.',
        },
        {
            icon: <Assignment />,
            title: 'Task Management',
            description: 'Organize your daily tasks, set priorities, and track your progress efficiently.',
        },
        {
            icon: <Notifications />,
            title: 'Real-time Updates',
            description: 'Stay informed with instant notifications about patient needs and community events.',
        },
    ];

    return (
        <Box sx={{ py: 8, px: 3 }}>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Box sx={{ textAlign: 'center', mb: 8 }}>
                    <Typography
                        variant="h3"
                        component="h1"
                        gutterBottom
                        sx={{
                            fontWeight: 700,
                            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                            backgroundClip: 'text',
                            textFillColor: 'transparent',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        Welcome to Your Health Worker Dashboard
                    </Typography>
                    <Typography variant="h6" color="#FFF" sx={{ mb: 4 }}>
                        Your platform for efficient community healthcare management
                    </Typography>
                </Box>
            </motion.div>

            <Grid container spacing={4}>
                {features.map((feature, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                        <FeatureCard {...feature} delay={index * 0.1} />
                    </Grid>
                ))}
            </Grid>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
            >
                <Paper
                    sx={{
                        mt: 8,
                        p: 4,
                        background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                        color: 'white',
                        borderRadius: 4,
                    }}
                >
                    <Grid container spacing={4} alignItems="center">
                        <Grid item xs={12} md={8}>
                            <Typography variant="h4" gutterBottom>
                                Ready to make an impact?
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 3 }}>
                                Start managing your community health initiatives and track your progress in real-time.
                            </Typography>
                            <Button
                                variant="contained"
                                color="secondary"
                                endIcon={<ArrowForward />}
                                onClick={handleGetStarted}
                                sx={{
                                    borderRadius: '28px',
                                    px: 4,
                                    py: 1.5,
                                    textTransform: 'none',
                                }}
                            >
                                Get Started Now
                            </Button>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    gap: 2,
                                }}
                            >
                                <IconButton
                                    sx={{
                                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                                        '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.2)' },
                                    }}
                                >
                                    <AccountCircle sx={{ fontSize: 32, color: 'white' }} />
                                </IconButton>
                                <IconButton
                                    sx={{
                                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                                        '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.2)' },
                                    }}
                                >
                                    <Schedule sx={{ fontSize: 32, color: 'white' }} />
                                </IconButton>
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>
            </motion.div>
        </Box>
    );
};

export default GetStarted;

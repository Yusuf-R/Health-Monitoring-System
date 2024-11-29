'use client';
import React from 'react';
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
    LocalHospital,
    EventNote,
    Message,
    Favorite,
    ArrowForward,
    PlayArrow,
    HealthAndSafety,
    MonitorHeart,
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
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: theme.shadows[8],
                        '& .feature-icon': {
                            transform: 'scale(1.1)',
                        },
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
                            className="feature-icon"
                            sx={{
                                bgcolor: theme.palette.secondary.main,
                                width: 56,
                                height: 56,
                                transition: 'transform 0.3s ease',
                            }}
                        >
                            {icon}
                        </Avatar>
                    </Box>
                    <Typography
                        variant="h6"
                        gutterBottom
                        sx={{
                            fontWeight: 600,
                            color: theme.palette.primary.main,
                        }}
                    >
                        {title}
                    </Typography>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ lineHeight: 1.6 }}
                    >
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

    const handleGetStarted = () => {
        router.push('/user/settings/profile/update');
    };

    const features = [
        {
            icon: <LocalHospital sx={{ fontSize: 32 }} />,
            title: 'Find Healthcare',
            description: 'Connect with qualified health workers in your community for personalized care and consultations.',
        },
        {
            icon: <EventNote sx={{ fontSize: 32 }} />,
            title: 'Book Appointments',
            description: 'Schedule appointments with health workers at your convenience, with easy rescheduling options.',
        },
        {
            icon: <Message sx={{ fontSize: 32 }} />,
            title: 'Health Chat',
            description: 'Securely communicate with your healthcare providers and get quick responses to your queries.',
        },
        {
            icon: <Favorite sx={{ fontSize: 32 }} />,
            title: 'Health Tracking',
            description: 'Monitor your health metrics, track medications, and maintain your personal health records.',
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
                            background: `linear-gradient(45deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
                            backgroundClip: 'text',
                            textFillColor: 'transparent',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        Your Health Journey Starts Here
                    </Typography>
                    <Typography
                        variant="h6"
                        color="#FFF"
                        sx={{
                            mb: 4,
                            maxWidth: '800px',
                            mx: 'auto',
                            lineHeight: 1.6
                        }}
                    >
                        Access quality healthcare, connect with health workers, and take control of your well-being
                    </Typography>
                    <Button
                        variant="contained"
                        size="large"
                        endIcon={<PlayArrow />}
                        sx={{
                            borderRadius: '28px',
                            px: 4,
                            py: 1.5,
                            textTransform: 'none',
                            fontSize: '1.1rem',
                            background: `linear-gradient(45deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
                            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                            '&:hover': {
                                background: `linear-gradient(45deg, ${theme.palette.secondary.dark}, ${theme.palette.primary.dark})`,
                            },
                        }}
                    >
                        Watch How It Works
                    </Button>
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
                        background: `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
                        color: 'white',
                        borderRadius: 4,
                        overflow: 'hidden',
                        position: 'relative',
                    }}
                >
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            width: '150px',
                            height: '150px',
                            background: 'rgba(255,255,255,0.1)',
                            borderRadius: '0 0 0 150px',
                        }}
                    />
                    <Grid container spacing={4} alignItems="center">
                        <Grid item xs={12} md={8}>
                            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
                                Ready to prioritize your health?
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
                                Join our community of health-conscious individuals and get access to quality healthcare services.
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
                                    bgcolor: 'white',
                                    color: theme.palette.secondary.main,
                                    '&:hover': {
                                        bgcolor: 'rgba(255,255,255,0.9)',
                                    },
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
                                        bgcolor: 'rgba(255,255,255,0.15)',
                                        '&:hover': {
                                            bgcolor: 'rgba(255,255,255,0.25)',
                                            transform: 'scale(1.1)',
                                        },
                                        transition: 'all 0.3s ease',
                                    }}
                                >
                                    <HealthAndSafety sx={{ fontSize: 32, color: 'white' }} />
                                </IconButton>
                                <IconButton
                                    sx={{
                                        bgcolor: 'rgba(255,255,255,0.15)',
                                        '&:hover': {
                                            bgcolor: 'rgba(255,255,255,0.25)',
                                            transform: 'scale(1.1)',
                                        },
                                        transition: 'all 0.3s ease',
                                    }}
                                >
                                    <MonitorHeart sx={{ fontSize: 32, color: 'white' }} />
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

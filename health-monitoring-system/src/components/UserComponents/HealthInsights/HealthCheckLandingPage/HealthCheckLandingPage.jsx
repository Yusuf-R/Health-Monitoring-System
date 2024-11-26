'use client';
import React from 'react';
import {
    Box,
    Typography,
    Button,
    Grid,
    Card,
    CardContent,
    Container,
    useTheme,
    alpha,
    Paper,
    Stack,
} from '@mui/material';
import {
    HealthAndSafety as HealthIcon,
    LocalHospital as HospitalIcon,
    Poll as PollIcon,
    EmojiPeople as PeopleIcon,
    ArrowForward as ArrowIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

const features = [
    {
        icon: <HealthIcon />,
        title: 'Explore Health Conditions',
        description: 'Browse through a curated list of common health issues and learn about their symptoms, prevention, and treatments.',
        color: '#000FFF',
        route: '/user/personalized/health-check',
        buttonText: 'Explore Now'
    },
    {
        icon: <PeopleIcon />,
        title: 'Logger',
        description: 'Use our interactive tool to compare your symptoms with those of prevalent health conditions and also log your healthy activities.',
        color: '#4CAF50',
        route: '/user/personalized/logger',
        buttonText: 'Start Logging'
    },
    {
        icon: <PollIcon />,
        title: 'Contribute to Statistics',
        description: 'Help healthcare providers by contributing to real-time data on your health activities in your community.',
        color: '#FFA726',
        route: '/user/personalized/activities',
        buttonText: 'View Activities'
    },
    {
        icon: <HospitalIcon />,
        title: 'Contact Health Experts',
        description: 'Easily reach out to local healthcare professionals or practitioners for tailored assistance.',
        color: '#9C27B0',
        route: '/user/health-check/contact',
        buttonText: 'Contact Now'
    }
];

function HealthCheckLandingPage() {
    const router = useRouter();
    const theme = useTheme();

    return (
        <Container maxWidth="xl" sx={{ py: 6 }}>
            {/* Hero Section */}
            <Paper
                elevation={3}
                sx={{
                    p: 5,
                    mb: 6,
                    borderRadius: '24px',
                    bgcolor: theme.palette.mode === 'dark' ? alpha('#004e92', 0.9) : alpha('#004e92', 0.8),
                    color: '#fff',
                    textAlign: 'center'
                }}
            >
                <Stack spacing={3} alignItems="center">
                    <Typography variant="h3" sx={{
                        fontWeight: 700,
                        background: 'linear-gradient(45deg, #46F0F9 30%, #E0F7FA 90%)',
                        backgroundClip: 'text',
                        textFillColor: 'transparent',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}>
                        HEALTH INSIGHTS 🩺
                    </Typography>
                    <Typography variant="h5" sx={{ maxWidth: '1200px', color: alpha('#fff', 1.0) }}>
                        Explore prevalent health conditions, match your symptoms, and connect with healthcare professionals for personalized advice.
                    </Typography>
                </Stack>
            </Paper>

            {/* Features Grid */}
            <Grid container spacing={4}>
                {features.map((feature, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                        <Card
                            elevation={3}
                            sx={{
                                height: '100%',
                                bgcolor: theme.palette.mode === 'dark' ? alpha('#000', 0.6) : alpha('#fff', 0.8),
                                borderRadius: '16px',
                                transition: 'transform 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-4px)'
                                }
                            }}
                        >
                            <CardContent>
                                <Stack spacing={3} sx={{ height: '100%' }}>
                                    {/* Icon */}
                                    <Box sx={{
                                        display: 'inline-flex',
                                        p: 2,
                                        borderRadius: '12px',
                                        bgcolor: alpha(feature.color, 0.1),
                                    }}>
                                        {React.cloneElement(feature.icon, {
                                            sx: { fontSize: 40, color: feature.color }
                                        })}
                                    </Box>

                                    {/* Content */}
                                    <Typography variant="h5" sx={{
                                        fontWeight: 600,
                                        color: theme.palette.mode === 'dark' ? '#fff' : '#000'
                                    }}>
                                        {feature.title}
                                    </Typography>

                                    <Typography sx={{
                                        color: theme.palette.mode === 'dark' ? alpha('#fff', 0.7) : alpha('#000', 0.7)
                                    }}>
                                        {feature.description}
                                    </Typography>

                                    {/* Button */}
                                    <Button
                                        variant="text"
                                        endIcon={<ArrowIcon />}
                                        onClick={() => router.push(feature.route)}
                                        sx={{
                                            color: feature.color,
                                            mt: 'auto',
                                            '&:hover': {
                                                bgcolor: alpha(feature.color, 0.1)
                                            }
                                        }}
                                    >
                                        {feature.buttonText}
                                    </Button>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Footer CTA */}
            <Paper
                elevation={3}
                sx={{
                    mt: 6,
                    p: 4,
                    borderRadius: '16px',
                    bgcolor: theme.palette.mode === 'dark' ? alpha('#000', 0.6) : alpha('#fff', 0.8),
                    textAlign: 'center'
                }}
            >
                <Stack spacing={2} alignItems="center">
                    <Typography variant="h4" sx={{
                        fontWeight: 600,
                        color: theme.palette.mode === 'dark' ? '#fff' : '#000'
                    }}>
                        Your health is your wealth
                    </Typography>
                    <Typography sx={{
                        color: theme.palette.mode === 'dark' ? alpha('#fff', 0.7) : alpha('#000', 0.7),
                        maxWidth: '600px'
                    }}>
                        Take the first step today towards a healthier, more informed lifestyle with our comprehensive health tools.
                    </Typography>
                    <Button
                        variant="outlined"
                        endIcon={<ArrowIcon />}
                        onClick={() => router.push('/user/health-check/overview')}
                        sx={{
                            mt: 2,
                            borderColor: '#00CC00',
                            color: '#ff9933',
                            '&:hover': {
                                borderColor: '#46F0F9',
                                bgcolor: alpha('#46F0F9', 0.1)
                            }
                        }}
                    >
                        Learn More About Our Tools
                    </Button>
                </Stack>
            </Paper>
        </Container>
    );
}

export default HealthCheckLandingPage;

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
    Stack,
    Tabs,
    Tab,
    Typography,
    useTheme,
} from '@mui/material';
import {
    Healing as SymptomIcon,
    Insights as InsightsIcon,
    LocalHospital as HospitalIcon,
    DirectionsRun as ActivitiesIcon,
} from '@mui/icons-material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useRouter } from 'next/navigation';

const features = [
    {
        title: "Log Your Symptoms",
        description: "Keep track of your symptoms and monitor your health history.",
        icon: <SymptomIcon />,
        route: '/user/personalized/logger/symptom-logger',
        btnColor: '#4CAF50',
    },
    {
        title: "Activities",
        description: "Monitor your fitness and get personalized workout recommendations.",
        icon: <ActivitiesIcon />,
        route: '/user/personalized/logger/activity-tracker',
        btnColor: '#00BCD4',
    },
    {
        title: "View Insights",
        description: "Gain insights into your health with real-time data and analytics.",
        icon: <InsightsIcon />,
        route: '/user/personalized/logger/insights',
        btnColor: '#007FFF',
    },
    {
        title: "Connect with Doctors",
        description: "Reach out to healthcare professionals for tailored advice.",
        icon: <HospitalIcon />,
        route: '/user/tools/chat',
        btnColor: '#9C27B0',
    },
];

function LoggerLandingPage() {
    const [selectedTab, setSelectedTab] = useState('All');
    const router = useRouter();
    const theme = useTheme();

    const handleTabChange = (event, newValue) => {
        setSelectedTab(newValue);
        if (newValue !== 'All') {
            const selectedFeature = features.find(feature => feature.title === newValue);
            if (selectedFeature) {
                router.push(selectedFeature.route);
            }
        }
    };

    return (
        <Container maxWidth="xl" sx={{ py: 0.5, m:0 }}>
            {/* Tabs Section */}
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
                            value={feature.title}
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

            {/* Cards Section */}
            <Grid container spacing={4}>
                {features.map((feature, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                        <Card
                            elevation={3}
                            sx={{
                                height: '100%',
                                bgcolor: theme.palette.mode === 'dark' ? alpha('#000', 0.6) : alpha('#fff', 0.8),
                                borderRadius: '16px',
                                transition: 'transform 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                },
                                cursor: 'pointer',
                            }}
                            onClick={() => router.push(feature.route)}
                        >
                            <CardContent>
                                <Stack spacing={3} sx={{ height: '100%' }}>
                                    {/* Icon */}
                                    <Box
                                        sx={{
                                            display: 'inline-flex',
                                            p: 2,
                                            borderRadius: '12px',
                                            bgcolor: alpha(feature.btnColor, 0.1),
                                        }}
                                    >
                                        {React.cloneElement(feature.icon, {
                                            sx: { fontSize: 40, color: feature.btnColor },
                                        })}
                                    </Box>

                                    {/* Content */}
                                    <Typography
                                        variant="h5"
                                        sx={{
                                            fontWeight: 600,
                                            color: theme.palette.mode === 'dark' ? '#fff' : '#000',
                                        }}
                                    >
                                        {feature.title}
                                    </Typography>

                                    <Typography
                                        sx={{
                                            color: theme.palette.mode === 'dark' ? alpha('#fff', 0.7) : alpha('#000', 0.7),
                                        }}
                                    >
                                        {feature.description}
                                    </Typography>

                                    {/* Button */}
                                    <Button
                                        variant="text"
                                        endIcon={<ArrowForwardIcon />}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            router.push(feature.route);
                                        }}
                                        sx={{
                                            color: feature.btnColor,
                                            mt: 'auto',
                                            '&:hover': {
                                                bgcolor: alpha(feature.btnColor, 0.1),
                                            },
                                        }}
                                    >
                                        {feature.title}
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

export default LoggerLandingPage;

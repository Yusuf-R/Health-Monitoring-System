'use client';
import React, {useEffect, useState} from 'react';
import {doc, getDoc} from 'firebase/firestore';
import {db} from '@/server/db/fireStore';
import {
    Alert,
    alpha,
    Box,
    Chip,
    CircularProgress,
    Container,
    Divider,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Paper,
    Stack,
    Typography,
    useTheme
} from '@mui/material';
import {
    ArrowRight as StepIcon,
    CheckCircleOutline as BenefitIcon,
    Info as TipIcon,
    Lightbulb as LifestyleIcon,
    LocalHospital as HealthIcon,
    People as CommunityIcon,
    Psychology as MentalHealthIcon,
    Warning as EmergencyIcon
} from '@mui/icons-material';
import {usePathname, useRouter} from 'next/navigation';
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import {tabProps} from "@/utils/data";

const categoryIcons = {
    "Health Tips": <HealthIcon/>,
    "Emergency Guides": <EmergencyIcon/>,
    "Lifestyle Recommendations": <LifestyleIcon/>,
    "Mental Health and Well-being": <MentalHealthIcon/>,
    "Community-Focused Guides": <CommunityIcon/>
};

const categoryColors = {
    "Health Tips": '#4caf50',
    "Emergency Guides": '#f44336',
    "Lifestyle Recommendations": '#2196f3',
    "Mental Health and Well-being": '#9c27b0',
    "Community-Focused Guides": '#ff9800'
};

function FullTipsAndGuides({id}) {
    const [guide, setGuide] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const theme = useTheme();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const fetchGuide = async () => {
            try {
                const docRef = doc(db, 'tipsAndGuides', id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setGuide({id: docSnap.id, ...docSnap.data()});
                } else {
                    setError('Guide not found');
                }
            } catch (err) {
                console.error('Error fetching guide:', err);
                setError('Failed to load guide');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchGuide();
        }
    }, [id]);

    if (loading) {
        return (
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '60vh'
            }}>
                <CircularProgress/>
            </Box>
        );
    }

    if (error) {
        return (
            <Container maxWidth="md" sx={{mt: 4}}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    if (!guide) {
        return null;
    }

    const handleTabChange = (event, newValue) => {
        router.push(newValue); // Navigate to the selected tab's route
    };

    const categoryColor = categoryColors[guide.category] || theme.palette.primary.main;

    return (
        <>
            <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                {/* Navigation Tabs */}
                <Tabs
                    value={pathname} // Use the current route to determine the active tab
                    onChange={handleTabChange}
                    sx={{
                        marginBottom: '20px',
                        '& .MuiTabs-indicator': {
                            backgroundColor: '#46F0F9',
                        },
                    }}
                    centered
                >
                    <Tab
                        label="Tips And Guides"
                        value="/health-worker/info-hub/tips-guides" // The route for the main news list
                        sx={tabProps}
                    />
                    <Tab
                        label="Full Content"
                        value={`/health-worker/info-hub/tips-guides/${id}`} // The route for the full article
                        sx={tabProps}
                    />
                </Tabs>
            </Stack>
            <Container maxWidth="md" sx={{py: 4}}>
                <Paper
                    elevation={3}
                    sx={{
                        p: 4,
                        background: theme.palette.mode === 'dark'
                            ? alpha(theme.palette.background.paper, 0.8)
                            : theme.palette.background.paper,
                    }}
                >
                    {/* Header Section */}
                    <Box sx={{mb: 4}}>
                        <Stack direction="row" spacing={2} alignItems="center" sx={{mb: 2}}>
                            <Box sx={{
                                color: categoryColor,
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                {categoryIcons[guide.category]}
                            </Box>
                            <Typography variant="h4" component="h1" gutterBottom>
                                {guide.title}
                            </Typography>
                        </Stack>

                        <Chip
                            label={guide.category}
                            sx={{
                                bgcolor: alpha(categoryColor, 0.1),
                                color: categoryColor,
                                '& .MuiChip-icon': {color: categoryColor}
                            }}
                            icon={categoryIcons[guide.category]}
                        />
                    </Box>

                    <Divider sx={{my: 3}}/>

                    {/* Introduction Section */}
                    <Box sx={{mb: 4}}>
                        <Typography variant="body1" paragraph>
                            {guide.content.introduction}
                        </Typography>
                    </Box>

                    {/* Benefits Section */}
                    {guide.content.benefits && (
                        <Box sx={{mb: 4}}>
                            <Typography variant="h6" gutterBottom sx={{color: categoryColor}}>
                                Key Benefits
                            </Typography>
                            <List>
                                {guide.content.benefits.map((benefit, index) => (
                                    <ListItem key={index}>
                                        <ListItemIcon>
                                            <BenefitIcon sx={{color: categoryColor}}/>
                                        </ListItemIcon>
                                        <ListItemText primary={benefit}/>
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    )}

                    {/* Steps Section */}
                    {guide.content.steps && (
                        <Box sx={{mb: 4}}>
                            <Typography variant="h6" gutterBottom sx={{color: categoryColor}}>
                                Step-by-Step Guide
                            </Typography>
                            <List>
                                {guide.content.steps.map((step, index) => (
                                    <ListItem key={index}>
                                        <ListItemIcon>
                                            <StepIcon sx={{color: categoryColor}}/>
                                        </ListItemIcon>
                                        <ListItemText primary={step}/>
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    )}

                    {/* Additional Tips Section */}
                    {guide.content.tips && (
                        <Box sx={{mb: 4}}>
                            <Typography variant="h6" gutterBottom sx={{color: categoryColor}}>
                                Additional Tips
                            </Typography>
                            <List>
                                {guide.content.tips.map((tip, index) => (
                                    <ListItem key={index}>
                                        <ListItemIcon>
                                            <TipIcon sx={{color: categoryColor}}/>
                                        </ListItemIcon>
                                        <ListItemText primary={tip}/>
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    )}

                    {/* Resources Section */}
                    {guide.content.resources && (
                        <Box sx={{mt: 4}}>
                            <Alert severity="info" sx={{bgcolor: alpha(categoryColor, 0.1)}}>
                                <Typography variant="subtitle1" gutterBottom sx={{fontWeight: 'bold'}}>
                                    Additional Resources
                                </Typography>
                                <Typography variant="body2">
                                    {guide.content.resources}
                                </Typography>
                            </Alert>
                        </Box>
                    )}
                </Paper>
            </Container>
        </>
    );
}

export default FullTipsAndGuides;
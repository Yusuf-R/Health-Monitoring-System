'use client';
import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/server/db/fireStore';
import {
    Box,
    Card,
    CardContent,
    Typography,
    CircularProgress,
    Grid,
    Button,
    Tabs,
    Tab,
    Paper,
    Stack,
    Chip,
    IconButton,
    Divider
} from '@mui/material';
import { useRouter } from 'next/navigation';
import {
    LocalHospital as HealthIcon,
    Warning as EmergencyIcon,
    Lightbulb as LifestyleIcon,
    Psychology as MentalHealthIcon,
    People as CommunityIcon,
    ArrowForward as ArrowIcon
} from '@mui/icons-material';
import AddIcon from "@mui/icons-material/Add";
import ActionMenu from '@/components/HealthWorkerComponents/AcionMenu/ActionMenu';

const categoryIcons = {
    "Health Tips": <HealthIcon sx={{ color: '#4caf50' }} />,
    "Emergency Guides": <EmergencyIcon sx={{ color: '#f44336' }} />,
    "Lifestyle Recommendations": <LifestyleIcon sx={{ color: '#2196f3' }} />,
    "Mental Health and Well-being": <MentalHealthIcon sx={{ color: '#9c27b0' }} />,
    "Community-Focused Guides": <CommunityIcon sx={{ color: '#ff9800' }} />,
    "New": <AddIcon sx={{color: '#CC6600'}} />
};

const categoryColors = {
    "Health Tips": '#4caf50',
    "Emergency Guides": '#f44336',
    "Lifestyle Recommendations": '#2196f3',
    "Mental Health and Well-being": '#9c27b0',
    "Community-Focused Guides": '#ff9800',
    "New": '#CC6600',
};

export default function TipsAndGuides({ healthWorkerProfile }) {
    const [tips, setTips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const router = useRouter();

    const fetchTipsAndGuides = async () => {
        setLoading(true);
        setError(false);
        try {
            const tipsRef = collection(db, 'tipsAndGuides');
            // Try to get all tips, sorted by either timestamp
            const q = query(tipsRef, orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                console.log('No tips and guides found');
                setTips([]);
                return;
            }

            const fetchedTips = snapshot.docs.map((doc) => {
                const data = doc.data();
                // Handle both old and new data structures
                const processedData = {
                    id: doc.id,
                    title: data.title,
                    category: data.category,
                    // For snippet, try the new structure first, then fall back to old
                    snippet: data.snippet || data.description || (data.content && data.content.introduction) || '',
                    // Preserve all other data
                    ...data,
                    // Ensure content is available for both old and new structures
                    content: data.content || {
                        introduction: data.description || data.snippet || ''
                    }
                };
                console.log('Processed tip data:', processedData);
                return processedData;
            });

            console.log('All fetched tips:', fetchedTips);
            setTips(fetchedTips);
        } catch (err) {
            console.error('Error fetching tips and guides:', err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTipsAndGuides();
    }, []);

    const filteredTips = selectedCategory === "All"
        ? tips
        : tips.filter((tip) => tip.category === selectedCategory);

    if (loading) {
        return (
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                backgroundColor: 'rgba(0, 0, 0, 0.2)'
            }}>
                <CircularProgress sx={{ color: '#fff' }} />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                gap: 2,
                backgroundColor: 'rgba(0, 0, 0, 0.2)'
            }}>
                <Typography variant="h6" sx={{ color: '#fff' }}>
                    Error loading tips and guides
                </Typography>
                <Button
                    variant="contained"
                    onClick={fetchTipsAndGuides}
                    sx={{
                        backgroundColor: '#1a237e',
                        '&:hover': {
                            backgroundColor: '#283593'
                        }
                    }}
                >
                    Retry
                </Button>
            </Box>
        );
    }

    const handleTabChange = (event, newValue) => {
        if (newValue === 'New') {
            router.push('/health-worker/info-hub/tips-guides/create'); // Navigate to the desired route
        } else {
            setSelectedCategory(newValue); // Update the selected type
        }
    };

    return (
        <Box sx={{
            p: 3,
            backgroundColor: 'rgba(0, 0, 0, 0.2)'
        }}>
            <Paper
                elevation={0}
                sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: 2,
                    mb: 3
                }}
            >
                <Tabs
                    value={selectedCategory}
                    onChange={handleTabChange}
                    // onChange={(e, newValue) => setSelectedCategory(newValue)}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                        '& .MuiTabs-indicator': {
                            backgroundColor: selectedCategory === "All"
                                ? '#46F0F9'
                                : categoryColors[selectedCategory] || '#1a237e'
                        },
                        '& .MuiTab-root': {
                            color: '#fff',
                            opacity: 0.7,
                            '&.Mui-selected': {
                                color: '#fff',
                                opacity: 1
                            }
                        }
                    }}
                >
                    <Tab
                        label="All Guides"
                        value="All"
                        sx={{
                            fontSize: '0.9rem',
                            fontWeight: 500
                        }}
                    />
                    {Object.keys(categoryIcons).map((category) => (
                        <Tab
                            key={category}
                            label={category}
                            value={category}
                            icon={categoryIcons[category]}
                            iconPosition="start"
                            sx={{
                                fontSize: '0.9rem',
                                fontWeight: 500
                            }}
                        />
                    ))}
                </Tabs>
            </Paper>

            <Grid container spacing={3}>
                {filteredTips.length > 0 ? (
                    filteredTips.map((tip) => (
                        <Grid item xs={12} sm={6} md={4} key={tip.id}>
                            <Card
                                sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                    backdropFilter: 'blur(10px)',
                                    border: `1px solid ${categoryColors[tip.category] || '#1a237e'}20`,
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: `0 4px 20px ${categoryColors[tip.category] || '#1a237e'}20`
                                    }
                                }}
                            >
                                <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
                                    <Stack
                                        direction="row"
                                        spacing={1}
                                        alignItems="center"
                                        justifyContent="space-between"
                                        sx={{ mb: 2 }}
                                    >
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            {categoryIcons[tip.category]}
                                            <Chip
                                                label={tip.category}
                                                size="small"
                                                sx={{
                                                    backgroundColor: `${categoryColors[tip.category]}20`,
                                                    color: categoryColors[tip.category],
                                                    fontWeight: 500
                                                }}
                                            />
                                        </Stack>
                                        <ActionMenu
                                            item={tip}
                                            type="tips"
                                            healthWorkerProfile={healthWorkerProfile}
                                            onDelete={fetchTipsAndGuides}
                                        />
                                    </Stack>

                                    <Typography
                                        variant="h6"
                                        sx={{
                                            color: '#fff',
                                            mb: 2,
                                            fontWeight: 600
                                        }}
                                    >
                                        {tip.title || 'Untitled Tip'}
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: 'rgba(255, 255, 255, 0.9)',
                                            mb: 2,
                                            flex: 1
                                        }}
                                    >
                                        {tip.snippet || tip.description || (tip.content && tip.content.introduction) || 'No description available'}
                                    </Typography>

                                    <Button
                                        variant="text"
                                        endIcon={<ArrowIcon />}
                                        onClick={() => router.push(`/health-worker/info-hub/tips-guides/${tip.id}`)}
                                        sx={{
                                            color: categoryColors[tip.category] || '#1a237e',
                                            alignSelf: 'flex-start',
                                            '&:hover': {
                                                backgroundColor: `${categoryColors[tip.category]}10`
                                            }
                                        }}
                                    >
                                        Read More
                                    </Button>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))
                ) : (
                    <Grid item xs={12}>
                        <Paper
                            sx={{
                                p: 4,
                                textAlign: 'center',
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                borderRadius: 2
                            }}
                        >
                            <Typography variant="h6" sx={{ color: '#fff' }}>
                                No tips found for this category
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: 'rgba(255, 255, 255, 0.7)',
                                    mt: 1
                                }}
                            >
                                Try selecting a different category
                            </Typography>
                        </Paper>
                    </Grid>
                )}
            </Grid>
        </Box>
    );
}

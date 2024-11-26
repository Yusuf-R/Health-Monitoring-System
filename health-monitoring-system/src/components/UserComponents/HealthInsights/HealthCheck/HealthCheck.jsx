'use client';
import React, { useEffect, useState } from 'react';
import {
    Box,
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    Chip,
    TextField,
    InputAdornment,
    Paper,
    Stack,
    CircularProgress,
    useTheme,
    alpha,
    IconButton,
    Tabs,
    Tab,
    Fade,
    Button
} from '@mui/material';
import {
    Search as SearchIcon,
    LocalHospital as HospitalIcon,
    Coronavirus as VirusIcon,
    PregnantWoman as WomanIcon,
    ElderlyWoman as ElderlyIcon,
    Category as CategoryIcon,
    ArrowForward as ArrowIcon,
    Warning as WarningIcon
} from '@mui/icons-material';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/server/db/fireStore';
import { useRouter } from 'next/navigation';

const categoryIcons = {
    "Infectious Diseases": <VirusIcon />,
    "Women's Health": <WomanIcon />,
    "Elderly Care": <ElderlyIcon />,
    "All": <CategoryIcon />,
    "Other": <HospitalIcon /> // Default category
};

const categoryColors = {
    "Infectious Diseases": '#ff6b6b',
    "Women's Health": '#da77f2',
    "Elderly Care": '#ff9900',
    "All": '#0099ff',
    "Other": '#9e9e9e' // Default color
};

const getValidCategory = (category) => {
    return categoryColors.hasOwnProperty(category) ? category : "Other";
};

export default function HealthCheck() {
    const [conditions, setConditions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [filteredConditions, setFilteredConditions] = useState([]);
    const router = useRouter();
    const theme = useTheme();

    useEffect(() => {
        fetchHealthConditions();
    }, []);

    useEffect(() => {
        filterConditions();
    }, [conditions, searchQuery, selectedCategory]);

    const fetchHealthConditions = async () => {
        try {
            const healthCollection = collection(db, 'healthConditions');
            const q = query(healthCollection, orderBy('timestamp', 'desc'));
            const snapshot = await getDocs(q);
            const fetchedConditions = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setConditions(fetchedConditions);
        } catch (error) {
            console.error('Error fetching health conditions:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const filterConditions = () => {
        let filtered = conditions;

        // Category filter
        if (selectedCategory !== 'All') {
            filtered = filtered.filter(condition => condition.category === selectedCategory);
        }

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(condition =>
                condition.title.toLowerCase().includes(query) ||
                condition.snippet.toLowerCase().includes(query) ||
                condition.category.toLowerCase().includes(query)
            );
        }

        setFilteredConditions(filtered);
    };

    if (loading) {
        return (
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '60vh'
            }}>
                <CircularProgress sx={{ color: '#46F0F9' }} />
            </Box>
        );
    }

    if (error) {
        return (
            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Paper
                    elevation={3}
                    sx={{
                        p: 4,
                        textAlign: 'center',
                        bgcolor: theme.palette.mode === 'dark' ? alpha('#000', 0.6) : alpha('#fff', 0.8),
                    }}
                >
                    <Stack spacing={2} alignItems="center">
                        <WarningIcon sx={{ fontSize: 60, color: '#ff6b6b' }} />
                        <Typography variant="h5" color="error">
                            Error loading health conditions
                        </Typography>
                        <Typography color="text.secondary">
                            {error}
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={fetchHealthConditions}
                            sx={{
                                bgcolor: '#46F0F9',
                                '&:hover': { bgcolor: alpha('#46F0F9', 0.8) }
                            }}
                        >
                            Retry
                        </Button>
                    </Stack>
                </Paper>
            </Container>
        );
    }

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
                    color: '#fff'
                }}
            >
                <Grid container spacing={4} alignItems="center">
                    <Grid item xs={12} md={8}>
                        <Typography variant="h4" sx={{
                            fontWeight: 700,
                            mb: 2,
                            background: 'linear-gradient(45deg, #46F0F9 30%, #E0F7FA 90%)',
                            backgroundClip: 'text',
                            textFillColor: 'transparent',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}>
                            Health Information Center
                        </Typography>
                        <Typography variant="h6" sx={{ color: alpha('#fff', 0.9) }}>
                            Explore comprehensive information about various health conditions, symptoms, and treatments.
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Search conditions..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ color: '#46F0F9' }} />
                                    </InputAdornment>
                                ),
                                sx: {
                                    bgcolor: theme.palette.mode === 'dark' ? alpha('#000', 0.6) : alpha('#fff', 0.9),
                                    borderRadius: '12px',
                                    '& fieldset': { border: 'none' },
                                }
                            }}
                        />
                    </Grid>
                </Grid>
            </Paper>

            {/* Category Tabs */}
            <Paper
                elevation={3}
                sx={{
                    mb: 4,
                    borderRadius: '16px',
                    bgcolor: theme.palette.mode === 'dark' ? alpha('#000', 0.6) : alpha('#fff', 0.8),
                    overflow: 'hidden'
                }}
            >
                <Tabs
                    value={selectedCategory}
                    onChange={(e, newValue) => setSelectedCategory(newValue)}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                        '& .MuiTabs-indicator': {
                            backgroundColor: categoryColors[selectedCategory]
                        }
                    }}
                >
                    {Object.keys(categoryIcons).map((category) => (
                        <Tab
                            key={category}
                            value={category}
                            label={
                                <Stack direction="row" spacing={1} alignItems="center">
                                    {React.cloneElement(categoryIcons[category], {
                                        sx: { color: selectedCategory === category ? categoryColors[category] : 'inherit' }
                                    })}
                                    <span>{category}</span>
                                </Stack>
                            }
                            sx={{
                                minHeight: 60,
                                textTransform: 'none',
                                fontSize: '1rem',
                                fontWeight: 500,
                                color: theme.palette.mode === 'dark' ? '#fff' : '#000',
                                '&.Mui-selected': {
                                    color: categoryColors[category]
                                }
                            }}
                        />
                    ))}
                </Tabs>
            </Paper>

            {/* Conditions Grid */}
            <Grid container spacing={3}>
                {filteredConditions.map((condition, index) => (
                    <Grid item xs={12} sm={6} md={4} key={condition.id}>
                        <Fade in={true} timeout={500 + (index * 100)}>
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
                                    <Stack spacing={2}>
                                        {/* Category Chip */}
                                        <Chip
                                            icon={categoryIcons[getValidCategory(condition.category)]}
                                            label={condition.category}
                                            sx={{
                                                bgcolor: alpha(categoryColors[getValidCategory(condition.category)], 0.1),
                                                color: categoryColors[getValidCategory(condition.category)],
                                                borderRadius: '8px',
                                                alignSelf: 'flex-start'
                                            }}
                                        />

                                        {/* Title */}
                                        <Typography variant="h5" sx={{
                                            fontWeight: 600,
                                            color: theme.palette.mode === 'dark' ? '#fff' : '#000'
                                        }}>
                                            {condition.title}
                                        </Typography>

                                        {/* Snippet */}
                                        <Typography sx={{
                                            color: theme.palette.mode === 'dark' ? alpha('#fff', 0.7) : alpha('#000', 0.7),
                                            mb: 2
                                        }}>
                                            {condition.snippet}
                                        </Typography>

                                        {/* Read More Button */}
                                        <Button
                                            variant="text"
                                            endIcon={<ArrowIcon />}
                                            onClick={() => router.push(`/user/personalized/health-check/${condition.id}`)}
                                            sx={{
                                                color: categoryColors[getValidCategory(condition.category)],
                                                mt: 'auto',
                                                '&:hover': {
                                                    bgcolor: alpha(categoryColors[getValidCategory(condition.category)], 0.1)
                                                }
                                            }}
                                        >
                                            Learn More
                                        </Button>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Fade>
                    </Grid>
                ))}

                {filteredConditions.length === 0 && (
                    <Grid item xs={12}>
                        <Paper
                            elevation={3}
                            sx={{
                                p: 4,
                                textAlign: 'center',
                                bgcolor: theme.palette.mode === 'dark' ? alpha('#000', 0.6) : alpha('#fff', 0.8)
                            }}
                        >
                            <Typography variant="h6" sx={{ color: theme.palette.text.primary }}>
                                No health conditions found matching your criteria.
                            </Typography>
                        </Paper>
                    </Grid>
                )}
            </Grid>
        </Container>
    );
}

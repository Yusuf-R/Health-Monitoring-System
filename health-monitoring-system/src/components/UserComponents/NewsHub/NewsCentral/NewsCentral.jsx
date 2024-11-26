'use client';
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Box,
    Card,
    CardContent,
    Grid,
    Tab,
    Tabs,
    Typography,
    Button,
    CircularProgress,
    Container,
    Paper,
    Stack,
    useTheme,
    alpha,
    Chip,
} from "@mui/material";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "@/server/db/fireStore";
import {
    LocationCity as LocalIcon,
    Landscape as StateIcon,
    Public as NationalIcon,
    Article as NewsIcon,
    Schedule as TimeIcon,
    ArrowForward as ReadMoreIcon
} from '@mui/icons-material';

const categoryIcons = {
    "lga": <LocalIcon />,
    "state": <StateIcon />,
    "national": <NationalIcon />
};

const categoryColors = {
    "lga": '#4caf50',
    "state": '#2196f3',
    "national": '#9c27b0'
};

const NewsMarquee = ({ userName, highlights, speed = 20 }) => {
    const [currentDate, setCurrentDate] = useState('');
    const theme = useTheme();

    useEffect(() => {
        const today = new Date();
        const formattedDate = today.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
        setCurrentDate(formattedDate);
    }, []);

    return (
        <Paper
            elevation={3}
            sx={{
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                bgcolor: theme.palette.mode === 'dark' ? alpha('#004e92', 0.9) : alpha('#004e92', 0.8),
                color: '#FFF',
                p: 2,
                borderRadius: '16px',
                mb: 4,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            }}
        >
            <Typography
                component="div"
                sx={{
                    display: 'inline-block',
                    animation: `marquee ${speed}s linear infinite`,
                    fontSize: '1rem',
                    fontWeight: 500,
                    '@keyframes marquee': {
                        from: { transform: 'translateX(100%)' },
                        to: { transform: 'translateX(-100%)' },
                    },
                    '& span': {
                        color: '#46F0F9'
                    }
                }}
            >
                {`👋 Good day, `}
                <span>{userName}</span>
                {` | 📅 Today: ${currentDate} | 📰 Latest Headlines: ${highlights.join(' • ')}`}
            </Typography>
        </Paper>
    );
};

export default function NewsCentral({ userProfile }) {
    const [tabValue, setTabValue] = useState("state");
    const [news, setNews] = useState([]);
    const [highlights, setHighlights] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const router = useRouter();
    const theme = useTheme();

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const fetchNews = async () => {
        setLoading(true);
        setError(false);
        try {
            const newsRef = collection(db, "news");
            const q = query(
                newsRef,
                where(
                    tabValue === "lga" ? "scope.lga" :
                        tabValue === "state" ? "scope.state" :
                            "scope.country",
                    "==",
                    tabValue === "lga" ? userProfile.currlga :
                        tabValue === "state" ? userProfile.stateOfResidence :
                            "Nigeria"
                ),
                orderBy("timestamp", "desc")
            );

            const snapshot = await getDocs(q);
            const fetchedNews = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setNews(fetchedNews);

            const highlights = fetchedNews.slice(0, 5).map((article) => article.title);
            setHighlights(highlights);
        } catch (error) {
            console.error("Error fetching news:", error);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNews();
    }, [tabValue, userProfile]);

    if (loading) {
        return (
            <Box sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "60vh"
            }}>
                <CircularProgress sx={{ color: '#46F0F9' }} />
            </Box>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* Marquee Section */}
            <NewsMarquee userName={userProfile.firstName} highlights={highlights} />

            {/* Tabs Section */}
            <Paper
                elevation={3}
                sx={{
                    mb: 4,
                    bgcolor: 'inherit',
                    borderRadius: '16px'
                }}
            >
                <Tabs
                    value={tabValue}
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
                            color: '#fff',
                            '&.Mui-selected': {
                                color: '#46F0F9'
                            }
                        }
                    }}
                >
                    {Object.keys(categoryIcons).map((type) => (
                        <Tab
                            key={type}
                            label={
                                <Stack direction="row" spacing={1} alignItems="center">
                                    {React.cloneElement(categoryIcons[type], {
                                        sx: { color: tabValue === type ? '#46F0F9' : 'inherit' }
                                    })}
                                    <span style={{ textTransform: 'capitalize' }}>
                                        {type === 'lga' ? 'Local News' :
                                            type === 'state' ? 'State News' :
                                                'National News'}
                                    </span>
                                </Stack>
                            }
                            value={type}
                        />
                    ))}
                </Tabs>
            </Paper>

            {/* Error Display */}
            {error && (
                <Paper
                    elevation={3}
                    sx={{
                        p: 4,
                        textAlign: "center",
                        bgcolor: theme.palette.mode === 'dark' ? alpha('#000', 0.6) : alpha('#fff', 0.8),
                        mb: 4
                    }}
                >
                    <Typography variant="h6" color="error" gutterBottom>
                        Unable to fetch news. Please check your connection and try again.
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={fetchNews}
                        disabled={loading}
                        sx={{
                            mt: 2,
                            bgcolor: '#46F0F9',
                            '&:hover': { bgcolor: alpha('#46F0F9', 0.8) }
                        }}
                        startIcon={loading ? <CircularProgress size={20} /> : null}
                    >
                        {loading ? "Retrying..." : "Retry"}
                    </Button>
                </Paper>
            )}

            {/* News Grid */}
            <Grid container spacing={3}>
                {news.length > 0 ? (
                    news.map((article) => (
                        <Grid item xs={12} sm={6} md={4} key={article.id}>
                            <Card
                                elevation={3}
                                sx={{
                                    height: '100%',
                                    bgcolor: theme.palette.mode === 'dark' ? alpha('#004e92', 0.9) : alpha('#004e92', 0.8),
                                    transition: 'transform 0.2s',
                                    '&:hover': {
                                        transform: 'translateY(-4px)'
                                    }
                                }}
                            >
                                <CardContent>
                                    <Stack spacing={2}>
                                        {/* Header */}
                                        <Stack direction="row" spacing={2} alignItems="flex-start">
                                            <NewsIcon sx={{ color: categoryColors[tabValue] }} />
                                            <Typography variant="h6" sx={{
                                                color: '#fff',
                                                fontWeight: 600,
                                                flexGrow: 1,
                                                lineHeight: 1.4
                                            }}>
                                                {article.title}
                                            </Typography>
                                        </Stack>

                                        {/* Date */}
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <TimeIcon sx={{ color: '#46F0F9', fontSize: '0.9rem' }} />
                                            <Typography variant="body2" sx={{ color: '#46F0F9' }}>
                                                {new Date(article.timestamp).toLocaleDateString('en-US', {
                                                    weekday: 'short',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                })}
                                            </Typography>
                                        </Stack>

                                        {/* Snippet */}
                                        <Typography variant="body1" sx={{
                                            color: '#fff',
                                            opacity: 0.9,
                                            mb: 2
                                        }}>
                                            {article.snippet}
                                        </Typography>

                                        {/* Read More Button */}
                                        <Button
                                            variant="text"
                                            endIcon={<ReadMoreIcon />}
                                            onClick={() => router.push(`/user/info-hub/news/${article.id}`)}
                                            sx={{
                                                color: '#46F0F9',
                                                fontWeight: 'bold',
                                                mt: 'auto',
                                                '&:hover': {
                                                    bgcolor: alpha('#46F0F9', 0.1)
                                                }
                                            }}
                                        >
                                            Read Full Article
                                        </Button>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))
                ) : (
                    <Grid item xs={12}>
                        <Paper
                            elevation={3}
                            sx={{
                                p: 4,
                                textAlign: "center",
                                bgcolor: theme.palette.mode === 'dark' ? alpha('#000', 0.6) : alpha('#fff', 0.8)
                            }}
                        >
                            <Typography variant="h6" sx={{ color: theme.palette.text.primary }}>
                                No news articles found for the selected region.
                            </Typography>
                        </Paper>
                    </Grid>
                )}
            </Grid>
        </Container>
    );
}
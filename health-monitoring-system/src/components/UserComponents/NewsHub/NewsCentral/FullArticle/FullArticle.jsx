import React, {useEffect, useState} from "react";
import { db } from "@/server/db/fireStore";
import {doc, getDoc} from "firebase/firestore";
import {Box, Button, CircularProgress, Typography, Paper, Stack, Chip, Divider} from "@mui/material";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import {usePathname, useRouter} from "next/navigation";
import {
    Article as ArticleIcon,
    AccessTime as AccessTimeIcon,
    LocationOn as LocationOnIcon,
    Share as ShareIcon,
    Bookmark as BookmarkIcon,
    Public as PublicIcon
} from '@mui/icons-material';
import {tabProps} from "@/utils/data"


export default function FullArticle({id}) {
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                const docRef = doc(db, "news", id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setArticle({id: docSnap.id, ...docSnap.data()});
                } else {
                    setError(true);
                }
            } catch (e) {
                console.error("Error fetching article:", e);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchArticle();
        }
    }, [id]);

    if (loading) {
        return (
            <Box sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "60vh"
            }}>
                <CircularProgress/>
            </Box>
        );
    }

    if (error || !article) {
        return (
            <Box sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                minHeight: "60vh",
                justifyContent: "center"
            }}>
                <Typography variant="h5" color="error">
                    Failed to load article
                </Typography>
                <Button variant="contained" onClick={() => router.back()}>
                    Go Back
                </Button>
            </Box>
        );
    }

    const handleTabChange = (event, newValue) => {
        router.push(newValue); // Navigate to the selected tab's route
    };

    return (
        <Box sx={{
            maxWidth: "100%",
            mx: "auto",
            p: 3,
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            borderRadius: 2,
            minHeight: "100vh"
        }}>
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
                        label="DashboardNews"
                        value="/user/info-hub/news" // The route for the main news list
                        sx={tabProps}
                    />
                    <Tab
                        label="Full Article"
                        value={`/user/info-hub/news/${id}`} // The route for the full article
                        sx={tabProps}
                    />
                </Tabs>
            </Stack>

            {/* Article Header */}
            <Paper
                elevation={0}
                sx={{
                    p: 4,
                    mb: 3,
                    backgroundColor: 'rgba(26, 35, 126, 0.1)',
                    borderRadius: 2,
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                <Box
                    sx={{
                        position: 'absolute',
                        top: -15,
                        left: -15,
                        backgroundColor: 'limegreen',
                        width: 80,
                        height: 80,
                        transform: 'rotate(45deg)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                >
                    <ArticleIcon
                        sx={{
                            color: '#fff',
                            transform: 'rotate(-45deg)',
                            fontSize: 24
                        }}
                    />
                </Box>

                <Typography
                    variant="h3"
                    sx={{
                        fontWeight: "bold",
                        mb: 3,
                        color: '#fff',
                        pl: 4
                    }}
                >
                    {article.title}
                </Typography>

                <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    sx={{ mb: 2, pl: 4 }}
                >
                    <AccessTimeIcon sx={{ color: 'gold' }} />
                    <Typography
                        variant="body1"
                        sx={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontStyle: 'italic'
                        }}
                    >
                        {new Date(article.timestamp).toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                        })}
                    </Typography>
                </Stack>

                {article.scope && (
                    <Stack
                        direction="row"
                        spacing={1}
                        sx={{ pl: 4 }}
                    >
                        {article.scope.country && (
                            <Chip
                                icon={<PublicIcon sx={{ color: '#fff !important' }} />}
                                label={article.scope.country}
                                sx={{
                                    backgroundColor: 'rgba(26, 35, 126, 0.3)',
                                    color: '#fff',
                                    '&:hover': {
                                        backgroundColor: 'rgba(26, 35, 126, 0.4)'
                                    }
                                }}
                            />
                        )}
                        {article.scope.state && (
                            <Chip
                                icon={<LocationOnIcon sx={{ color: '#fff !important' }} />}
                                label={article.scope.state}
                                sx={{
                                    backgroundColor: 'rgba(26, 35, 126, 0.3)',
                                    color: '#fff',
                                    '&:hover': {
                                        backgroundColor: 'rgba(26, 35, 126, 0.4)'
                                    }
                                }}
                            />
                        )}
                        {article.scope.lga && (
                            <Chip
                                label={article.scope.lga}
                                sx={{
                                    backgroundColor: 'rgba(26, 35, 126, 0.3)',
                                    color: '#fff',
                                    '&:hover': {
                                        backgroundColor: 'rgba(26, 35, 126, 0.4)'
                                    }
                                }}
                            />
                        )}
                    </Stack>
                )}
            </Paper>

            {/* Article Content */}
            <Paper
                elevation={0}
                sx={{
                    p: 4,
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: 2,
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
            >
                {article.snippet && (
                    <>
                        <Typography
                            variant="h6"
                            sx={{
                                color: 'rgba(255, 255, 255, 0.9)',
                                mb: 3,
                                fontStyle: 'italic',
                                lineHeight: 1.6,
                                borderLeft: '4px solid #1a237e',
                                pl: 2,
                                py: 1,
                                backgroundColor: 'rgba(26, 35, 126, 0.1)',
                                borderRadius: '0 4px 4px 0'
                            }}
                        >
                            {article.snippet}
                        </Typography>
                        <Divider sx={{ my: 3, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                    </>
                )}

                <Typography
                    variant="body1"
                    sx={{
                        lineHeight: 1.8,
                        color: '#fff',
                        letterSpacing: 0.3,
                        '& p': {
                            mb: 2
                        }
                    }}
                >
                    {article.content}
                </Typography>
            </Paper>
        </Box>
    );
}

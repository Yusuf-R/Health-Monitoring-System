'use client';
import React, {useEffect, useState} from "react";
import {
    alpha,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Container,
    Grid,
    Paper,
    Stack,
    Tab,
    Tabs,
    Typography,
    useTheme
} from "@mui/material";
import {collection, doc, getDoc, getDocs, query, updateDoc, where} from "firebase/firestore";
import {db} from "@/server/db/fireStore";
import {
    Article as AllIcon,
    Event as EventIcon,
    HowToVote as VoteIcon,
    LocalHospital as AdviceIcon,
    Poll as PollIcon,
    Warning as AlertIcon
} from "@mui/icons-material";
import {useRouter} from "next/navigation";
import AddIcon from "@mui/icons-material/Add";

// Define category styles
const categoryIcons = {
    "all": <AllIcon sx={{color: '#2196f3'}}/>,
    "advice": <AdviceIcon sx={{color: '#4caf50'}}/>,
    "alerts": <AlertIcon sx={{color: '#f44336'}}/>,
    "events": <EventIcon sx={{color: '#ff9800'}}/>,
    "polls": <PollIcon sx={{color: '#9c27b0'}}/>,
    "new-feed": <AddIcon sx={{color: '#46F0F9'}}/>
};

const categoryColors = {
    "all": '#2196f3',
    "advice": '#4caf50',
    "alerts": '#f44336',
    "events": '#ff9800',
    "polls": '#9c27b0',
    "new-feed": '#46F0F9'
};

export default function Feeds({healthWorkerProfile}) {
    const [feeds, setFeeds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedType, setSelectedType] = useState("all");
    const [error, setError] = useState(false);
    const [votedPolls, setVotedPolls] = useState({});
    const router = useRouter();
    const theme = useTheme();
    const handleTabChange = (event, newValue) => {
        if (newValue === 'new-feed') {
            router.push('/health-worker/info-hub/feeds/create'); // Navigate to the desired route
        } else {
            setSelectedType(newValue); // Update the selected type
        }
    };

    // Fetch feeds from Firestore
    const fetchFeeds = async () => {
        setLoading(true);
        setError(false);
        try {
            const feedsRef = collection(db, "feeds");
            const q = query(feedsRef, where("scope", "==", {
                lga: healthWorkerProfile.currlga,
                state: healthWorkerProfile.stateOfResidence,
                country: "Nigeria"
            }));
            const snapshot = await getDocs(q);
            const fetchedFeeds = snapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));
            setFeeds(fetchedFeeds);
        } catch (err) {
            console.error("Error fetching feeds:", err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeeds();
    }, [healthWorkerProfile]);

    const handleVote = async (feedId, optionIndex) => {
        try {
            const feedDocRef = doc(db, "feeds", feedId);
            const feedDocSnap = await getDoc(feedDocRef);

            if (feedDocSnap.exists()) {
                const feedData = feedDocSnap.data();
                const votedOption = votedPolls[feedId];

                const options = feedData.poll.options.map((option, idx) => ({
                    ...option,
                    votes: idx === optionIndex
                        ? (votedOption === idx ? option.votes - 1 : option.votes + 1)
                        : option.votes
                }));

                await updateDoc(feedDocRef, {"poll.options": options});

                setVotedPolls(prev => ({
                    ...prev,
                    [feedId]: votedOption === optionIndex ? null : optionIndex
                }));

                setFeeds(prevFeeds => prevFeeds.map(feed =>
                    feed.id === feedId
                        ? {...feed, poll: {...feedData.poll, options}}
                        : feed
                ));
            }
        } catch (error) {
            console.error("Error voting on poll:", error);
        }
    };

    const filteredFeeds = selectedType === "all" ? feeds : feeds.filter(feed => feed.type === selectedType);

    if (loading) {
        return (
            <Box sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "60vh"
            }}>
                <CircularProgress sx={{color: '#46F0F9'}}/>
            </Box>
        );
    }

    if (error) {
        return (
            <Container maxWidth="md" sx={{mt: 4}}>
                <Paper
                    elevation={3}
                    sx={{
                        p: 4,
                        textAlign: "center",
                        bgcolor: theme.palette.mode === 'dark' ? alpha('#000', 0.6) : alpha('#fff', 0.8)
                    }}
                >
                    <Typography variant="h6" color="error" gutterBottom>
                        Error loading feeds. Please try again later.
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={fetchFeeds}
                        sx={{
                            mt: 2,
                            bgcolor: '#46F0F9',
                            '&:hover': {bgcolor: alpha('#46F0F9', 0.8)}
                        }}
                    >
                        Retry
                    </Button>
                </Paper>
            </Container>
        );
    }

    return (
        <>
            <Container maxWidth="xl" sx={{py: 2, m: 0}}>
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
                        value={selectedType}
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
                                    color: '#46F0F9'
                                }
                            }
                        }}
                    >
                        {Object.keys(categoryIcons).map((category) => (
                            <Tab
                                key={category}
                                label={category.toUpperCase()}
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
                </Stack>

                {/* Feeds Grid */}
                <Grid container spacing={3}>
                    {filteredFeeds.length > 0 ? (
                        filteredFeeds.map((feed) => (
                            <Grid item xs={12} sm={6} md={4} key={feed.id}>
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
                                        {/* Header */}
                                        <Stack direction="row" spacing={2} alignItems="center" sx={{mb: 2}}>
                                            <Box sx={{color: categoryColors[feed.type]}}>
                                                {categoryIcons[feed.type]}
                                            </Box>
                                            <Typography variant="h6" sx={{
                                                color: '#fff',
                                                fontWeight: 600,
                                                flexGrow: 1
                                            }}>
                                                {feed.title}
                                            </Typography>
                                        </Stack>

                                        {/* Content */}
                                        {feed.poll ? (
                                            <Box>
                                                <Typography
                                                    variant="body1"
                                                    sx={{
                                                        color: '#fff',
                                                        mb: 2,
                                                        fontWeight: 500
                                                    }}
                                                >
                                                    {feed.poll.question}
                                                </Typography>
                                                <Stack spacing={1}>
                                                    {feed.poll.options.map((option, index) => (
                                                        <Button
                                                            key={index}
                                                            variant={votedPolls[feed.id] === index ? "contained" : "outlined"}
                                                            startIcon={<VoteIcon/>}
                                                            onClick={() => handleVote(feed.id, index)}
                                                            sx={{
                                                                color: votedPolls[feed.id] === index ? '#000' : '#46F0F9',
                                                                borderColor: '#46F0F9',
                                                                bgcolor: votedPolls[feed.id] === index ? '#46F0F9' : 'transparent',
                                                                '&:hover': {
                                                                    bgcolor: votedPolls[feed.id] === index
                                                                        ? alpha('#46F0F9', 0.8)
                                                                        : alpha('#46F0F9', 0.1)
                                                                }
                                                            }}
                                                        >
                                                            {option.text} ({option.votes})
                                                        </Button>
                                                    ))}
                                                </Stack>
                                            </Box>
                                        ) : (
                                            <>
                                                <Typography
                                                    variant="body1"
                                                    sx={{
                                                        color: '#fff',
                                                        mb: 2,
                                                        opacity: 0.9
                                                    }}
                                                >
                                                    {feed.snippet}
                                                </Typography>
                                                <Button
                                                    variant="text"
                                                    onClick={() => router.push(`/health-worker/info-hub/feeds/${feed.id}`)}
                                                    sx={{
                                                        color: '#46F0F9',
                                                        fontWeight: 'bold',
                                                        '&:hover': {
                                                            bgcolor: alpha('#46F0F9', 0.1)
                                                        }
                                                    }}
                                                >
                                                    Read More
                                                </Button>
                                            </>
                                        )}
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
                                <Typography variant="h6" sx={{color: theme.palette.text.primary}}>
                                    No feeds found for the selected type.
                                </Typography>
                            </Paper>
                        </Grid>
                    )}
                </Grid>
            </Container>
        </>
    );
}

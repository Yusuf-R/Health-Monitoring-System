'use client';
import React, { useEffect, useState, useCallback } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/server/db/fireStore";
import {
    Box,
    Typography,
    CircularProgress,
    Button,
    Paper,
    Divider,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Card,
    CardContent,
    CardHeader,
    Chip,
    Grid,
    LinearProgress
} from "@mui/material";
import PollIcon from "@mui/icons-material/Poll";
import WarningIcon from "@mui/icons-material/Warning";
import EventIcon from "@mui/icons-material/Event";
import NoteIcon from "@mui/icons-material/Note";
import RssFeedIcon from '@mui/icons-material/RssFeed';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import Stack from "@mui/material/Stack";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import {usePathname, useRouter} from "next/navigation";
import ActionMenu from '@/components/HealthWorkerComponents/AcionMenu/ActionMenu';
import {formatDate} from "@/utils/dateFormatter";

const tabProps = {
    color: "#FFF",
    fontWeight: 'bold',
    fontSize: '0.9rem',
    "&.Mui-selected": {
        color: "#46F0F9",
    },
};

const categoryColors = {
    advice: 'gold',
    alerts: 'red',
    events: 'blue',
    polls: 'purple'
};

export default function FullFeed({ id, healthWorkerProfile }) {
    const [feed, setFeed] = useState(null);
    const [loading, setLoading] = useState(true);
    const [votedOption, setVotedOption] = useState(null);
    const router = useRouter();
    const pathname = usePathname();

    const handleTabChange = (event, newValue) => {
        router.push(newValue); // Navigate to the selected tab's route
    };

    const handleFeedDeleted = useCallback(() => {
        // Redirect to feeds list after deletion
        router.push('/health-worker/info-hub/feeds');
    }, [router]);

    useEffect(() => {
        const fetchFeed = async () => {
            try {
                const docRef = doc(db, "feeds", id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setFeed(docSnap.data());
                } else {
                    console.error("No such document!");
                }
            } catch (error) {
                console.error("Error fetching feed:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchFeed();
    }, [id]);

    const handleVote = async (optionIndex) => {
        if (!feed || !feed.poll) return;

        try {
            const docRef = doc(db, "feeds", id);
            const updatedOptions = feed.poll.options.map((option, idx) => {
                if (idx === optionIndex) {
                    return {
                        ...option,
                        votes: votedOption === idx ? option.votes - 1 : option.votes + 1,
                    };
                }
                return option;
            });

            // Save updated poll to Firestore
            await updateDoc(docRef, { "poll.options": updatedOptions });

            // Update local state
            setVotedOption((prev) => (prev === optionIndex ? null : optionIndex));
            setFeed((prevFeed) => ({
                ...prevFeed,
                poll: { ...prevFeed.poll, options: updatedOptions },
            }));
        } catch (error) {
            console.error("Error voting:", error);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!feed) {
        return (
            <Box sx={{ padding: "20px", textAlign: "center" }}>
                <Typography color="error">Feed not found.</Typography>
            </Box>
        );
    }

    const renderNestedContent = (content, level = 0) => {
        if (Array.isArray(content)) {
            return (
                <List>
                    {content.map((item, index) => (
                        <ListItem key={index}>
                            <ListItemIcon>
                                <ArrowRightIcon sx={{ color: 'gold' }} />
                            </ListItemIcon>
                            <ListItemText
                                primary={
                                    typeof item === 'object'
                                        ? item.type || item.name || JSON.stringify(item)
                                        : item
                                }
                                sx={{
                                    '& .MuiListItemText-primary': {
                                        color: '#FFF'
                                    }
                                }}
                            />
                        </ListItem>
                    ))}
                </List>
            );
        }

        if (typeof content === 'object' && content !== null) {
            return (
                <Box sx={{ pl: level > 0 ? 2 : 0 }}>
                    {Object.entries(content).map(([key, value]) => (
                        <Box key={key} sx={{ mb: 2 }}>
                            <Typography
                                variant="subtitle1"
                                sx={{
                                    color: 'gold',
                                    textTransform: 'capitalize',
                                    mb: 1,
                                    fontWeight: 500
                                }}
                            >
                                {key.replace(/([A-Z])/g, ' $1')}
                            </Typography>
                            {renderNestedContent(value, level + 1)}
                        </Box>
                    ))}
                </Box>
            );
        }

        return (
            <Typography
                variant="body2"
                sx={{ color: '#FFF' }}
            >
                {String(content)}
            </Typography>
        );
    };

    const renderAdviceContent = (content) => {
        return (
            <Box sx={{ mt: 3 }}>
                {content.introduction && (
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            mb: 3,
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            color: '#FFF',
                            borderLeft: '4px solid gold'
                        }}
                    >
                        <Typography variant="body1">
                            {content.introduction}
                        </Typography>
                    </Paper>
                )}

                {Object.entries(content).map(([key, value]) => {
                    if (key === 'introduction') return null;

                    return (
                        <Accordion
                            key={key}
                            sx={{
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                color: '#FFF',
                                mb: 2,
                                '&:before': {
                                    display: 'none',
                                },
                                '&.Mui-expanded': {
                                    margin: '0 0 16px 0',
                                }
                            }}
                        >
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon sx={{ color: '#FFF' }} />}
                                sx={{
                                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                                    '&.Mui-expanded': {
                                        minHeight: 48,
                                        backgroundColor: 'rgba(255, 215, 0, 0.1)'
                                    }
                                }}
                            >
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <NoteIcon sx={{ color: 'gold' }} />
                                    <Typography sx={{
                                        textTransform: 'capitalize',
                                        fontWeight: 500
                                    }}>
                                        {key.replace(/([A-Z])/g, ' $1')}
                                    </Typography>
                                </Stack>
                            </AccordionSummary>
                            <AccordionDetails>
                                {renderNestedContent(value)}
                            </AccordionDetails>
                        </Accordion>
                    );
                })}
            </Box>
        );
    };

    const renderEventContent = (content) => {
        return (
            <Card
                sx={{
                    mt: 3,
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    color: '#FFF',
                    border: '1px solid rgba(255, 215, 0, 0.3)'
                }}
            >
                <CardHeader
                    avatar={
                        <EventIcon sx={{ color: "#FFD700", fontSize: 40 }} />
                    }
                    title={
                        <Typography variant="h6" sx={{ color: '#FFD700' }}>
                            {content.purpose}
                        </Typography>
                    }
                    subheader={
                        <Typography
                            variant="body2"
                            sx={{
                                color: 'rgba(255, 255, 255, 0.7)',
                                mt: 1
                            }}
                        >
                            {content.importance}
                        </Typography>
                    }
                    sx={{
                        backgroundColor: 'rgba(255, 215, 0, 0.1)',
                        borderBottom: '1px solid rgba(255, 215, 0, 0.2)',
                        '& .MuiCardHeader-content': {
                            overflow: 'hidden'
                        }
                    }}
                />
                <CardContent>
                    <Grid container spacing={3}>
                        {content.details && (
                            <>
                                <Grid item xs={12} sm={6}>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <CalendarTodayIcon sx={{ color: 'gold' }} />
                                        <Typography>
                                            {new Date(content.details.date).toLocaleDateString()}
                                        </Typography>
                                    </Stack>
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <AccessTimeIcon sx={{ color: 'gold' }} />
                                        <Typography>{content.details.time}</Typography>
                                    </Stack>
                                </Grid>

                                <Grid item xs={12}>
                                    <Stack direction="row" spacing={2} alignItems="flex-start">
                                        <LocationOnIcon sx={{ color: 'gold', mt: 0.5 }} />
                                        <Typography>{content.details.location}</Typography>
                                    </Stack>
                                </Grid>

                                {content.details.benefits && (
                                    <Grid item xs={12}>
                                        <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                                        <Typography
                                            variant="subtitle1"
                                            sx={{
                                                color: 'gold',
                                                mb: 2,
                                                fontWeight: 500
                                            }}
                                        >
                                            Benefits
                                        </Typography>
                                        <List>
                                            {content.details.benefits.map((benefit, index) => (
                                                <ListItem key={index}>
                                                    <ListItemIcon>
                                                        <ArrowRightIcon sx={{ color: 'gold' }} />
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        primary={benefit}
                                                        sx={{
                                                            '& .MuiListItemText-primary': {
                                                                color: '#FFF'
                                                            }
                                                        }}
                                                    />
                                                </ListItem>
                                            ))}
                                        </List>
                                    </Grid>
                                )}

                                {content.details.targetAudience && (
                                    <Grid item xs={12}>
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                p: 2,
                                                backgroundColor: 'rgba(255, 215, 0, 0.05)',
                                                border: '1px solid rgba(255, 215, 0, 0.2)',
                                                borderRadius: 1
                                            }}
                                        >
                                            <Typography
                                                variant="subtitle2"
                                                sx={{
                                                    color: 'gold',
                                                    mb: 1,
                                                    fontWeight: 500
                                                }}
                                            >
                                                Target Audience
                                            </Typography>
                                            <Typography variant="body2" sx={{color: '#FFF'}}>
                                                {content.details.targetAudience}
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                )}
                            </>
                        )}

                        {content.testTypes && (
                            <Grid item xs={12}>
                                <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                                <Typography
                                    variant="subtitle1"
                                    sx={{
                                        color: 'gold',
                                        mb: 2,
                                        fontWeight: 500
                                    }}
                                >
                                    Test Types Available
                                </Typography>
                                <List>
                                    {content.testTypes.map((test, index) => (
                                        <ListItem key={index}>
                                            <ListItemIcon>
                                                <ArrowRightIcon sx={{ color: 'gold' }} />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={test}
                                                sx={{
                                                    '& .MuiListItemText-primary': {
                                                        color: '#FFF'
                                                    }
                                                }}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            </Grid>
                        )}

                        {content.contact && (
                            <Grid item xs={12}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 2,
                                        backgroundColor: 'rgba(255, 215, 0, 0.05)',
                                        border: '1px solid rgba(255, 215, 0, 0.2)',
                                        borderRadius: 1
                                    }}
                                >
                                    <Typography
                                        variant="subtitle1"
                                        sx={{
                                            color: 'gold',
                                            mb: 2,
                                            fontWeight: 500
                                        }}
                                    >
                                        Contact Information
                                    </Typography>
                                    <Stack spacing={1} sx={{color: '#FFF'}}>
                                        <Typography variant="body2">
                                            Organizer: {content.contact.organizer}
                                        </Typography>
                                        <Typography variant="body2">
                                            Phone: {content.contact.phone}
                                        </Typography>
                                        <Typography variant="body2">
                                            Email: {content.contact.email}
                                        </Typography>
                                    </Stack>
                                </Paper>
                            </Grid>
                        )}
                    </Grid>
                </CardContent>
            </Card>
        );
    };

    const renderAlertContent = (content) => {
        return (
            <Paper
                elevation={3}
                sx={{
                    mt: 3,
                    overflow: 'hidden',
                    backgroundColor: 'rgba(255, 82, 82, 0.05)',
                    border: '1px solid rgba(255, 82, 82, 0.3)',
                    borderRadius: 2
                }}
            >
                <Box
                    sx={{
                        p: 2,
                        backgroundColor: 'rgba(255, 82, 82, 0.1)',
                        borderBottom: '1px solid rgba(255, 82, 82, 0.2)'
                    }}
                >
                    <Stack direction="row" spacing={2} alignItems="center">
                        <WarningIcon sx={{ color: '#FF5252', fontSize: 32 }} />
                        <Typography
                            variant="h6"
                            sx={{
                                color: '#FF5252',
                                fontWeight: 500
                            }}
                        >
                            Important Alert
                        </Typography>
                    </Stack>
                </Box>
                <Box sx={{ p: 3 }}>
                    <Typography
                        variant="body1"
                        sx={{
                            color: '#FFF',
                            whiteSpace: 'pre-wrap',
                            '& strong': {
                                color: '#FF5252'
                            }
                        }}
                    >
                        {content}
                    </Typography>
                </Box>
            </Paper>
        );
    };

    const renderPollContent = () => {
        const totalVotes = feed.poll.options.reduce((sum, option) => sum + option.votes, 0);

        return (
            <Card
                sx={{
                    mt: 3,
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    color: '#FFF',
                    border: '1px solid rgba(66, 165, 245, 0.3)'
                }}
            >
                <CardHeader
                    avatar={
                        <PollIcon sx={{ color: "#42A5F5", fontSize: 40 }} />
                    }
                    title={
                        <Typography variant="h6" sx={{ color: '#42A5F5' }}>
                            {feed.poll.question}
                        </Typography>
                    }
                    sx={{
                        backgroundColor: 'rgba(66, 165, 245, 0.1)',
                        borderBottom: '1px solid rgba(66, 165, 245, 0.2)'
                    }}
                />
                <CardContent>
                    <Grid container spacing={2}>
                        {feed.poll.options.map((option, index) => {
                            const percentage = totalVotes > 0
                                ? Math.round((option.votes / totalVotes) * 100)
                                : 0;

                            return (
                                <Grid item xs={12} key={index}>
                                    <Box sx={{ position: 'relative' }}>
                                        <Button
                                            fullWidth
                                            variant={votedOption === index ? "contained" : "outlined"}
                                            onClick={() => handleVote(index)}
                                            sx={{
                                                justifyContent: 'space-between',
                                                padding: '12px 20px',
                                                backgroundColor: votedOption === index
                                                    ? 'rgba(66, 165, 245, 0.2)'
                                                    : 'transparent',
                                                borderColor: 'rgba(66, 165, 245, 0.5)',
                                                '&:hover': {
                                                    backgroundColor: votedOption === index
                                                        ? 'rgba(66, 165, 245, 0.3)'
                                                        : 'rgba(66, 165, 245, 0.1)',
                                                    borderColor: '#42A5F5'
                                                }
                                            }}
                                        >
                                            <Typography
                                                sx={{
                                                    color: votedOption === index ? '#42A5F5' : '#FFF',
                                                    zIndex: 1
                                                }}
                                            >
                                                {option.text}
                                            </Typography>
                                            <Chip
                                                label={`${percentage}% (${option.votes})`}
                                                size="small"
                                                sx={{
                                                    backgroundColor: votedOption === index
                                                        ? 'rgba(66, 165, 245, 0.3)'
                                                        : 'rgba(255, 255, 255, 0.1)',
                                                    color: votedOption === index ? '#42A5F5' : '#FFF',
                                                    zIndex: 1
                                                }}
                                            />
                                        </Button>
                                        <LinearProgress
                                            variant="determinate"
                                            value={percentage}
                                            sx={{
                                                position: 'absolute',
                                                bottom: 0,
                                                left: 0,
                                                right: 0,
                                                height: '100%',
                                                backgroundColor: 'transparent',
                                                '& .MuiLinearProgress-bar': {
                                                    backgroundColor: 'rgba(66, 165, 245, 0.1)'
                                                }
                                            }}
                                        />
                                    </Box>
                                </Grid>
                            );
                        })}
                    </Grid>
                </CardContent>
            </Card>
        );
    };

    const renderContent = () => {
        switch (feed.type) {
            case "advice":
                return (
                    <>
                        {renderAdviceContent(feed.content)}
                    </>
                );
            case "alerts":
                return (
                    <>
                        {renderAlertContent(feed.content)}
                    </>
                );
            case "events":
                return (
                    <>
                        {renderEventContent(feed.content)}
                    </>
                );
            case "polls":
                return (
                    <>
                        {renderPollContent()}
                    </>
                );
            default:
                return (
                    <>
                        {typeof feed.content === "object"
                            ? renderAdviceContent(feed.content)
                            : (
                                <Typography variant="body1">{feed.content}</Typography>
                            )}
                    </>
                );
        }
    };

    return (
        <Box sx={{
            padding: "20px",
            maxWidth: "900px",
            margin: "0 auto"
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
                        label="Feeds"
                        value="/health-worker/info-hub/feeds" // The route for the main news list
                        sx={tabProps}
                    />
                    <Tab
                        label="Full Article"
                        value={`/health-worker/info-hub/feeds/${id}`} // The route for the full article
                        sx={tabProps}
                    />
                </Tabs>
            </Stack>
            <Paper
                elevation={3}
                sx={{
                    p: 3,
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px'
                }}
            >
                <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    sx={{ mb: 3 }}
                >
                    <RssFeedIcon sx={{ color: categoryColors[feed.type] || 'gold', fontSize: '35px' }}/>
                    <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h4" component="h1" sx={{
                                color: '#fff',
                                fontWeight: 600
                            }}>
                                {feed.title}
                            </Typography>
                            {feed.author.id === healthWorkerProfile?._id && (
                                <ActionMenu
                                    item={feed}
                                    type="feed"
                                    healthWorkerProfile={healthWorkerProfile}
                                    onDelete={handleFeedDeleted}
                                />
                            )}
                        </Box>
                        <Typography
                            variant="body2"
                            sx={{
                                color: "rgba(255, 255, 255, 0.7)",
                                fontStyle: "italic"
                            }}
                        >
                            {feed.snippet}
                        </Typography>
                    </Box>
                    <Typography
                        variant="body2"
                        sx={{
                            color: "gold",
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                        }}
                    >
                        <CalendarTodayIcon sx={{ fontSize: 16 }} />
                        {new Date(feed.timestamp).toLocaleDateString()}
                    </Typography>
                </Stack>

                {feed.scope && (
                    <Stack
                        direction="row"
                        spacing={1}
                        sx={{ mb: 3 }}
                    >
                        {Object.entries(feed.scope).map(([key, value]) => (
                            <Chip
                                key={key}
                                label={`${key}: ${value}`}
                                size="small"
                                sx={{
                                    backgroundColor: 'rgba(255, 215, 0, 0.1)',
                                    color: 'gold',
                                    '& .MuiChip-label': {
                                        textTransform: 'capitalize'
                                    }
                                }}
                            />
                        ))}
                    </Stack>
                )}

                <Divider sx={{
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    mb: 3
                }} />

                {renderContent()}
            </Paper>
        </Box>
    );
}

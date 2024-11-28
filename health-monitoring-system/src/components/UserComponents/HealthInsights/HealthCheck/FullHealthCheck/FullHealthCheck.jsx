'use client';
import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, arrayUnion, setDoc, collection, addDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '@/server/db/fireStore';
import {
    Box,
    Container,
    Typography,
    Button,
    CircularProgress,
    Paper,
    Chip,
    Divider,
    Stack,
    IconButton,
    useTheme,
    alpha,
    Fade, FormControlLabel, Checkbox, Alert, AlertTitle,
} from '@mui/material';
import {
    ArrowBack as BackIcon,
    LocalHospital as HospitalIcon,
    Warning as WarningIcon,
    Coronavirus as VirusIcon,
    PregnantWoman as WomanIcon,
    ElderlyWoman as ElderlyIcon,
    ErrorOutline as EmergencyIcon,
    MedicalServices as TreatmentIcon,
    ContactSupport as ContactIcon,
    Lightbulb as LightbulbIcon,
    Shield as ShieldIcon,
    FlashOn as FlashOnIcon,
    Error as ErrorIcon,
    Search as SearchIcon,
    Close as CloseIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import TextField from "@mui/material/TextField";
import Modal from "@mui/material/Modal";
import Grid from "@mui/material/Grid2";
import {toast} from "sonner";
import {useMutation} from "@tanstack/react-query";
import AdminUtils from "@/utils/AdminUtils";

const categoryIcons = {
    "Infectious Diseases": <VirusIcon />,
    "Women's Health": <WomanIcon />,
    "Elderly Care": <ElderlyIcon />,
    "Other": <HospitalIcon />
};

const categoryColors = {
    "Infectious Diseases": '#ff6b6b',
    "Women's Health": '#da77f2',
    "Elderly Care": '#4dabf7',
    "Other": '#9e9e9e'
};

const getValidCategory = (category) => {
    return categoryColors.hasOwnProperty(category) ? category : "Other";
};

export default function FullHealthCheckPage({ userProfile, id }) {
    const [polling, setPolling] = useState(false); // Tracks poll checkbox
    const [modalOpen, setModalOpen] = useState(false);
    const [personalMessage, setPersonalMessage] = useState('');
    const [submitStatus, setSubmitStatus] = useState(null); // Tracks success or
    const [condition, setCondition] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hasVoted, setHasVoted] = useState(false);
    const router = useRouter();
    const theme = useTheme();
    //construct fullName with firstName middleName(optional) and lastName from the userProfile
    const fullName = `${userProfile.firstName} ${userProfile.middleName || ''} ${userProfile.lastName}`;

    useEffect(() => {
        fetchCondition();
    }, [id]);

    useEffect(() => {
        const checkVoteStatus = async () => {
            if (condition?.id) {
                const healthConditionRef = doc(db, 'healthConditions', condition.id);
                const healthConditionSnap = await getDoc(healthConditionRef);
                const existingVotes = healthConditionSnap.data()?.votes || [];
                const userAlreadyVoted = existingVotes.some((vote) => vote.userId === userProfile._id);
                setHasVoted(userAlreadyVoted);
            }
        };
        checkVoteStatus();
    }, [condition?.id, userProfile._id]);

    const createMessage = async (healthCheckData) => {
        try {
            const messagesRef = collection(db, 'messages');
            const messageData = {
                senderId: 'system',
                senderName: 'Health System',
                receiverId: userProfile._id,
                content: `Thank you for submitting your health check request. Our specialist will contact you soon regarding your condition: ${healthCheckData.conditionTitle}.`,
                type: 'health_check_notification',
                read: false,
                timestamp: serverTimestamp(), // Use serverTimestamp for consistency
                createdAt: serverTimestamp(),
                metadata: {
                    healthCheckId: healthCheckData.healthIssueId,
                    category: healthCheckData.category,
                    severity: healthCheckData.severity
                }
            };

            // Create the message
            const messageRef = await addDoc(messagesRef, messageData);

            // Create a notification for the message
            const notificationsRef = collection(db, 'notifications');
            const notificationData = {
                userId: userProfile._id,
                type: 'new_message',
                title: 'New Health Check Response',
                message: `Response to your health check request for: ${healthCheckData.conditionTitle}`,
                status: 'unread',
                actionUrl: '/inbox',
                createdAt: serverTimestamp(),
                metadata: {
                    messageId: messageRef.id,
                    healthCheckId: healthCheckData.healthIssueId,
                    category: healthCheckData.category
                }
            };

            await addDoc(notificationsRef, notificationData);
            toast.success("You will be contacted by a specialist soon!");
        } catch (error) {
            console.error('Error creating message:', error);
            toast.error("Failed to create notification");
        }
    };

    const mutationCreateMedicalRecord = useMutation({
        mutationKey: ['CreateMedicalRecord'],
        mutationFn: AdminUtils.createMedicalHistoryRecord,
        onSuccess: () => {
            toast.success("Medical record created successfully!");
        },
        onError: (error) => {
            toast.error("Failed to create medical record");
            console.error("Error creating medical record:", error);
        }
    });

    const createMedicalRecord = async (medicalData) => {
        try {
            // Validate required fields based on our schema
            const requiredFields = {
                userId: medicalData.userId,
                healthIssueId: medicalData.healthIssueId,
                conditionTitle: medicalData.conditionTitle,
                category: medicalData.category
            };

            // Check if any required field is missing
            const missingFields = Object.entries(requiredFields)
                .filter(([_, value]) => !value)
                .map(([key]) => key);

            if (missingFields.length > 0) {
                toast.error(`Missing required fields: ${missingFields.join(', ')}`);
                return;
            }

            // Create medical record with all schema fields
            const medicalRecord = {
                ...medicalData,
                status: medicalData.status || 'pending',
                severity: medicalData.severity || 'medium',
                message: medicalData.message || null,
                specialistNotes: null,
                followUpDate: null,
                resolved: false
            };

            await mutationCreateMedicalRecord.mutateAsync(medicalRecord);
        } catch (error) {
            toast.error("Failed to create medical record");
            console.error("Error creating medical record:", error);
        }
    };

    const handleVote = async () => {
        if (!userProfile || !condition || hasVoted) return;

        try {
            const healthConditionRef = doc(db, 'healthConditions', condition.id);
            const voteData = {
                userId: userProfile._id,
                timestamp: new Date(),
                userRequest: {
                    status: 'pending', // Track the request status
                    requestId: condition.id
                }
            };

            await updateDoc(healthConditionRef, {
                votes: arrayUnion(voteData),
                voteCount: increment(1)
            });

            setHasVoted(true);
            toast.success("Vote submitted successfully");
        } catch (error) {
            console.error('Error submitting vote:', error);
            toast.error("Failed to submit vote");
        }
    };

    const handleSubmitRequest = async () => {
        if (!userProfile || !condition) {
            return;
        }
        if (!personalMessage.trim()) {
            toast.error("Please provide a message about your condition");
            return;
        }

        try {
            setSubmitStatus('submitting');

            // Create medical record first
            const medicalData = {
                userId: userProfile._id,
                healthIssueId: condition.id,
                conditionTitle: condition.title,
                category: condition.category,
                message: personalMessage,
                status: 'pending',
                severity: 'medium'
            };

            // Create the medical record
            await createMedicalRecord(medicalData);

            // Create the user request
            const userRequestRef = doc(db, 'userRequests', userProfile._id);
            const userRequestSnap = await getDoc(userRequestRef);

            const requestData = {
                healthIssueId: condition.id,
                message: personalMessage,
                timestamp: new Date(),
                status: 'pending',
                conditionTitle: condition.title,
                category: condition.category
            };

            // Check for existing request and handle voting
            if (userRequestSnap.exists()) {
                const existingRequests = userRequestSnap.data()?.requests || [];
                const activeRequest = existingRequests.find(
                    req => req.healthIssueId === condition.id && req.status === 'pending'
                );

                if (activeRequest) {
                    setSubmitStatus('duplicate');
                    toast.warning("A request for this condition is already pending");

                    // Allow voting if user hasn't voted yet
                    if (polling && !hasVoted) {
                        await handleVote();
                    }

                    handleSuccessAndClose();
                    return;
                }
            }

            // Create new request or update existing one
            if (!userRequestSnap.exists()) {
                await setDoc(userRequestRef, {
                    userId: userProfile._id,
                    userEmail: userProfile.email,
                    userName: fullName,
                    requests: [requestData],
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
            } else {
                await updateDoc(userRequestRef, {
                    requests: arrayUnion(requestData),
                    updatedAt: new Date()
                });
            }

            // Handle voting if requested with new request
            if (polling && !hasVoted) {
                await handleVote();
            }

            // Create the message and notification
            await createMessage(medicalData);

            setSubmitStatus('success');
            handleSuccessAndClose();
        } catch (error) {
            console.error('Error submitting request:', error);
            setSubmitStatus('error');
            toast.error("Failed to submit request");
        }
    };

    const handleSuccessAndClose = () => {
        setTimeout(() => {
            setModalOpen(false);
            setPersonalMessage('');
            setPolling(false);
            setSubmitStatus(null);
        }, 2000);
    };

    const fetchCondition = async () => {
        if (!id) {
          return;
        }

        try {
            const docRef = doc(db, 'healthConditions', id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                setCondition({ id: docSnap.id, ...docSnap.data() });
            } else {
                setError('Condition not found');
            }
        } catch (err) {
            setError('Error fetching condition details');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const renderListSection = (items, icon, title, color = '#46F0F9', bulletStyle = '•') => {
        if (!items?.length) {
          return null;
        }

        return (
            <Grid  size={{xs:12, md:6}}>
                <Fade in={true} timeout={500}>
                    <Paper
                        elevation={3}
                        sx={{
                            p: 3,
                            height: '100%',
                            borderRadius: '16px',
                            bgcolor: theme.palette.mode === 'dark' ? alpha('#000', 0.6) : alpha('#fff', 0.8),
                        }}
                    >
                        <Stack spacing={2}>
                            <Typography variant="h5" sx={{
                                fontWeight: 600,
                                color: theme.palette.mode === 'dark' ? '#fff' : '#000',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                            }}>
                                {icon}
                                {title}
                            </Typography>
                            <Divider />
                            {items.map((item, index) => (
                                <Typography key={index} sx={{
                                    color: theme.palette.mode === 'dark' ? alpha('#fff', 0.7) : alpha('#000', 0.7),
                                    pl: 2,
                                    '&:before': {
                                        content: `"${bulletStyle}"`,
                                        color: color,
                                        fontWeight: 'bold',
                                        marginRight: '8px'
                                    }
                                }}>
                                    {item}
                                </Typography>
                            ))}
                        </Stack>
                    </Paper>
                </Fade>
            </Grid>
        );
    };

    if (loading) {
      return <CircularProgress sx={{ color: '#46F0F9' }} />;
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
               {error}
           </Typography>
           <Button
               variant="contained"
               startIcon={<BackIcon />}
               onClick={() => router.back()}
               sx={{
                   bgcolor: '#46F0F9',
                   '&:hover': { bgcolor: alpha('#46F0F9', 0.8) }
               }}
           >
               Go Back
           </Button>
       </Stack>
                </Paper>
            </Container>
        );
    }
    if (!condition) {
      return null;
    }

    const { content } = condition;

    return (
        <Container maxWidth="lg" sx={{ py: 1 }}>
            <Box mb={1}>
                <IconButton
                    onClick={() => router.back()}
                    sx={{
                        mb: 1,
                        color: '#fff',
                        '&:hover': { bgcolor: alpha('#46F0F9', 0.1) }
                    }}
                >
                    <BackIcon />
                </IconButton>
            </Box>

            <Paper
                elevation={3}
                sx={{
                    p: 4,
                    mb: 4,
                    borderRadius: '16px',
                    background: `linear-gradient(135deg, ${alpha(categoryColors[getValidCategory(condition.category)], 0.4)} 0%, ${alpha('#000', theme.palette.mode === 'dark' ? 0.6 : 0.1)} 100%)`,
                }}
            >
                <Grid container spacing={3}>
                    <Grid  size={{xs:12}}>
                        <Chip
                            icon={categoryIcons[getValidCategory(condition.category)]}
                            label={condition.category}
                            sx={{
                                bgcolor: alpha(categoryColors[getValidCategory(condition.category)], 0.1),
                                color: categoryColors[getValidCategory(condition.category)],
                                borderRadius: '8px',
                                mb: 2
                            }}
                        />
                        <Typography variant="h3" sx={{
                            mb: 2,
                            background: `linear-gradient(135deg, #fff 0%, ${alpha('#fff', 0.7)} 100%)`,
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}>
                            {condition.title}
                        </Typography>
                        <Typography variant="h6" sx={{ color: alpha('#fff', 0.9) }}>
                            {content?.introduction}
                        </Typography>
                    </Grid>
                </Grid>
            </Paper>

            <Grid container spacing={3}>
                {/* Symptoms Section */}
                {renderListSection(
                    content?.symptoms,
                    <WarningIcon sx={{ color: '#ff9800' }} />,
                    'Symptoms',
                    '#ff9800'
                )}

                {/* Management/Treatment Section */}
                {renderListSection(
                    content?.management || content?.treatments,
                    <TreatmentIcon sx={{ color: '#4caf50' }} />,
                    'Management & Treatment',
                    '#4caf50'
                )}

                {/* Prevention/Preventive Strategies Section */}
                {renderListSection(
                    content?.preventiveStrategies || content?.prevention,
                    <ShieldIcon sx={{ color: '#2196f3' }} />,
                    'Prevention & Strategies',
                    '#2196f3'
                )}

                {/* Tips Section */}
                {renderListSection(
                    content?.tips,
                    <LightbulbIcon sx={{ color: '#46F0F9' }} />,
                    'Tips & Advice',
                    '#46F0F9'
                )}

                {/* Triggers Section */}
                {renderListSection(
                    content?.triggers,
                    <FlashOnIcon sx={{ color: '#f44336' }} />,
                    'Triggers',
                    '#f44336'
                )}

                {/* Complications Section */}
                {renderListSection(
                    content?.complications,
                    <WarningIcon sx={{ color: '#ffa726' }} />,
                    'Complications',
                    '#ffa726'
                )}

                {/* Lifestyle Changes Section */}
                {renderListSection(
                    content?.lifestyleChanges,
                    <LightbulbIcon sx={{ color: '#9c27b0' }} />,
                    'Lifestyle Changes',
                    '#9c27b0'
                )}

                {/* Risk Factors Section */}
                {renderListSection(
                    content?.riskFactors,
                    <ErrorIcon sx={{ color: '#e91e63' }} />,
                    'Risk Factors',
                    '#e91e63'
                )}

                {/* Diagnosis Section */}
                {renderListSection(
                    content?.diagnosis,
                    <SearchIcon sx={{ color: '#795548' }} />,
                    'Diagnosis',
                    '#795548'
                )}

                {/* Emergency Signs Section - Always Full Width */}
                {content?.emergencySigns?.length > 0 && (
                    <Grid  size={{xs:12}}>
                        <Fade in={true} timeout={900}>
                            <Paper
                                elevation={3}
                                sx={{
                                    p: 3,
                                    borderRadius: '16px',
                                    bgcolor: alpha('#ff6b6b', theme.palette.mode === 'dark' ? 0.2 : 0.1),
                                    border: `1px solid ${alpha('#ff6b6b', 0.2)}`
                                }}
                            >
                                <Stack spacing={2}>
                                    <Typography variant="h5" sx={{
                                        fontWeight: 600,
                                        color: '#ff6b6b',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1
                                    }}>
                                        <EmergencyIcon />
                                        Emergency Signs
                                    </Typography>
                                    <Divider sx={{ borderColor: alpha('#ff6b6b', 0.2) }} />
                                    {content.emergencySigns.map((sign, index) => (
                                        <Typography key={index} sx={{
                                            color: '#ff6b6b',
                                            pl: 2,
                                            '&:before': {
                                                content: `"⚠"`,
                                                color: '#ff6b6b',
                                                fontWeight: 'bold',
                                                marginRight: '8px'
                                            }
                                        }}>
                                            {sign}
                                        </Typography>
                                    ))}
                                </Stack>
                            </Paper>
                        </Fade>
                    </Grid>
                )}

                {/* Contact Doctor Section - Always at Bottom */}
                {content?.contactDoctorCTA && (
                    <Grid  size={{xs:12}}>
                        <Fade in={true} timeout={1100}>
                            <Paper
                                elevation={3}
                                sx={{
                                    p: 3,
                                    borderRadius: '16px',
                                    bgcolor: theme.palette.mode === 'dark' ? alpha('#000', 0.6) : alpha('#fff', 0.8),
                                }}
                            >
                                <Stack spacing={2} alignItems="center">
                                    <Typography variant="h5" sx={{
                                        fontWeight: 600,
                                        color: theme.palette.mode === 'dark' ? '#fff' : '#000',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1
                                    }}>
                                        <ContactIcon sx={{ color: '#3366ff' }} />
                                        Professional Medical Advice
                                    </Typography>
                                    <Typography sx={{
                                        color: theme.palette.mode === 'dark' ? alpha('#fff', 0.7) : alpha('#000', 0.7),
                                        textAlign: 'center'
                                    }}>
                                        {content.contactDoctorCTA}
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        size="large"
                                        startIcon={<HospitalIcon />}
                                        onClick={() => setModalOpen(true)}
                                        sx={{
                                            mt: 2,
                                            bgcolor: '#3366ff',
                                            '&:hover': { bgcolor: alpha('#002080', 0.8) }
                                        }}
                                    >
                                        Contact a Specialist
                                    </Button>
                                </Stack>
                            </Paper>
                        </Fade>
                    </Grid>
                )}
            </Grid>
            <Modal
                open={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setSubmitStatus(null);
                    setPersonalMessage('');
                    setPolling(false);
                }}
            >
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '90%',
                    maxWidth: '500px',
                    bgcolor: theme.palette.mode === 'dark' ? '#1a1a1a' : 'white',
                    borderRadius: '16px',
                    boxShadow: 24,
                    p: 4,
                }}>
                    <IconButton
                        onClick={() => setModalOpen(false)}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: theme.palette.mode === 'dark' ? '#fff' : '#666',
                        }}
                    >
                        <CloseIcon />
                    </IconButton>

                    <Stack spacing={3}>
                        <Box>
                            <Typography variant="h5" sx={{
                                mb: 1,
                                color: theme.palette.mode === 'dark' ? '#fff' : '#000',
                                fontWeight: 600
                            }}>
                                Contact a Specialist
                            </Typography>
                            <Typography variant="body2" sx={{
                                color: theme.palette.mode === 'dark' ? '#ccc' : '#666'
                            }}>
                                Get professional medical advice for {condition.title}
                            </Typography>
                        </Box>

                        <TextField
                            fullWidth
                            multiline
                            minRows={4}
                            placeholder="Describe your symptoms or concerns in detail..."
                            value={personalMessage}
                            onChange={(e) => setPersonalMessage(e.target.value)}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    bgcolor: theme.palette.mode === 'dark' ? '#333' : '#f5f5f5',
                                    '&:hover': {
                                        bgcolor: theme.palette.mode === 'dark' ? '#404040' : '#ececec',
                                    },
                                },
                                '& .MuiOutlinedInput-input': {
                                    color: theme.palette.mode === 'dark' ? '#fff' : '#000',
                                },
                            }}
                        />

                        <Box sx={{ bgcolor: alpha('#46F0F9', 0.1), p: 2, borderRadius: 2 }}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={polling}
                                        onChange={(e) => setPolling(e.target.checked)}
                                        disabled={hasVoted}
                                        sx={{
                                            color: '#46F0F9',
                                            '&.Mui-checked': {
                                                color: '#46F0F9',
                                            },
                                        }}
                                    />
                                }
                                label={
                                    hasVoted
                                        ? "You have already voted for this condition"
                                        : "Add my vote to help improve this health condition information"
                                }
                            />
                        </Box>

                        {submitStatus && (
                            <Alert
                                severity={submitStatus === 'success' ? 'success' : submitStatus === 'duplicate' ? 'warning' : 'error'}
                                sx={{
                                    '& .MuiAlert-message': {
                                        color: theme.palette.mode === 'dark' ? '#fff' : 'inherit'
                                    }
                                }}
                            >
                                {submitStatus === 'success' && (
                                    <>
                                        <AlertTitle>Request Submitted Successfully</AlertTitle>
                                        A specialist will review your case and contact you soon.
                                    </>
                                )}
                                {submitStatus === 'duplicate' && (
                                    <>
                                        <AlertTitle>Already Submitted</AlertTitle>
                                        You have an active request for this health issue.
                                    </>
                                )}
                                {submitStatus === 'error' && (
                                    <>
                                        <AlertTitle>Submission Failed</AlertTitle>
                                        Please try again later or contact support.
                                    </>
                                )}
                            </Alert>
                        )}

                        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                            <Button
                                fullWidth
                                variant="outlined"
                                onClick={() => {
                                    setModalOpen(false);
                                    setSubmitStatus(null);
                                    setPersonalMessage('');
                                    setPolling(false);
                                }}
                                sx={{
                                    bgcolor: '#b32400',
                                    color: '#FFF',
                                    '&:hover': {
                                        borderColor: alpha('#46F0F9', 0.8),
                                        bgcolor: alpha('#330a00', 0.9),
                                    },
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                fullWidth
                                variant="contained"
                                onClick={handleSubmitRequest}
                                disabled={submitStatus === 'success'}
                                sx={{
                                    bgcolor: '#3366ff',
                                    '&:hover': {
                                        bgcolor: alpha('#002080', 0.8),
                                    },
                                    '&.Mui-disabled': {
                                        bgcolor: alpha('#46F0F9', 0.3),
                                    },
                                }}
                            >
                                {submitStatus === 'success' ? 'Submitted' : 'Submit Request'}
                            </Button>
                        </Box>
                    </Stack>
                </Box>
            </Modal>
        </Container>
    );
}

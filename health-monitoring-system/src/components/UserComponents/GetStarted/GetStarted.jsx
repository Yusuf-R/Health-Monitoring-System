'use client';

import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import FavoriteIcon from '@mui/icons-material/Favorite';
import CircularProgress from '@mui/material/CircularProgress';
import { useState, useEffect } from 'react';

function GetStarted() {
    const router = useRouter();
    const [loading, setLoading] = useState(false); // Loading state

    const handleGetStarted = () => {
        setLoading(true);
        router.push('/user/profile/update');
    };

    return (
        <>
            <Box
                sx={{
                    position: 'relative',
                    height: '100vh',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                    backgroundImage: 'url(/get-started.svg)', // Background image
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    overflow: 'hidden', // Prevents scrollbars
                }}
            >
                {/* Overlay for dimming the background */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0, 0, 0, 0.7)', // Dimmed effect
                        zIndex: 1, // Ensure it overlays the background
                    }}
                ></Box>

                {/* Content Layer */}
                <Box
                    sx={{
                        position: 'relative',
                        zIndex: 2, // Ensure it's above the overlay
                        padding: '20px',
                        color: '#FFF',
                    }}
                >
                    <Typography
                        variant="h3"
                        sx={{
                            fontWeight: 'bold',
                            marginBottom: '20px',
                            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)',
                        }}
                    >
                        Welcome to Your Health Monitoring Journey 🚀
                    </Typography>
                    <Typography
                        variant="h6"
                        sx={{
                            maxWidth: '600px',
                            lineHeight: '1.6',
                            fontSize: '1.4rem',
                            marginBottom: '30px',
                            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)',
                        }}
                    >
                        Your health deserves a personalized touch. Let’s build a profile that’s uniquely yours, unlocking tailored insights and tools to empower your wellness journey. Together, we’ll ensure every step is about *you*—because your health is your story. 🌟
                    </Typography>
                    <br/>
                    <Typography
                        variant="h6"
                        sx={{
                            maxWidth: '600px',
                            lineHeight: '1.6',
                            fontSize: '1.4rem',
                            marginBottom: '30px',
                            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)',
                        }}
                    >
                        Please complete profile and location setup
                    </Typography>
                    <Box
                        component="button"
                        onClick={handleGetStarted}
                        disabled={loading} // Disable button when loading
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            padding: '15px 40px',
                            fontSize: '1.3rem',
                            fontWeight: 'bold',
                            backgroundColor: loading ? '#B0BEC5' : '#4CAF50', // Change color when loading
                            color: '#FFF',
                            border: 'none',
                            borderRadius: '25px',
                            cursor: loading ? 'not-allowed' : 'pointer', // Prevent clicks when loading
                            transition: 'background-color 0.3s ease',
                            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                            '&:hover': {
                                backgroundColor: loading ? '#B0BEC5' : '#388E3C',
                            },
                        }}
                    >
                        {loading ? (
                            <>
                                <CircularProgress size={24} sx={{ color: '#FFF' }} />
                                <Typography variant="body1" sx={{ ml: 1 }}>
                                    Please wait...
                                </Typography>
                            </>
                        ) : (
                            <>
                                Let’s Get Started
                                <motion.div
                                    initial={{ scale: 1 }}
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{
                                        duration: 1,
                                        repeat: Infinity,
                                        repeatType: 'loop',
                                    }}
                                >
                                    <FavoriteIcon
                                        sx={{
                                            color: '#FF1744', // Heart color
                                            fontSize: '40px', // Icon size
                                        }}
                                    />
                                </motion.div>
                            </>
                        )}
                    </Box>
                </Box>
            </Box>
        </>
    );
}

export default GetStarted;

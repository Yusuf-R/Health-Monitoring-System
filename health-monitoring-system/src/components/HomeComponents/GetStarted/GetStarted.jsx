'use client';
import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { useRouter } from 'next/navigation';
import { keyframes } from '@mui/material/styles';
import { motion } from 'framer-motion';

// Background images for each category
const backgroundImages = {
  user: 'url("/pic6.svg")',
  healthWorker: 'url("/pic3.svg")',
  stakeholder: 'url("/pic6.png")',
};

// Subtle floating animation
const floatEffect = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

// Animation for heading entrance
const fadeIn = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 1 },
};

function GetStarted() {
  const router = useRouter();
  const [loading, setLoading] = useState({ user: false, healthWorker: false });

  const handleGetStarted = async (route, role) => {
    setLoading(prev => ({ ...prev, [role]: true }));
    // Simulate a small delay to show loading state
    await new Promise(resolve => setTimeout(resolve, 1000));
    router.push(route);
  };

  // Category cards with buttons for each role
  const categories = [
    {
      title: 'User',
      description: 'Discover health insights, track wellness, and connect with mentors.',
      backgroundImage: backgroundImages.user,
      route: '/authorization/user',
      role: 'user',
    },
    {
      title: 'Health Worker',
      description: 'Access community health data, provide mentorship, and assist in health monitoring.',
      backgroundImage: backgroundImages.healthWorker,
      route: '/authorization/health-worker',
      role: 'healthWorker',
    },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '30px',
        padding: '60px 20px',
        textAlign: 'center',
        color: 'white',
      }}
    >
      {/* Introductory Heading and Text */}
      <motion.div {...fadeIn}>
        <Typography variant="h2" sx={{ fontSize: { xs: '24px', md: '36px' }, fontWeight: 'bold', mb: 2 }}>
          Welcome to Community Health Monitoring System
        </Typography>
        <Typography variant="body1" sx={{ fontSize: { xs: '16px', md: '20px' }, maxWidth: '800px', mb: 4 }}>
          Select your role to get started. Whether you’re here to track your own health, support others as a health
          worker, or contribute to the community as a stakeholder, we have a place for you. Let’s make a healthier
          community together.
        </Typography>
      </motion.div>

      {/* Category Cards */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          gap: '150px',
          flexWrap: 'wrap',
          width: '100%',
          maxWidth: '1200px',
        }}
      >
        {categories.map(({ title, description, backgroundImage, route, role }) => (
          <Box
            key={title}
            sx={{
              width: { xs: '100%', sm: '280px' },
              height: '380px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              padding: '20px',
              borderRadius: '15px',
              backgroundImage,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              position: 'relative',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'transform 0.3s ease-in-out',
              animation: `${floatEffect} 3s ease-in-out infinite`,
              '&:hover': {
                transform: 'scale(1.02)',
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '70%',
                background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
              },
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
                {title}
              </Typography>
              <Typography variant="body2" sx={{ mb: 3 }}>
                {description}
              </Typography>
              <Button
                variant="contained"
                disabled={loading[role]}
                onClick={() => handleGetStarted(route, role)}
                sx={{
                  backgroundColor: '#2196f3',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: '#1976d2',
                  },
                  '&.Mui-disabled': {
                    backgroundColor: '#90caf9',
                    color: 'white',
                  },
                }}
              >
                {loading[role] ? (
                  <>
                    <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                    Processing...
                  </>
                ) : (
                  'Get Started'
                )}
              </Button>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default GetStarted;

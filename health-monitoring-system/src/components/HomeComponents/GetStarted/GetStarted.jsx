'use client';
import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useRouter } from 'next/navigation';
import { keyframes } from '@mui/material/styles';
import { motion } from 'framer-motion';

// Background images for each category
const backgroundImages = {
  user: 'url("/pic6.svg")',
  healthWorker: 'url("/pic3.svg")',
  stakeholder: 'url("/pic6.png")',
};

// Animation for the button hover effect
const hoverEffect = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

// Animation for heading entrance
const fadeIn = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 1 },
};

function GetStarted() {
  const router = useRouter();

  // Category cards with buttons for each role
  const categories = [
    {
      title: 'User',
      description: 'Discover health insights, track wellness, and connect with mentors.',
      backgroundImage: backgroundImages.user,
      route: '/authorization/user',
    },
    {
      title: 'Health Worker',
      description: 'Access community health data, provide mentorship, and assist in health monitoring.',
      backgroundImage: backgroundImages.healthWorker,
      route: '/authorization/health-worker',
    },
    // {
    //   title: 'Stakeholder',
    //   description: 'Analyze community health trends and contribute to informed decision-making.',
    //   backgroundImage: backgroundImages.stakeholder,
    //   route: '/authorization/stakeholder',
    // },
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
        // background: 'linear-gradient(to right, #004e92, #000428)',
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
        {categories.map(({ title, description, backgroundImage, route }) => (
          <Box
            key={title}
            sx={{
              width: { xs: '100%', sm: '280px' },
              height: '380px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              alignItems: 'center',
              borderRadius: '10px',
              overflow: 'hidden',
              backgroundImage,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.2)',
              position: 'relative',
              color: 'white',
              '&:hover': {
                animation: `${hoverEffect} 0.6s ease-in-out infinite`,
              },
            }}
          >
            <Box
              sx={{
                padding: '20px',
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                width: '100%',
                textAlign: 'center',
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                {title}
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                {description}
              </Typography>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: '#46F0F9',
                  color: '#0E1E1E',
                  fontWeight: 'bold',
                  "&:hover": {
                    backgroundColor: '#34C0D9',
                  },
                }}
                onClick={() => router.push(route)}
              >
                Get Started
              </Button>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default GetStarted;

'use client';
import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { motion } from 'framer-motion';
import { useTheme, keyframes } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

// Animation for border effect
const borderAnimation = keyframes`
  0% { border-color: #46F0F9; }
  25% { border-color: #34C0D9; }
  50% { border-color: #F34F00; }
  75% { border-color: #8D3BFF; }
  100% { border-color: #46F0F9; }
`;

function Services() {
  const theme = useTheme();

  // Breakpoints
  const xSmall = useMediaQuery(theme.breakpoints.down('xs'));
  const small = useMediaQuery(theme.breakpoints.down('sm'));
  const medium = useMediaQuery(theme.breakpoints.down('md'));

  // Responsive font sizes
  const fontSizeH1 = xSmall ? '18px' : small ? '22px' : '28px';
  const fontSizeBody = xSmall ? '14px' : small ? '16px' : '18px';

  return (
    <Box
      sx={{
        maxWidth: '1200px',
        margin: '0 auto',
        textAlign: 'center',
        padding: '20px 20px',
        color: 'white',
      }}
    >
      {/* Services Heading */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <Typography variant="h1" sx={{ fontWeight: 'bold', marginBottom: '40px', marginTop: '10px', fontSize: fontSizeH1 }}>
          CORE SERVICES
        </Typography>
        <Typography variant="body1" sx={{ fontSize: fontSizeBody, marginBottom: '40px' }}>
          Discover the impactful features of the Community Health Monitor that empower individuals and communities alike.
        </Typography>
      </motion.div>

      {/* Services Grid */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2 }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: xSmall || small ? '1fr' : medium ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
            gap: '20px',
          }}
        >
          {[
            { 
              title: 'Health Tracking', 
              description: 'Track daily health symptoms, physical activity, and wellness trends with ease. Empower yourself with insights into your own health patterns and make informed decisions.' 
            },
            { 
              title: 'Mentorship Support', 
              description: 'Receive dedicated support during isolation or illness. Our mentors provide daily check-ins, reminders, and guidance to ensure no one is alone in their health journey.' 
            },
            { 
              title: 'Community Health Insights', 
              description: 'Local health authorities access anonymized health data to monitor trends and respond to outbreaks. Together, we keep communities safer and more informed.' 
            },
            { 
              title: 'Real-Time Alerts', 
              description: 'Stay updated on potential health risks in your area with real-time alerts. Make proactive choices to protect yourself and those around you.' 
            },
          ].map(({ title, description }) => (
            <Box
              key={title}
              sx={{
                padding: '20px',
                borderRadius: '10px',
                borderWidth: '3px',
                borderStyle: 'solid',
                borderColor: 'transparent',
                animation: `${borderAnimation} 4s linear infinite`,
                backgroundColor: 'rgba(30, 30, 30, 0.9)',
                color: 'white',
                boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.3)',
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 'bold', marginBottom: '10px', fontSize: fontSizeBody }}>
                {title}
              </Typography>
              <Typography variant="body1" sx={{ fontSize: fontSizeBody }}>
                {description}
              </Typography>
            </Box>
          ))}
        </Box>
      </motion.div>
    </Box>
  );
}

export default Services;

'use client';
import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
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

function Contact() {
  const theme = useTheme();

  // Breakpoints
  const xSmall = useMediaQuery(theme.breakpoints.down('xs'));
  const small = useMediaQuery(theme.breakpoints.down('sm'));
  const medium = useMediaQuery(theme.breakpoints.down('md'));

  // Responsive font sizes
  const fontSizeH1 = xSmall ? '32px' : small ? '40px' : '48px';
  const fontSizeBody = xSmall ? '14px' : small ? '16px' : '18px';

  return (
    <Box
      sx={{
        maxWidth: '1200px',
        margin: '0 auto',
        textAlign: 'center',
        padding: '0 20px',
      }}
    >
      {/* Contact Heading */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <Typography variant="h1" sx={{ fontWeight: 'bold', marginBottom: '40px', fontSize: fontSizeH1 }}>
          Get in Touch
        </Typography>
        <Typography variant="body1" sx={{ fontSize: fontSizeBody, marginBottom: '40px' }}>
          Have a question about the Community Health Monitor? We're here to help. Reach out to us anytime!
        </Typography>
      </motion.div>

      {/* Enhanced Contact Form */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2 }}
      >
        <Box
          component="form"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            alignItems: 'center',
            padding: '30px',
            background: 'linear-gradient(to right, #004e92, #000428)',
            borderRadius: '10px',
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
            border: '2px solid transparent',
            animation: `${borderAnimation} 4s linear infinite`,
            width: xSmall || small ? '100%' : '80%',
            margin: '0 auto',
          }}
        >
          <TextField
            label="Full Name"
            variant="outlined"
            sx={{
              width: '100%',
              backgroundColor: '#FFF',
              borderRadius: '4px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          />
          <TextField
            label="Email Address"
            variant="outlined"
            sx={{
              width: '100%',
              backgroundColor: '#FFF',
              borderRadius: '4px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          />
          <TextField
            label="Your Message"
            multiline
            rows={4}
            variant="outlined"
            sx={{
              width: '100%',
              backgroundColor: '#FFF',
              borderRadius: '4px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          />
          <Button
            variant="contained"
            sx={{
              backgroundColor: '#46F0F9',
              color: '#0E1E1E',
              fontWeight: 'bold',
              padding: '12px 24px',
              "&:hover": {
                backgroundColor: '#34C0D9',
              },
            }}
          >
            Send Message
          </Button>
        </Box>
      </motion.div>

      {/* Contact Information */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.4 }}
      >
        <Box
          sx={{
            padding: '40px',
            backgroundColor: 'rgba(30, 30, 30, 0.9)',
            color: 'white',
            borderRadius: '10px',
            animation: `${borderAnimation} 4s linear infinite`,
            textAlign: 'center',
            marginTop: '40px',
          }}
        >
          <Typography variant="h5" sx={{ marginBottom: '20px' }}>Community Health Monitor Contact</Typography>
          <Typography variant="body1" sx={{ fontSize: fontSizeBody }}>Email: support@communityhealthmonitor.com</Typography>
          <Typography variant="body1" sx={{ fontSize: fontSizeBody }}>Phone: +234 7068518999</Typography>
          <Typography variant="body1" sx={{ fontSize: fontSizeBody }}>Address: 123 Community Health Blvd, Health City, Nigeria</Typography>
        </Box>
      </motion.div>
    </Box>
  );
}

export default Contact;

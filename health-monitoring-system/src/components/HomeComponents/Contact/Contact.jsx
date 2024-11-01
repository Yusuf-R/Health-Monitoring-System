// Updated Contact.jsx with escaped quotes
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
  const xSmall = useMediaQuery(theme.breakpoints.down('xs'));
  const small = useMediaQuery(theme.breakpoints.down('sm'));
  const medium = useMediaQuery(theme.breakpoints.down('md'));

  // Responsive font sizes
  const fontSizeH1 = xSmall ? '16px' : small ? '20px' : '24px';
  const fontSizeBody = xSmall ? '14px' : small ? '16px' : '18px';

  return (
    <Box
      sx={{
        maxWidth: '1200px',
        margin: '0 auto',
        textAlign: 'center',
        padding: '20px',
      }}
    >
      {/* Contact Heading */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <Typography variant="h1" sx={{ fontWeight: 'bold', marginBottom: '40px', color: '#FFF',fontSize: fontSizeH1 }}>
          CONTACT US
        </Typography>
        <Typography variant="body1" sx={{ fontSize: fontSizeBody, color: '#FFF', marginBottom: '40px' }}>
          We&apos;d love to hear from you. Whether you have a question or need assistance, feel free to reach out!
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
            background: 'linear-gradient(to right, #000428, #004e92)',
            borderRadius: '10px',
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
            border: '2px solid transparent',
            animation: `${borderAnimation} 4s linear infinite`,
            width: xSmall || small ? '100%' : '80%',
            margin: '0 auto',
          }}
        >
          <TextField
            label="Name"
            variant="outlined"
            sx={{
              width: '100%',
              backgroundColor: '#FFF',
              borderRadius: '4px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          />
          <TextField
            label="Email"
            variant="outlined"
            sx={{
              width: '100%',
              backgroundColor: '#FFF',
              borderRadius: '4px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          />
          <TextField
            label="Message"
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
          <Typography variant="h5" sx={{ marginBottom: '20px' }}>Contact Information</Typography>
          <Typography variant="body1" sx={{ fontSize: fontSizeBody }}>Email: support@communityhealthmonitor.com</Typography>
          <Typography variant="body1" sx={{ fontSize: fontSizeBody }}>Phone: +234 706 851 8999</Typography>
          <Typography variant="body1" sx={{ fontSize: fontSizeBody }}>Address: 123 Healthway Ave, Tech City, Nigeria</Typography>
        </Box>
      </motion.div>
    </Box>
  );
}

export default Contact;

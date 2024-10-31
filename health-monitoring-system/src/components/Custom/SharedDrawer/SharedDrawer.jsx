'use client';
import React from 'react';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { useRouter } from 'next/navigation';

function SharedDrawer({ isOpen, onClose }) {
  const theme = useTheme();
  const xSmall = useMediaQuery(theme.breakpoints.down('xs'));
  const small = useMediaQuery(theme.breakpoints.down('sm'));
  const medium = useMediaQuery(theme.breakpoints.down('md'));
  const large = useMediaQuery(theme.breakpoints.down('lg'));
  const xLarge = useMediaQuery(theme.breakpoints.down('xl'));
  const xxLarge = useMediaQuery(theme.breakpoints.down('xxl'));
  const ultraWide = useMediaQuery(theme.breakpoints.down('xxxxl'));

  const router = useRouter();

  // Function to handle navigation and close drawer
  const handleNavigation = (route) => {
    onClose(); // Close the drawer
    router.push(route); // Navigate to the desired route
  };

  return (
    <Drawer
      anchor="right"
      open={isOpen}
      onClose={onClose}
    >
      <Box
        sx={{
          width: '300px',
          padding: '20px',
          backgroundColor: '#1E1E1E',
          textAlign: 'center',
          height: '100%',
          color: 'white',
        }}
      >
        <Typography variant="h5" sx={{ marginBottom: '30px' }}>
          Role
        </Typography>

        {/* User/Driver Buttons */}
        <Stack spacing={4} direction="column">
          <Button
            variant="contained"
            sx={{
              backgroundColor: '#46F0F9',
              color: '#0E1E1E',
              fontWeight: 'bold',
              borderRadius: xSmall || small ? '0' : '15px',
              padding: '12px 24px',
              "&:hover": {
                backgroundColor: '#34C0D9',
              },
            }}
            onClick={() => handleNavigation('/auth/user')}  // Close drawer and redirect to user login/signup
          >
            User
          </Button>

          <Button
            variant="contained"
            sx={{
              backgroundColor: '#F34F00',
              color: 'white',
              borderRadius: xSmall || small ? '0' : '15px',
              fontWeight: 'bold',
              padding: '12px 24px',
              "&:hover": {
                backgroundColor: '#F14C4C',
              },
            }}
            onClick={() => handleNavigation('/auth/health-worker')}  // Close drawer and redirect to driver login/signup
          >
            Health Worker
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
}

export default SharedDrawer;

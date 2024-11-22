'use client';

import React from 'react';
import { Box, Button, Typography, keyframes } from '@mui/material';
import { useRouter } from 'next/navigation';
import { Home } from '@mui/icons-material';

const lockAnimation = keyframes`
  0% {
    top: -45px;
  }
  65% {
    top: -45px;
  }
  100% {
    top: -30px;
  }
`;

const spinAnimation = keyframes`
  0% {
    transform: scaleX(-1);
    left: calc(50% - 30px);
  }
  65% {
    transform: scaleX(1);
    left: calc(50% - 12.5px);
  }
`;

const dipAnimation = keyframes`
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(10px);
  }
  100% {
    transform: translateY(0px);
  }
`;

function E401() {
    const router = useRouter();
    return (
        <Box
            sx={{
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                background: 'linear-gradient(to bottom right, #EEE, #AAA)',
                textAlign: 'center',
            }}
        >
            {/* Lock Icon */}
            <Box
                sx={{
                    position: 'relative',
                    width: 55,
                    height: 45,
                    backgroundColor: '#333',
                    borderRadius: 1,
                    animation: `${dipAnimation} 1s`,
                    '&::before, &::after': {
                        content: '""',
                        position: 'absolute',
                        borderLeft: '5px solid #333',
                        height: 20,
                        width: 15,
                        left: 'calc(50% - 12.5px)',
                    },
                    '&::before': {
                        top: -30,
                        border: '5px solid #333',
                        borderBottomColor: 'transparent',
                        borderRadius: '15px 15px 0 0',
                        height: 30,
                        animation: `${lockAnimation} 2s, ${spinAnimation} 2s`,
                    },
                    '&::after': {
                        top: -10,
                        borderRight: '5px solid transparent',
                        animation: `${spinAnimation} 2s`,
                    },
                }}
            />
            {/* Message */}
            <Typography
                variant="h4"
                sx={{ marginTop: 4, marginBottom: 2, fontWeight: 'bold' }}
            >
                Access to this page is restricted
            </Typography>
            <Typography variant="body1">
                Please check with the site admin if you believe this is a mistake.
            </Typography>
            <br />
            <Button variant="contained"  color='info' endIcon={<Home/>} onClick={() => router.push('/authorization/users')}>
                Home
            </Button>
        </Box>
    );
}

export default E401;

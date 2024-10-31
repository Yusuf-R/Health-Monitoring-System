'use client';
import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useTheme, keyframes } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useRouter } from 'next/navigation';


// Animation for Health Monitoring System text border
const fluidTextAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// Animation for border effect
const borderAnimation = keyframes`
  0% { border-color: #46F0F9; }
  25% { border-color: #34C0D9; }
  50% { border-color: #F34F00; }
  75% { border-color: #8D3BFF; }
  100% { border-color: #46F0F9; }
`;

// Section component to handle animations
function Section({ children, delay = 0, bgColor = 'rgba(0, 0, 0, 0.7)', textColor = 'white' }) {
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  

  React.useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 1, delay }}
    >
      <Box
        sx={{
          padding: '80px 20px',
          backgroundColor: bgColor,
          color: textColor,
          borderRadius: '10px',
          marginBottom: '60px',
        }}
      >
        {children}
      </Box>
    </motion.div>
  );
}

function About() {
  const theme = useTheme();
  const router = useRouter();

  // Breakpoints as defined
  const xSmall = useMediaQuery(theme.breakpoints.down('xs'));
  const small = useMediaQuery(theme.breakpoints.down('sm'));
  const medium = useMediaQuery(theme.breakpoints.down('md'));
  const large = useMediaQuery(theme.breakpoints.down('lg'));
  const xLarge = useMediaQuery(theme.breakpoints.down('xl'));
  const xxLarge = useMediaQuery(theme.breakpoints.down('xxl'));
  const ultraWide = useMediaQuery(theme.breakpoints.down('xxxxl'));

  // Responsive font sizes
  const fontSizeH1 = xSmall ? '32px' : small ? '48px' : medium ? '60px' : '72px';
  const fontSizeH2 = xSmall ? '24px' : small ? '30px' : medium ? '36px' : '40px';
  const fontSizeBody = xSmall ? '14px' : small ? '16px' : medium ? '18px' : '20px';

  return (
    <Box
      sx={{
        maxWidth: '1200px',
        margin: '0 auto',
        textAlign: 'center',
        padding: '0 20px',
      }}
    >
      {/* Health Monitoring System Animated Section */}
      <Section bgColor="rgba(10, 10, 10, 0.9)" textColor="white">
        <Typography
          variant="h1"
          sx={{
            fontSize: fontSizeH1,
            fontWeight: 'bold',
            backgroundImage: 'linear-gradient(90deg, #ff0000, #00ff00, #0000ff, #ff0000)',
            backgroundSize: '300% 100%',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: `${fluidTextAnimation} 8s ease infinite`,
          }}
        >
          Community Health Monitor
        </Typography>
      </Section>

      {/* About Section */}
      <Section>
        <Typography variant="h2" sx={{ fontWeight: 'bold', marginBottom: '40px', fontSize: fontSizeH2 }}>
          About Community Health Monitor
        </Typography>
        <Typography variant="h6" sx={{ marginBottom: '30px', fontSize: fontSizeBody }}>
          Empowering Communities Through Health Management
        </Typography>
        <Typography variant="body1" sx={{ fontSize: fontSizeBody, marginBottom: '30px' }}>
          The Community Health Monitor is a platform for users to track and report their health, connect with mentors for guidance, and assist health authorities in monitoring community health trends. It aims to create a proactive, supportive environment for better health management.
        </Typography>
      </Section>

      {/* Why Community Health Monitor Section */}
      <Section bgColor="rgba(20, 20, 20, 0.85)">
        <Typography variant="h4" sx={{ fontWeight: 'bold', marginBottom: '30px', fontSize: fontSizeH2 }}>
          Why Choose Community Health Monitor?
        </Typography>
        <Stack spacing={4} sx={{ textAlign: 'left', paddingLeft: '20px', paddingRight: '20px' }}>
          <Typography variant="body1" sx={{ fontSize: fontSizeBody }}>
            <strong>Individual Health Insights</strong>: Get daily health tracking and receive guidance tailored to your personal health trends.
          </Typography>
          <Typography variant="body1" sx={{ fontSize: fontSizeBody }}>
            <strong>Community Health Analysis</strong>: Anonymized health data helps identify trends and manage resources effectively.
          </Typography>
          <Typography variant="body1" sx={{ fontSize: fontSizeBody }}>
            <strong>Mentorship Support</strong>: Mentors provide check-ins, helping users through isolation and connecting them to health resources.
          </Typography>
          <Typography variant="body1" sx={{ fontSize: fontSizeBody }}>
            <strong>Real-Time Alerts</strong>: Receive alerts on potential outbreaks or important health updates in your area.
          </Typography>
        </Stack>
      </Section>

      {/* Grid for Key Features */}
      <Section bgColor="rgba(30, 30, 30, 0.9)">
        <Typography variant="h4" sx={{ fontWeight: 'bold', marginTop: '60px', marginBottom: '40px', fontSize: fontSizeH2 }}>
          Core Features
        </Typography>

        {/* Grid Layout */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: xSmall || small ? '1fr' : medium ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
            gap: '20px',
            justifyContent: 'center',
          }}
        >
          {/* Grid Items (Health Tracking, Alerts, etc.) */}
          {[
            { title: 'Health Tracking', description: 'Track symptoms and daily wellness for better personal health insights.' },
            { title: 'Data Security', description: 'Your data is encrypted and handled with utmost privacy.' },
            { title: 'Mentorship', description: 'Mentors are available to provide guidance during isolation.' },
            { title: 'Real-Time Alerts', description: 'Stay informed about health updates in your area.' },
            { title: 'Community Insights', description: 'Anonymized data helps health authorities make informed decisions.' },
            { title: 'Resource Availability', description: 'View nearby health resources, like vaccination sites or hospitals.' },
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
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 'bold', marginBottom: '10px', fontSize: fontSizeH2 }}>
                {title}
              </Typography>
              <Typography variant="body1" sx={{ fontSize: fontSizeBody }}>
                {description}
              </Typography>
            </Box>
          ))}
        </Box>
      </Section>

      {/* Vision Section */}
      <Section bgColor="rgba(40, 40, 40, 0.95)">
        <Typography variant="h4" sx={{ fontWeight: 'bold', marginTop: '60px', marginBottom: '40px', fontSize: fontSizeH2 }}>
          Our Vision: A Healthier Community
        </Typography>
        <Typography variant="body1" sx={{ fontSize: fontSizeBody, marginBottom: '30px' }}>
          The Community Health Monitor envisions a connected, proactive approach to health management where everyone has access to support and timely health updates.
        </Typography>
      </Section>

      {/* Call to Action Section */}
      <Section bgColor="rgba(50, 50, 50, 1)">
        <Button onClick={()=>router.push('/get-started')}
          variant="contained"
    
          sx={{
            backgroundColor: '#46F0F9',
            color: '#0E1E1E',
            fontWeight: 'bold',
            padding: xSmall || small ? '10px 20px' : '12px 24px',
            fontSize: fontSizeBody,
            "&:hover": {
              backgroundColor: '#34C0D9',
            },
          }}
        
        >
          Explore Health Monitor
        </Button>
      </Section>
    </Box>
  );
}

export default About;

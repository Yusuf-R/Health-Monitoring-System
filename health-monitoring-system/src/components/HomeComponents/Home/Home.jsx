"use client";
import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import { useTheme, keyframes } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import ExploreIcon from "@mui/icons-material/Explore";
import { useRouter } from "next/navigation";
// Animation for border effect
const cardBorderAnimation = keyframes`
  0% { border-color: #46F0F9; }
  25% { border-color: #34C0D9; }
  50% { border-color: #F34F00; }
  75% { border-color: #8D3BFF; }
  100% { border-color: #46F0F9; }
`;

// Button animation
const buttonBorderAnimation = keyframes`
  0% { border-color: #46F0F9; }
  25% { border-color: #34C0D9; }
  50% { border-color: #F34F00; }
  75% { border-color: #8D3BFF; }
  100% { border-color: #46F0F9; }
`;

const Home = () => {
  const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
    const router = useRouter();
  
  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        // background: "linear-gradient(to right, #0f0c29, #302b63, #24243e)",
        color: "white",
        // paddingBottom: "100px",
      }}
    >
      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ textAlign: "center", padding: "80px 0" }}>
        <Typography
          variant="h1"
          sx={{
            fontSize: isSmallScreen ? "36px" : "64px",
            fontWeight: "bold",
            mb: 2,
            backgroundImage: 'linear-gradient(90deg, #ff0000, #00ff00, #0000ff, #ff0000)',
            backgroundSize: '300% 100%',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: `${cardBorderAnimation} 8s ease infinite`,
          }}
        >
          Welcome to Community Health Monitor
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{
            fontSize: isSmallScreen ? "18px" : "24px",
            maxWidth: "800px",
            margin: "0 auto",
            color: "#FFF",
            mb: 4,
          }}
        >
          Empowering individuals and communities with intelligent insights and proactive health support. Track your health, connect with mentors, and stay informed with real-time updates for a healthier tomorrow.
        </Typography>
        <Button
          variant="contained"
          sx={{
            fontSize: "18px",
            padding: "12px 24px",
            mt: 4,
            animation: `${buttonBorderAnimation} 6s linear infinite`,
          }}
          endIcon={<ExploreIcon />}
         onClick={()=>router.push('/get-started')}
        >
          Get Started
        </Button>
      </Container>

      {/* Key Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={4}>
          {[
            {
              title: "Real-Time Health Tracking",
              description: "Your daily health reports are compared against community trends, helping detect and alert users to health risks before they escalate.",
            },
            {
              title: "Community Insights",
              description: "The app provides insights on resource needs — such as vaccines and hospital beds — based on trending health data across communities.",
            },
            {
              title: "Mentorship Programs",
              description: "AI-powered alerts notify mentors when data suggests a potential decline in a user's condition, enabling mentors to provide timely support.",
            },
            {
              title: "Instant Alerts",
              description: "Receive instant notifications on health advisories, outbreaks, and safety tips in your area.",
            },
          ].map((item, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  minHeight: "250px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  textAlign: "center",
                  animation: `${cardBorderAnimation} 4s linear infinite`,
                  padding: "20px",
                }}
              >
                <CardContent>
                  <Typography variant="h5" sx={{ fontWeight: "bold", mb: 1 }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body1" sx={{ color: "#a9a9a9" }}>
                    {item.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Additional Information Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: "bold", mb: 2 }}>
            Why Choose Community Health Monitor?
          </Typography>
          <Typography variant="body1" sx={{ color: "#ccc", maxWidth: "700px", mx: "auto" }}>
            Our platform is designed to put your health at the center. From monitoring tools to community-driven insights, we ensure you have everything you need to stay informed and proactive.
          </Typography>
        </Box>
        <Grid container spacing={4}>
          {[
            {
              title: "Personalized Insights",
              detail: "Gain insights tailored to your health journey, tracking both personal and community health trends.",
            },
            {
              title: "Trusted Data",
              detail: "With anonymized, accurate data, feel confident that you’re making informed decisions for yourself and your family.",
            },
            {
              title: "Proactive Wellness",
              detail: "Alerts and real-time updates help you make choices that keep you healthy and safe.",
            },
          ].map((item, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  textAlign: "center",
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  padding: "20px",
                          minHeight: "200px",
                  color: "#FFF",
                }}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#bbb" }}>
                    {item.detail}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

          {/* Footer Section */}
          {/* Footer */}
      <Box sx={{ py: 6, textAlign: "center", background: "linear-gradient(135deg, #4b6cb7, #182848)" }}>
        <Typography variant="h6" sx={{ color: "#ffeb3b", mb: 2 }}>Community Health Monitoring System</Typography>
        <Typography variant="body2" sx={{ color: "#FFF" }}>© 2024 Health Monitoring System. All rights reserved.</Typography>
        <Typography variant="body2" sx={{ color: "#FFF" }}>Privacy Policy | Terms of Service</Typography>
      </Box>
    </Box>
  );
};

export default Home;

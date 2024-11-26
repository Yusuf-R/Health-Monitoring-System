"use client";
import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import ExploreIcon from "@mui/icons-material/Explore";
import { useRouter } from "next/navigation";

const Home = () => {
  const [isClient, setIsClient] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const theme = useTheme();
  const router = useRouter();

  // Ensure client-side rendering for media queries and animations
  useEffect(() => {
    setIsClient(true);
    setIsSmallScreen(window.innerWidth <= theme.breakpoints.values.sm);
  }, [theme]);

  const keyFeatures = [
    {
      title: "Real-Time Health Tracking",
      description:
        "Your daily health reports are compared against community trends, helping detect and alert users to health risks before they escalate.",
    },
    {
      title: "Community Insights",
      description:
        "The app provides insights on resource needs — such as vaccines and hospital beds — based on trending health data across communities.",
    },
    {
      title: "Mentorship Programs",
      description:
        "AI-powered alerts notify mentors when data suggests a potential decline in a user's condition, enabling mentors to provide timely support.",
    },
    {
      title: "Instant Alerts",
      description:
        "Receive instant notifications on health advisories, outbreaks, and safety tips in your area.",
    },
  ];

  const additionalInfo = [
    {
      title: "Personalized Insights",
      detail:
        "Gain insights tailored to your health journey, tracking both personal and community health trends.",
    },
    {
      title: "Trusted Data",
      detail:
        "With anonymized, accurate data, feel confident that you’re making informed decisions for yourself and your family.",
    },
    {
      title: "Proactive Wellness",
      detail:
        "Alerts and real-time updates help you make choices that keep you healthy and safe.",
    },
  ];

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        color: "white",
      }}
    >
      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ textAlign: "center", padding: "80px 0" }}>
        {isClient && (
          <>
            <Typography
              variant="h1"
              sx={{
                fontSize: isSmallScreen ? "36px" : "64px",
                fontWeight: "bold",
                mb: 2,
                backgroundImage:
                  "linear-gradient(90deg, #ff0000, #00ff00, #0000ff, #ff0000)",
                backgroundSize: "300% 100%",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Welcome to Community Health Monitoring System
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
              Empowering individuals and communities with intelligent insights
              and proactive health support. Track your health, connect with
              mentors, and stay informed with real-time updates for a healthier
              tomorrow.
            </Typography>
            <Button
              variant="contained"
              sx={{
                fontSize: "18px",
                padding: "12px 24px",
                mt: 4,
              }}
              endIcon={<ExploreIcon />}
              onClick={() => router.push("/get-started")}
            >
              Get Started
            </Button>
          </>
        )}
      </Container>

      {/* Key Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={4}>
          {keyFeatures.map((item, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  minHeight: "250px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  textAlign: "center",
                  padding: "20px",
                }}
              >
                <CardContent>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: "bold", mb: 1 }}
                  >
                    {item.title}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ color: "#a9a9a9" }}
                  >
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
          <Typography
            variant="h4"
            sx={{ fontWeight: "bold", mb: 2 }}
          >
            Why Choose Community Health Monitoring System?
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "#ccc",
              maxWidth: "700px",
              mx: "auto",
            }}
          >
            Our platform is designed to put your health at the center. From
            monitoring tools to community-driven insights, we ensure you have
            everything you need to stay informed and proactive.
          </Typography>
        </Box>
        <Grid container spacing={4}>
          {additionalInfo.map((item, index) => (
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
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: "bold", mb: 1 }}
                  >
                    {item.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "#bbb" }}
                  >
                    {item.detail}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Footer Section */}
      <Box
        sx={{
          py: 6,
          textAlign: "center",
          background: "linear-gradient(135deg, #4b6cb7, #182848)",
        }}
      >
        <Typography
          variant="h6"
          sx={{ color: "#ffeb3b", mb: 2 }}
        >
          Community Health Monitoring System
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: "#FFF" }}
        >
          © 2024 Health Monitoring System. All rights reserved.
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: "#FFF" }}
        >
          Privacy Policy | Terms of Service
        </Typography>
      </Box>
    </Box>
  );
};

export default Home;

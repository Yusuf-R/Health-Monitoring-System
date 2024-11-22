"use client";

import React from "react";
import { Box, Typography, Grid, Paper, LinearProgress, Button } from "@mui/material";
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend } from "chart.js";
import { Line } from "react-chartjs-2";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import DirectionsWalkIcon from "@mui/icons-material/DirectionsWalk";
import AccessibilityIcon from "@mui/icons-material/Accessibility";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import LocalDrinkIcon from "@mui/icons-material/LocalDrink";
import AirlineSeatReclineNormalIcon from "@mui/icons-material/AirlineSeatReclineNormal";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend);

// Mock Data
const mockData = {
    lastHealthCheck: "5 days ago",
    weeklySteps: 8000,
    goalSteps: 10000,
    bmi: {
        value: 22.5,
        status: "Healthy",
    },
    tips: [
        "Drink 8 glasses of water daily.",
        "Take short breaks while working to improve posture.",
        "Incorporate 30 minutes of exercise into your daily routine.",
    ],
};

// Chart Data
const activityChartData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
        {
            label: "Steps",
            data: [1200, 1500, 1700, 1800, 1400, 1900, 2000],
            borderColor: "#4CAF50",
            borderWidth: 2,
            pointRadius: 4,
            tension: 0.4,
        },
    ],
};

const chartOptions = {
    responsive: true,
    plugins: {
        legend: {
            display: false,
        },
    },
};

// Health Insights Component
function HealthInsights() {
    return (
        <Box sx={{ py: 4, px: 2 }}>
            <Typography
                variant="h5"
                sx={{
                    textAlign: "center",
                    fontWeight: "bold",
                    mb: 3,
                    color: "#FFF",
                }}
            >
                Personalized Health Insights
            </Typography>
            <Grid container spacing={2}>
                {/* Last Health Check */}
                <Grid item xs={12} md={4}>
                    <Paper
                        elevation={3}
                        sx={{
                            p: 2,
                            background: "linear-gradient(to right, #FF7E5F, #FEB47B)",
                            color: "#FFF",
                            textAlign: "center",
                        }}
                    >
                        <MonitorHeartIcon sx={{ fontSize: 50, mb: 1 }} />
                        <Typography variant="body1" fontWeight="bold">
                            Last Health Check
                        </Typography>
                        <Typography variant="h5">{mockData.lastHealthCheck}</Typography>
                        <Button
                            variant="contained"
                            endIcon={<ArrowForwardIosIcon />}
                            sx={{
                                mt: 2,
                                backgroundColor: "#FFF",
                                color: "#FF7E5F",
                                "&:hover": { backgroundColor: "#FF7E5F", color: "#FFF" },
                            }}
                        >
                            Log Now
                        </Button>
                    </Paper>
                </Grid>

                {/* Weekly Activity Progress */}
                <Grid item xs={12} md={4}>
                    <Paper
                        elevation={3}
                        sx={{
                            p: 2,
                            background: "linear-gradient(to right, #36D1DC, #5B86E5)",
                            color: "#FFF",
                            textAlign: "center",
                        }}
                    >
                        <DirectionsWalkIcon sx={{ fontSize: 50, mb: 1 }} />
                        <Typography variant="body1" fontWeight="bold">
                            Weekly Steps
                        </Typography>
                        <Typography variant="h5">{`${mockData.weeklySteps} / ${mockData.goalSteps}`}</Typography>
                        <Box sx={{ mt: 5 }}>
                            <LinearProgress
                                variant="determinate"
                                value={(mockData.weeklySteps / mockData.goalSteps) * 100}
                                sx={{
                                    height: 10,
                                    borderRadius: 5,
                                    backgroundColor: "#FFF",
                                    "& .MuiLinearProgress-bar": {
                                        backgroundColor: "#36D1DC",
                                    },
                                }}
                            />
                        </Box>
                    </Paper>
                </Grid>

                {/* BMI Info */}
                <Grid item xs={12} md={4}>
                    <Paper
                        elevation={3}
                        sx={{
                            p: 2,
                            background: "linear-gradient(to right, #FF6A88, #FF99AC)",
                            color: "#FFF",
                            textAlign: "center",
                        }}
                    >
                        <AccessibilityIcon sx={{ fontSize: 50, mb: 1 }} />
                        <Typography variant="body1" fontWeight="bold">
                            BMI
                        </Typography>
                        <Typography variant="h5">{`${mockData.bmi.value} (${mockData.bmi.status})`}</Typography>
                        <Button
                            variant="contained"
                            endIcon={<ArrowForwardIosIcon />}
                            sx={{
                                mt: 2,
                                backgroundColor: "#FFF",
                                color: "#FF6A88",
                                "&:hover": { backgroundColor: "#FF6A88", color: "#FFF" },
                            }}
                        >
                            Learn More
                        </Button>
                    </Paper>
                </Grid>
            </Grid>

            {/* Activity Chart */}
            <Box sx={{ mt: 4 }}>
                <Typography
                    variant="h5"
                    sx={{
                        textAlign: "center",
                        fontWeight: "bold",
                        mb: 1,
                        color: "#FFF",
                    }}
                >
                    Weekly Activity Trend
                </Typography>
                <Paper elevation={3} sx={{ p: 2 }}>
                    <Line data={activityChartData} options={chartOptions} />
                </Paper>
            </Box>

            {/* Personalized Tips */}
            <Box sx={{ mt: 4 }}>
                <Typography
                    variant="h5"
                    sx={{
                        textAlign: "center",
                        fontWeight: "bold",
                        mb: 2,
                        color: "#FFF",
                    }}
                >
                    Personalized Tips
                </Typography>
                <Grid container spacing={2}>
                    {mockData.tips.map((tip, index) => {
                        // Dynamically assign an icon based on the tip's content
                        const icons = [
                            <LocalDrinkIcon sx={{ fontSize: 40, color: "#2563eb" }} />, // Example: Water drinking tip
                            <AirlineSeatReclineNormalIcon sx={{ fontSize: 40, color: "#e11d48" }} />, // Short breaks tip
                            <FitnessCenterIcon sx={{ fontSize: 40, color: "#22c55e" }} />, // Exercise tip
                        ];

                        return (
                            <Grid item xs={12} md={4} key={index}>
                                <Paper
                                    elevation={3}
                                    sx={{
                                        p: 2,
                                        background: "linear-gradient(to right, #D9AFD9, #97D9E1)",
                                        textAlign: "center",
                                        color: "#000",
                                        borderRadius: 2,
                                        boxShadow: 5,
                                    }}
                                >
                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            mb: 2,
                                        }}
                                    >
                                        {icons[index % icons.length]}
                                    </Box>
                                    <Typography variant="body1" sx={{ fontWeight: "bold", mb: 1 }}>
                                        {tip.split(".")[0]}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: "#4b5563" }}>
                                        {tip.split(".")[1]?.trim()}
                                    </Typography>
                                </Paper>
                            </Grid>
                        );
                    })}
                </Grid>
            </Box>
        </Box>
    );
}

export default HealthInsights;

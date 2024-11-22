"use client";
import React, { useState } from "react";
import { Box, Typography, Tabs, Tab, Paper } from "@mui/material";
import { Bar } from "react-chartjs-2";
import Chart from "chart.js/auto";
import { CategoryScale } from "chart.js";

Chart.register(CategoryScale);

// Outbreak Data
const outbreakData = {
  "Lassa Fever": {
    description: "Track monthly cases of Lassa Fever in your community.",
    data: [5, 8, 12, 15, 10, 20, 18, 22, 30, 25, 35],
    color: "#FF5733",
  },
  Cholera: {
    description: "Track monthly cases of Cholera in your community.",
    data: [10, 15, 25, 30, 35, 40, 45, 50, 55, 60, 65],
    color: "#33C4FF",
  },
  Tuberculosis: {
    description: "Track monthly cases of Tuberculosis in your community.",
    data: [20, 18, 22, 25, 28, 30, 32, 35, 40, 45, 50],
    color: "#FFC300",
  },
  Ebola: {
    description: "Track monthly cases of Ebola in your community.",
    data: [0, 2, 5, 3, 7, 8, 12, 10, 15, 20, 18],
    color: "#8C33FF",
  },
  "Covid-Flu": {
    description: "Track monthly cases of Covid-Flu in your community.",
    data: [50, 55, 60, 70, 75, 80, 85, 90, 95, 100, 110],
    color: "#33FF57",
  },
  "Monkey Pox": {
    description: "Track monthly cases of Monkey Pox in your community.",
    data: [3, 5, 8, 10, 12, 15, 18, 20, 22, 25, 28],
    color: "#FF33A8",
  },
  Diarrhea: {
    description: "Track monthly cases of Diarrhea in your community.",
    data: [30, 28, 35, 40, 38, 42, 45, 50, 55, 60, 65],
    color: "#33FFDD",
  },
};

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
];

function HealthTrendsInfographic() {
  const [selectedOutbreak, setSelectedOutbreak] = useState("Lassa Fever");

  const handleTabChange = (event, newValue) => {
    setSelectedOutbreak(newValue);
  };

  const selectedData = outbreakData[selectedOutbreak];

  const chartData = {
    labels: months,
    datasets: [
      {
        label: `Monthly Cases of ${selectedOutbreak}`,
        data: selectedData.data,
        backgroundColor: selectedData.color,
        borderColor: selectedData.color,
        borderWidth: 1,
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
    scales: {
      x: {
        title: {
          display: true,
          text: "Months",
        },
      },
      y: {
        title: {
          display: true,
          text: "Reported Cases",
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <Box sx={{ py: 6, px: 3, background: "linear-gradient(to bottom, #f9fafb, #e5e7eb)" }}>
      <Typography
        variant="h5"
        sx={{
          textAlign: "center",
          fontWeight: "bold",
          mb: 4,
          color: "#1f2937",
        }}
      >
        Community Health Trends: Outbreaks Overview
      </Typography>
      <Box sx={{ maxWidth: "900px", margin: "0 auto" }}>
        <Paper elevation={3} sx={{ p: 2 }}>
          <Tabs
            value={selectedOutbreak}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              mb: 4,
              "& .MuiTab-root": { textTransform: "none", fontWeight: "bold", fontSize: 16 },
              "& .Mui-selected": { color: "#1f2937", borderBottom: "2px solid #1f2937" },
            }}
          >
            {Object.keys(outbreakData).map((outbreak) => (
              <Tab key={outbreak} label={outbreak} value={outbreak} />
            ))}
          </Tabs>
          <Typography
            variant="body1"
            sx={{ textAlign: "center", mb: 4, color: "#555", fontStyle: "italic" }}
          >
            {selectedData.description}
          </Typography>
          <Bar data={chartData} options={chartOptions} />
        </Paper>
      </Box>
    </Box>
  );
}

export default HealthTrendsInfographic;

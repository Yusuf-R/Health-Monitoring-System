"use client";

import React from "react";
import { Box, Grid, Card, CardContent, Typography, Button } from "@mui/material";
import HealingIcon from "@mui/icons-material/Healing";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ContactsIcon from "@mui/icons-material/Contacts";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import Chart from "chart.js/auto";

const toolsData = [
  {
    id: 1,
    title: "Symptom Checker",
    description: "Worried about a symptom? Use our checker for guidance.",
    icon: <HealingIcon fontSize="large" />,
    action: () => alert("Symptom Checker launched!"),
  },
  {
    id: 2,
    title: "Find Nearby Clinics",
    description: "Locate clinics or pharmacies near you quickly.",
    icon: <LocationOnIcon fontSize="large" />,
    action: () => alert("Finding nearby clinics..."),
  },
  {
    id: 3,
    title: "Emergency Contacts",
    description: "Save or update your emergency contact info.",
    icon: <ContactsIcon fontSize="large" />,
    action: () => alert("Emergency Contacts page opened!"),
  },
];

function Tools() {
  return (
    <Box sx={{ py: 6, px: 2 }}>
      <Typography
        variant="h5"
        sx={{
          textAlign: "center",
          fontWeight: "bold",
          mb: 4,
          color: "#FFF",
        }}
      >
        Tools and Resources
      </Typography>
      <Grid container spacing={4}>
        {toolsData.map((tool) => (
          <Grid item xs={12} sm={6} md={4} key={tool.id}>
            <Card
              elevation={4}
              sx={{
                p: 3,
                textAlign: "center",
                background: "linear-gradient(to top, #ffffff, #f1f5f9)",
                color: "#1f2937",
                "&:hover": {
                  transform: "scale(1.05)",
                  transition: "transform 0.3s ease",
                },
              }}
            >
              <Box sx={{ mb: 2 }}>{tool.icon}</Box>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                  {tool.title}
                </Typography>
                <Typography variant="body2" sx={{ mb: 3, color: "#4b5563" }}>
                  {tool.description}
                </Typography>
                <Button
                  variant="contained"
                  onClick={tool.action}
                  endIcon={<ArrowForwardIosIcon />}
                  sx={{
                    backgroundColor: "#2563eb",
                    "&:hover": { backgroundColor: "#1e40af" },
                  }}
                >
                  Use Tool
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default Tools;

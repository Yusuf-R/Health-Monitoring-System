"use client";
import React from "react";
import { Box, Grid, Paper, Typography, Button, Divider } from "@mui/material";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";

function CommunityHealthHub() {
  return (
    <Box sx={{ py: 6, px: 3, background: "linear-gradient(to bottom, #ffffff, #f3f4f6)" }}>
      <Typography
        variant="h5"
        sx={{
          textAlign: "center",
          fontWeight: "bold",
          mb: 4,
          color: "#1f2937",
        }}
      >
        Community Health Hub
      </Typography>
      <Grid container spacing={3}>
        {/* Symptom Checker */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, textAlign: "center", borderRadius: 3 }}>
            <HealthAndSafetyIcon sx={{ fontSize: 50, color: "#2563eb" }} />
            <Typography variant="h6" sx={{ fontWeight: "bold", mt: 2, mb: 1 }}>
              Symptom Checker
            </Typography>
            <Typography variant="body1" sx={{ mb: 2, color: "#6b7280" }}>
              Not feeling well? Check your symptoms to know what to do next.
            </Typography>
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#2563eb",
                "&:hover": { backgroundColor: "#1e40af" },
              }}
            >
              Check Symptoms
            </Button>
          </Paper>
        </Grid>

        {/* Find Nearby Clinics */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, textAlign: "center", borderRadius: 3 }}>
            <LocalHospitalIcon sx={{ fontSize: 50, color: "#10b981" }} />
            <Typography variant="h6" sx={{ fontWeight: "bold", mt: 2, mb: 1 }}>
              Find Nearby Clinics
            </Typography>
            <Typography variant="body1" sx={{ mb: 2, color: "#6b7280" }}>
              Locate clinics, hospitals, and pharmacies in your area.
            </Typography>
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#10b981",
                "&:hover": { backgroundColor: "#065f46" },
              }}
            >
              Locate Clinics
            </Button>
          </Paper>
        </Grid>

        {/* Upcoming Events */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, textAlign: "center", borderRadius: 3 }}>
            <EventAvailableIcon sx={{ fontSize: 50, color: "#f97316" }} />
            <Typography variant="h6" sx={{ fontWeight: "bold", mt: 2, mb: 1 }}>
              Upcoming Events
            </Typography>
            <Typography variant="body1" sx={{ mb: 2, color: "#6b7280" }}>
              Join vaccination drives and health workshops near you.
            </Typography>
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#f97316",
                "&:hover": { backgroundColor: "#c2410c" },
              }}
            >
              View Events
            </Button>
          </Paper>
        </Grid>

        {/* Volunteer Opportunities */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, textAlign: "center", borderRadius: 3 }}>
            <VolunteerActivismIcon sx={{ fontSize: 50, color: "#9333ea" }} />
            <Typography variant="h6" sx={{ fontWeight: "bold", mt: 2, mb: 1 }}>
              Volunteer Opportunities
            </Typography>
            <Typography variant="body1" sx={{ mb: 2, color: "#6b7280" }}>
              Join hands to make a difference in your community.
            </Typography>
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#9333ea",
                "&:hover": { backgroundColor: "#6b21a8" },
              }}
            >
              Volunteer Now
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* Divider */}
      <Divider sx={{ my: 6, borderColor: "#e5e7eb" }} />

      {/* Health Resources */}
      <Box sx={{ textAlign: "center" }}>
        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
          Health Resources
        </Typography>
        <Typography variant="body2" sx={{ color: "#6b7280", mb: 4 }}>
          Explore guides, FAQs, and support materials for your health.
        </Typography>
        <Button
          variant="contained"
          sx={{
            backgroundColor: "#4b5563",
            "&:hover": { backgroundColor: "#374151" },
          }}
        >
          Explore Resources
        </Button>
      </Box>
    </Box>
  );
}

export default CommunityHealthHub;

'use client';
import React from "react";
import { Box, Typography, Button } from "@mui/material";

function DFE({ retry }) {
    return (
        <Box
            sx={{
                textAlign: "center",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100vh",
            }}
        >
            <Typography variant="h6" color="error" sx={{ marginBottom: "10px" }}>
                Oops! Something went wrong.
            </Typography>
            <Typography variant="body1" sx={{ marginBottom: "20px" }}>
                We encountered an issue while loading the content. Please try again.
            </Typography>
            <Button
                variant="contained"
                color="primary"
                onClick={retry}
                sx={{
                    padding: "10px 20px",
                    fontSize: "1rem",
                    fontWeight: "bold",
                }}
            >
                Retry
            </Button>
        </Box>
    );
}

export default DFE;

'use client';
import React, { useState } from "react";
import { Container, Stack, Tab, Tabs, useTheme, Grid, Card, CardContent, Typography, Button, alpha } from "@mui/material";
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import AddReactionIcon from '@mui/icons-material/AddReaction';
import SettingsIcon from "@mui/icons-material/Settings";
import { useRouter } from "next/navigation";

// Define category styles
const categoryIcons = {
    "Settings": <SettingsIcon sx={{ color: '#FFcc00AA' }} />,
    "Profile Settings": <ManageAccountsIcon sx={{ color: '#2196f3' }} />,
    "Update Avatar": <AddReactionIcon sx={{ color: '#4caf50' }} />,
};

function Settings() {
    const [selectedType, setSelectedType] = useState("Settings");
    const router = useRouter();
    const theme = useTheme();

    const cardData = [
        {
            title: "Profile Settings",
            description: "Manage your professional information and update account details.",
            icon: <ManageAccountsIcon sx={{ fontSize: 40, color: '#2196f3' }} />,
            route: "/health-worker/settings/profile",
            btnColor: '#2196f3',
        },
        {
            title: "Update Avatar",
            description: "Change your professional profile avatar.",
            icon: <AddReactionIcon sx={{ fontSize: 40, color: '#4caf50' }} />,
            route: "/health-worker/settings/profile/avatar",
            btnColor: '#4caf50',
        },
    ];

    const handleTabChange = (event, newValue) => {
        setSelectedType(newValue);
        const selectedCard = cardData.find((card) => card.title === newValue);
        if (selectedCard) {
            router.push(selectedCard.route);
        }
    };

    return (
        <>
            <Container maxWidth="xl" sx={{ py: 0.5, m: 0 }}>
                {/* Tabs Section */}
                <Stack
                    elevation={3}
                    direction="row"
                    spacing={0}
                    sx={{
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderRadius: 2,
                        mb: 3,
                    }}
                >
                    <Tabs
                        value={selectedType}
                        onChange={handleTabChange}
                        variant="scrollable"
                        scrollButtons="auto"
                        sx={{
                            '& .MuiTabs-indicator': {
                                backgroundColor: '#46F0F9',
                            },
                            '& .MuiTab-root': {
                                minHeight: 60,
                                textTransform: 'none',
                                fontSize: '1rem',
                                fontWeight: 500,
                                color: "#FFF",
                                '&.Mui-selected': {
                                    color: '#46F0F9'
                                }
                            }
                        }}
                    >
                        {Object.keys(categoryIcons).map((category) => (
                            <Tab
                                key={category}
                                label={category.toUpperCase()}
                                value={category}
                                icon={categoryIcons[category]}
                                iconPosition="start"
                                sx={{
                                    fontSize: '0.9rem',
                                    fontWeight: 500
                                }}
                            />
                        ))}
                    </Tabs>
                </Stack>

                {/* Cards Section */}
                <Grid container spacing={3}>
                    {cardData.map((card, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                            <Card
                                elevation={3}
                                sx={{
                                    bgcolor: theme.palette.mode === 'dark' ? alpha('#004e92', 0.9) : alpha('#004e92', 0.8),
                                    borderRadius: 3,
                                    transition: 'transform 0.2s',
                                    boxShadow: '0px 4px 10px rgba(0,0,0,0.1)',
                                    textAlign: 'center',
                                    padding: 3,
                                    '&:hover': {
                                        transform: 'translateY(-4px)'
                                    }
                                }}
                            >
                                {card.icon}
                                <CardContent sx={{ color: '#FFF' }}>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                                        {card.title}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#FFF', mb: 2 }}>
                                        {card.description}
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        onClick={() => router.push(card.route)}
                                        sx={{
                                            backgroundColor: card.btnColor,
                                            '&:hover': {
                                                backgroundColor: alpha(card.btnColor, 0.8),
                                            },
                                        }}
                                    >
                                        {card.title}
                                    </Button>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </>
    );
}

export default Settings;

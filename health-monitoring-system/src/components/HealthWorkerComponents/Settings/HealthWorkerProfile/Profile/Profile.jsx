'use client'
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useMediaQuery } from '@mui/material';
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Link from "next/link";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid2";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Badge from '@mui/material/Badge';
import Card from '@mui/material/Card';
import Avatar from '@mui/material/Avatar';
import Button from "@mui/material/Button";

import Chip from "@mui/material/Chip";

// Define displayable fields and their display names
const PROFILE_FIELDS = [
    { key: 'firstName', label: 'First Name' },
    { key: 'lastName', label: 'Last Name' },
    { key: 'middleName', label: 'Middle Name' },
    { key: 'email', label: 'Email' },
    { key: 'phoneNumber', label: 'Phone Number' },
    { key: 'maritalStatus', label: 'Marital Status' },
    { key: 'country', label: 'Country' },
    { key: 'address', label: 'Address' },
    { key: 'stateOfOrigin', label: 'State of Origin' },
    { key: 'stateOfResidence', label: 'State of Residence' },
    { key: 'lga', label: 'LGA' },
    { key: 'currlga', label: 'Current LGA' },
    { key: 'role', label: 'Role' },
    { key: 'profileStatus', label: 'Profile Status' },
    { key: 'specialization', label: 'Specialization' },
    { key: 'licenseNumber', label: 'License Number' },
    { key: 'yearsOfExperience', label: 'Years of Experience' },
    { key: 'hospitalAffiliation', label: 'Hospital Affiliation' }
];

// Helper function to format field value
const formatFieldValue = (value) => {
    if (value === null || value === undefined) return 'Not Set';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return value;
};

const getBadgeStyles = (status) => {
    switch (status) {
        case 'Active':
            return {
                backgroundColor: 'success.main',
                color: 'white',
            };
        case 'Suspended':
            return {
                backgroundColor: 'error.main',
                color: 'black',
            };
        case 'Terminated':
            return {
                backgroundColor: 'error.main',
                color: 'white',
            };
        case 'Deceased':
            return {
                backgroundColor: 'error.main',
                color: 'white',
            };
        case 'Pending':
            return {
                backgroundColor: 'secondary.main',
                color: 'white',
            };
        default:
            return {
                backgroundColor: 'default',
                color: 'white',
            };
    }
};

const renderComplexField = (key, value) => (
    <Grid size={{ xs: 12, sm: 12, md: 12, lg: 6 }}>
        <Card
            sx={{
                background: 'linear-gradient(to right, #3a6186, #89253e)',
                padding: '16px',
                borderRadius: '10px',
            }}
        >
            <Typography
                variant="subtitle2"
                sx={{ color: '#46F0F9', fontSize: '14px', mb: 1 }}
            >
                {key.replace(/([A-Z])/g, ' $1')} {/* Format camelCase keys */}
            </Typography>
            <Box
                sx={{
                    color: '#FFF',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    whiteSpace: 'pre-wrap', // Preserve array or object formatting
                }}
            >
                {Array.isArray(value)
                    ? value.length
                        ? value.map((item, index) => (
                            <Typography
                                key={index}
                                sx={{ color: '#FFF', mb: 1 }}
                            >
                                • {item}
                            </Typography>
                        ))
                        : 'Empty List'
                    : JSON.stringify(value, null, 2)}
            </Box>
        </Card>
    </Grid>
);

// Helper function to check if the value is complex (object or array)
const isComplexValue = (value) => {
    return typeof value === "object" && value !== null;
};

function Profile({ healthWorkerProfile }) {
    const router = useRouter();
    const pathname = usePathname();
    const [activeTab, setActiveTab] = useState('/health-worker/settings/profile');

    // Break Points
    const xSmall = useMediaQuery('(min-width:300px) and (max-width:389.999px)');
    const small = useMediaQuery('(min-width:390px) and (max-width:480.999px)');
    const medium = useMediaQuery('(min-width:481px) and (max-width:599.999px)');
    const large = useMediaQuery('(min-width:600px) and (max-width:899.999px)');
    const xLarge = useMediaQuery('(min-width:900px) and (max-width:1199.999px)');
    const isLargeScreen = useMediaQuery('(min-width:900px)');

    useEffect(() => {
        if (pathname.includes('update')) {
            setActiveTab('/health-worker/settings/profile/update');
        } else if (pathname.includes('view')) {
            setActiveTab('/health-worker/settings/profile/view');
        } else {
            setActiveTab('/health-worker/settings/profile');
        }
    }, [pathname]);

    const handleUpdate = () => {
        router.push('/health-worker/settings/profile/update');
    };

    return (
        <>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    flexWrap: 'nowrap',
                    backgroundColor: "#1F2937",
                    width: '100%',
                    p: 0.5,
                }}
            >
                {/* Navigation Tabs */}
                <Stack direction='row' spacing={2} sx={{
                    justifyContent: 'flex-start',
                }}>
                    <Tabs
                        value={activeTab}
                        onChange={(e, newValue) => setActiveTab(newValue)}
                        centered
                        sx={{
                            '& .MuiTabs-indicator': {
                                backgroundColor: '#46F0F9',
                            },
                        }}
                    >
                        <Tab
                            label="Profile"
                            component={Link}
                            href="/health-worker/settings/profile"
                            value="/health-worker/settings/profile"

                            sx={{
                                color: "#FFF",
                                fontWeight: 'bold',
                                fontSize: xSmall || small || medium || large ? '0.6rem' : '0.9rem',
                                "&.Mui-selected": {
                                    color: "#46F0F9",
                                },
                            }}
                        />
                        <Tab
                            label="Edit-Biodata"
                            onClick={handleUpdate}
                            href="/health-worker/settings/profile/update"
                            value="/health-worker/settings/profile/update"
                            sx={{
                                color: "#FFF",
                                fontWeight: 'bold',
                                fontSize: xSmall || small || medium || large ? '0.6rem' : '0.9rem',
                                "&.Mui-selected": {
                                    color: "#46F0F9",
                                },
                            }}
                        />
                        <Tab
                            label="Avatar"
                            component={Link}
                            href="/health-worker/settings/profile/avatar"
                            value="/health-worker/settings/profile/avatar"
                            sx={{
                                color: "#FFF",
                                fontWeight: 'bold',
                                fontSize: xSmall || small || medium || large ? '0.6rem' : '0.9rem',
                                "&.Mui-selected": {
                                    color: "#46F0F9",
                                },
                            }}
                        />
                        <Tab
                            label="Location"
                            component={Link}
                            href="/health-worker/settings/profile/location"
                            value="/health-worker/settings/profile/location"
                            sx={{
                                color: "#FFF",
                                fontWeight: 'bold',
                                fontSize: xSmall || small || medium || large ? '0.6rem' : '0.9rem',
                                "&.Mui-selected": {
                                    color: "#46F0F9",
                                },
                            }}
                        />
                    </Tabs>
                </Stack>
                <br />
                {/*ParentBox*/}
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: isLargeScreen ? 'row' : 'column',
                        justifyContent: 'space-between',
                        alignItems: isLargeScreen ? 'flex-start' : 'flex-start',  // Align to top for both screens
                        flexWrap: 'nowrap',  // Ensure LHS and RHS remain side by side
                        height: isLargeScreen ? 'auto' : 'auto',
                        padding: isLargeScreen ? '0' : '10px',
                    }}
                >
                    {/* LHS */}
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'flex-start',
                            alignItems: 'center',
                            p: '1px',
                            width: isLargeScreen ? '25%' : '100%',
                            maxWidth: isLargeScreen ? '30%' : '100%',
                            height: isLargeScreen ? '100vh' : 'auto',  // LHS should fill the viewport height on large screens
                        }}
                    >
                        {/* Content for the left side */}
                        <Stack
                            direction='column'
                            spacing={3}
                            sx={{
                                width: '100%',
                                justifyContent: 'center',
                                alignItems: 'center',
                                height: 'auto',
                            }}
                        >
                            {healthWorkerProfile.avatar !== "" ? (
                                <Avatar
                                    src={healthWorkerProfile.avatar ? healthWorkerProfile.avatar : '/av-1.svg'}
                                    alt={healthWorkerProfile.email}
                                    sx={{
                                        width: xSmall || small || medium ? 100 : large ? 150 : xLarge ? 200 : 250,
                                        height: xSmall || small || medium ? 100 : large ? 150 : xLarge ? 200 : 250,
                                        color: '#FFF',
                                    }}

                                />
                            ) : (
                                <Avatar
                                    src={healthWorkerProfile.gender === 'Male' ? '/Avatar-9.svg' : '/Avatar-10.svg'}
                                    alt={healthWorkerProfile.email}
                                    sx={{
                                        width: xSmall || small || medium ? 150 : large ? 200 : xLarge ? 250 : 300,
                                        height: xSmall || small || medium ? 150 : large ? 200 : xLarge ? 250 : 300,
                                        color: '#FFF',
                                    }}
                                />
                            )}
                            <Badge
                                sx={{
                                    '& .MuiBadge-badge': getBadgeStyles(healthWorkerProfile.status)
                                }}
                                overlap="circular"
                                badgeContent={healthWorkerProfile.status}
                            />
                            <Stack spacing={0.5}
                                   alignItems="center"> {/* Add a smaller spacing between text elements */}
                                <Typography
                                    variant="body1"
                                    sx={{
                                        color: '#46F0F9',
                                        fontSize: xSmall || small || medium || large ? '1.0rem' : '1.1rem',
                                    }}
                                >
                                    {healthWorkerProfile.fullName}
                                </Typography>
                            </Stack>
                            <Button variant="contained" color='info' onClick={handleUpdate} sx={{
                                borderRadius: '10px',
                                mt: 1,
                            }}>
                                <Typography variant="body1"
                                            sx={{
                                                color: 'FFF',
                                                fontSize: xSmall ? '0.8rem' : small ? '1.0rem' : '1.0rem',
                                                fontWeight: 'bold'
                                            }}>
                                    Update Avatar
                                </Typography>
                            </Button>
                        </Stack>
                    </Box>
                    <br />
                    {/*RHS*/}
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            padding: '10px',
                            width: isLargeScreen ? '60%' : '100%',
                            maxWidth: isLargeScreen ? '80%' : '100%',
                            height: 'auto',  // RHS should fill the viewport height on large screens
                        }}
                    >
                        <Grid container spacing={4}>
                            {/* Section 1: Personal Information */}
                            <Grid size={12}>
                                <Card sx={{
                                    background: 'linear-gradient(to right, #000046, #1cb5e0)',
                                    padding: '16px',
                                    borderRadius: '10px'
                                }}>
                                    <Typography variant="body1"
                                                sx={{
                                                    color: '#FFF',
                                                    fontSize: xSmall ? '0.8rem' : small ? '1.0rem' : '1.2rem',
                                                    fontWeight: 'bold',
                                                    textAlign: 'center'
                                                }}>
                                        Information Summary
                                    </Typography>
                                </Card>
                            </Grid>

                            {/* Dynamic Field Rendering */}
                            {PROFILE_FIELDS.map(({ key, label }) => {
                                const value = healthWorkerProfile[key];
                                if (isComplexValue(value)) return null; // Skip complex objects

                                return (
                                    <Grid key={key} size={{ xs: 12, sm: 12, md: 12, lg: 6 }}>
                                        <Card sx={{
                                            background: 'linear-gradient(to right, #1d4350, #a43931)',
                                            padding: '16px',
                                            borderRadius: '10px'
                                        }}>
                                            <Typography variant="subtitle2"
                                                        sx={{ color: '#46F0F9', fontSize: '14px', mb: 1 }}>
                                                {label}
                                            </Typography>
                                            <Typography variant="body1"
                                                        sx={{
                                                            color: '#FFF',
                                                            fontSize: xSmall ? '0.8rem' : small ? '1.0rem' : '1.2rem',
                                                            fontWeight: 'bold'
                                                        }}>
                                                {formatFieldValue(value)}
                                            </Typography>
                                        </Card>
                                    </Grid>
                                );
                            })}

                            {/* Render complex fields separately */}
                            {healthWorkerProfile.emergencyContacts && renderComplexField('Emergency Contacts', healthWorkerProfile.emergencyContacts)}
                            {healthWorkerProfile.wellnessCheckHistory && renderComplexField('Wellness Check History', healthWorkerProfile.wellnessCheckHistory)}
                            {healthWorkerProfile.healthRecords && renderComplexField('Health Records', healthWorkerProfile.healthRecords)}
                        </Grid>
                    </Box>
                    <br />
                </Box>
            </Box>
        </>
    )
}

export default Profile;
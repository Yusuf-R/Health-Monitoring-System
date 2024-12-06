'use client';
import {useEffect, useState} from 'react';
import {usePathname, useRouter} from 'next/navigation';
import {useMediaQuery} from '@mui/material';
import {toast} from "sonner";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Link from "next/link";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid2";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Card from '@mui/material/Card';
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import AddLocation from '@mui/icons-material/AddLocation';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import Edit from '@mui/icons-material/Edit';
import Delete from '@mui/icons-material/Delete';
import CircularProgress from '@mui/material/CircularProgress';
import {useMutation, useQueryClient} from "@tanstack/react-query";
import AdminUtils from "@/utils/AdminUtils";
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import LazyComponent from '@/components/LazyComponent/LazyComponent';
import useLocationStore from '@/store/useLocationStore';

// Function to randomize colors for the map icon
const randomColor = () => {
    const colors = ['primary', 'secondary', 'error', 'warning', 'info'];
    return colors[Math.floor(Math.random() * colors.length)];
};

function ViewLocation({userProfile}) {
    const router = useRouter();
    const pathname = usePathname();
    const [loading, setLoading] = useState(false);

    const [activeTab, setActiveTab] = useState('/user/settings/profile/location');

    const [isDeleting, setIsDeleting] = useState(false);

    const queryClient = useQueryClient();
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
    const [selectedAddressId, setSelectedAddressId] = useState(null);

    // Break Points
    const xSmall = useMediaQuery('(min-width:300px) and (max-width:389.999px)');
    const small = useMediaQuery('(min-width:390px) and (max-width:480.999px)');
    const medium = useMediaQuery('(min-width:481px) and (max-width:599.999px)');
    const large = useMediaQuery('(min-width:600px) and (max-width:899.999px)');
    const xLarge = useMediaQuery('(min-width:900px) and (max-width:1199.999px)');
    const isLargeScreen = useMediaQuery('(min-width:900px)');

    useEffect(() => {
        if (pathname.includes('/location/set')) {
            setActiveTab('/user/settings/profile/location/set');
        } else if (pathname.includes('view')) {
            setActiveTab('/user/settings/profile/location/view');
        } else {
            setActiveTab('/user/settings/profile/location');
        }
    }, [pathname]);

    const mutationDelete = useMutation({
        mutationKey: ["deleteLocation"],
        mutationFn: AdminUtils.deleteUserLocation
    });

    const setLocation = async () => {
        router.push(`/user/settings/profile/location/set`);
    };

    const onEdit = (objId) => {
        useLocationStore.getState().setGeoId(objId);
        router.push('/user/settings/profile/location/edit');
    };

    // Handler for opening confirmation dialog
    const handleDeleteClick = (addressId) => {
        setSelectedAddressId(addressId);
        setOpenConfirmDialog(true);
    };

    const confirmDelete = () => {
        setOpenConfirmDialog(false);
        setIsDeleting(true);
        if (!selectedAddressId) {
            setIsDeleting(false);
            toast.error('No location selected');
            setOpenConfirmDialog(false);
            return;
        }
        mutationDelete.mutate(selectedAddressId, {
            onSuccess: () => {
                toast.success("Location deleted successfully!");
                queryClient.invalidateQueries({queryKey: ["UserData"]});
                router.refresh();
                setIsDeleting(false);
            },
            onError: (error) => {
                toast.error("Error deleting location. Please try again.");
                setIsDeleting(false);
                console.error("Error saving location:", error);
            },
        });
    };
    // Handler for canceling deletion
    const cancelDelete = () => {
        setOpenConfirmDialog(false);
        setSelectedAddressId(null);
    };

    const handleAdd = async () => {
        setLoading(true);
        router.push('/user/settings/profile/location/set');
        setLoading(false);
    };


    if (userProfile.geoLocation?.length === 0 || !userProfile.geoLocation) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    flexWrap: 'nowrap',
                    width: '100%',
                    p: 0.5,
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%',
                    color: 'white',
                    padding: '10px',
                    borderRadius: '5px',
                    margin: '20px',
                }}
            >
                <Typography variant="h5">No address has been set-up yet.</Typography>
                <br/>
                <Button
                    variant="contained"
                    onClick={() => {
                        setLoading(true); // Set loading to true
                        router.push('/user/settings/profile/location/set'); // Navigate to route
                    }}
                    color="primary"
                    size="large"
                    disabled={loading} // Disable button when loading
                    sx={{
                        backgroundColor: loading ? '#FF7E5F' : '#1976d2',
                        color: 'white',
                        ':hover': {
                            backgroundColor: '#FF7E5F',
                            color: 'white',
                        },
                        ':disabled': {
                            backgroundColor: '#FF7E5F',
                            color: '#FFF',
                            cursor: 'not-allowed',
                            opacity: 0.8, // Make it look disabled but still visible
                        },
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                    endIcon={loading && <CircularProgress sx={{fontSize: '20px'}}/> }
                >
                    'Click to setup one'
                </Button>
            </Box>
        );
    }

    return (
        <>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    flexWrap: 'nowrap',
                    minHeight: '100vh',
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
                            label="Location"
                            component={Link}
                            href="/user/settings/profile/location"
                            value="/user/settings/profile/location"

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
                            label="View-Location"
                            href="/user/settings/profile/location/view"
                            value="/user/settings/profile/location/view"
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
                            label="Set-Location"
                            component={Link}
                            onClick={setLocation}
                            href="/user/settings/profile/location/set"
                            value="/user/settings/profile/location/set"
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
                <br/>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'stretch',
                        padding: '10px',
                        width: '100%',
                        flexGrow: 0,
                    }}
                >
                    <Grid container spacing={4}>
                        {userProfile.geoLocation.map((address, index) => (
                            <Grid key={address._id || index} size={{xs: 12, sm: 12, md: 6, lg: 4}}>
                                <Card variant="outlined" sx={{
                                    padding: 2,
                                    position: 'relative',
                                    background: 'linear-gradient(to right, #0575e6, #021b79)'
                                }}>
                                    <Box sx={{display: 'flex', alignItems: 'center', marginBottom: 1}}>
                                        <LocationOnIcon color={randomColor()} sx={{fontSize: 40, marginRight: 1}}/>
                                        <Box>
                                            <Typography variant="subtitle1" fontWeight="bold" sx={{
                                                color: '#FFF',
                                                fontSize: xSmall ? '0.8rem' : small ? '1.0rem' : '1.2rem',
                                                fontWeight: 'bold'
                                            }}>
                                                {address?.category || 'Uncategorized'}
                                            </Typography>
                                            <Typography variant="body2" sx={{
                                                color: '#FFF',
                                                fontSize: xSmall ? '0.8rem' : small ? '1.0rem' : '1.2rem',
                                                fontWeight: 'bold'
                                            }}>
                                                Lat: {address?.latitude.toFixed(5)} |
                                                Long: {address?.longitude.toFixed(5)}
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary" sx={{
                                                color: '#FFF',
                                                fontSize: xSmall ? '0.8rem' : small ? '1.0rem' : '1.2rem',
                                                fontWeight: 'bold'
                                            }}>
                                                {address?.description || 'Description: Not Available'}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <br/>
                                    <Typography variant="body2" color="textSecondary" sx={{
                                        color: '#FFF',
                                        fontSize: xSmall ? '0.8rem' : small ? '1.0rem' : '1.2rem',
                                        fontWeight: 'bold'
                                    }}>
                                        {address?.locationName || 'Location Name: Not Available'}
                                    </Typography>
                                    <Box sx={{position: 'absolute', top: 8, right: 8}}>
                                        <Tooltip title="Edit">
                                            <IconButton onClick={() => onEdit(address._id)} sx={{color: '#FFF'}}>
                                                <Edit/>
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete">
                                            <IconButton onClick={() => handleDeleteClick(address._id)}
                                                        sx={{color: 'yellow'}}>
                                                <Delete/>
                                            </IconButton>
                                        </Tooltip>

                                    </Box>
                                </Card>

                            </Grid>
                        ))}
                        <Grid  size={{xs: 12, sm: 12, md: 12, lg: 12}}>
                            <Card variant="outlined" sx={{
                                padding: 2,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '100%',
                                background: 'inherit',
                            }}>
                                <IconButton
                                    onClick={handleAdd}
                                    color="primary"
                                    disabled={loading} // Disable while loading
                                    sx={{flexDirection: 'column', position: 'relative'}}
                                >
                                    {loading ? (
                                        <CircularProgress sx={{fontSize: 50, color: 'green'}}/>
                                    ) : (
                                        <AddLocation sx={{fontSize: 50, color: 'green'}}/>
                                    )}
                                    <Typography variant="subtitle1" sx={{
                                        color: '#FFF',
                                        fontSize: xSmall ? '0.8rem' : small ? '1.0rem' : '1.2rem',
                                        fontWeight: 'bold'
                                    }}>
                                        {loading ? 'Processing...' : 'Add New Location'}
                                    </Typography>
                                </IconButton>
                            </Card>
                        </Grid>
                    </Grid>
                    {/* Confirmation Dialog */}
                    <Dialog open={openConfirmDialog} onClose={cancelDelete}>
                        <DialogTitle>Are you sure you want to delete this location?</DialogTitle>
                        <DialogActions>
                            <Button onClick={cancelDelete} color="error" variant='contained'>No</Button>
                            <Button onClick={confirmDelete} color="success" variant='contained' autoFocus>
                                Yes
                            </Button>
                        </DialogActions>
                    </Dialog>

                    {/* Lazy Component */}
                    {isDeleting && <LazyComponent Command="Deleting location"/>}
                </Box>
            </Box>
        </>
    )
}

export default ViewLocation;
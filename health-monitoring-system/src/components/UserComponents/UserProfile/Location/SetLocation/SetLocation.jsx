'use client';
import {useEffect, useRef, useState} from "react";
import {Autocomplete, GoogleMap, LoadScriptNext, Marker,} from "@react-google-maps/api";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Grid from "@mui/material/Grid2";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import Modal from "@mui/material/Modal";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import DashboardIcon from "@mui/icons-material/Dashboard";
import NearMeIcon from '@mui/icons-material/NearMe';
import {toast} from "sonner";
import {useRouter} from "next/navigation";
import {useTheme} from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import {setLocationValidator} from "@/validators/locationValidator";
import AdminUtils from "@/utils/AdminUtils";
import {Controller, useForm} from "react-hook-form";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {zodResolver} from "@hookform/resolvers/zod";
import {googleMapsLibraries} from "@/server/googleMaps/googleMapsConfig";
import {CircularProgress} from "@mui/material";


const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const locationCategories = ["Home", "School", "Office", "MarketPlace", "Mosque", "Church", "Hospital", "Hotel", "SuperMarket", "Others"];

const mapContainerStyle = {
    flexGrow: 1,
    width: "100%",
};

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    borderRadius: '10px',
};

function SetLocation({userProfile}) {
    const [isLoading, setIsLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [summaryData, setSummaryData] = useState(null);
    const {control, handleSubmit, setValue, formState: {errors}} = useForm({
        mode: "onTouched",
        resolver: zodResolver(setLocationValidator),
        reValidateMode: "onChange",
    });
    const router = useRouter();

    const queryClient = useQueryClient();

    const initialLocation = userProfile.geoLocation?.[0]
        ? {lat: userProfile.geoLocation[0].latitude, lng: userProfile.geoLocation[0].longitude}
        : {lat: 6.5244, lng: 3.3792};

    const [currentLocation, setCurrentLocation] = useState(initialLocation);
    const [locationCoords, setLocationCoords] = useState(null);
    const [savedLocations, setSavedLocations] = useState(userProfile.geoLocation || []);
    const [isLocationFieldEnabled, setIsLocationFieldEnabled] = useState(false);

    const [clickedCoords, setClickedCoords] = useState(null);
    const [manualLocationData, setManualLocationData] = useState(null);
    const [manualModalOpen, setManualModalOpen] = useState(false);

    const mapRef = useRef(null);
    const locationRef = useRef(null);

    const theme = useTheme();
    const xs = useMediaQuery(theme.breakpoints.down("xs"));
    const sm = useMediaQuery(theme.breakpoints.down("sm"));

    const mutationUpdate = useMutation({
        mutationKey: ["setClientLocation"],
        mutationFn: AdminUtils.setUserLocation,
    });

    useEffect(() => {
        if (currentLocation && mapRef.current) {
            mapRef.current.panTo(currentLocation);
        }
    }, [currentLocation]);

    const handleMapClick = async (event) => {
        const latitude = event.latLng.lat();
        const longitude = event.latLng.lng();

        setClickedCoords({latitude, longitude});

        // Use reverse geocoding to get address
        try {
            const geocoder = new window.google.maps.Geocoder();
            const response = await geocoder.geocode({
                location: {lat: latitude, lng: longitude},
            });

            if (response.results && response.results[0]) {
                const address = response.results[0].formatted_address;
                toast.success("Location details fetched!");
                setManualLocationData({
                    latitude,
                    longitude,
                    address,
                });
            } else {
                toast.warning("Could not fetch location details. Please set manually.");
                setManualLocationData({
                    latitude,
                    longitude,
                    address: "",
                });
            }

            setManualModalOpen(true);
        } catch (error) {
            console.error("Error in reverse geocoding:", error);
            toast.error("Error fetching location details. Please set manually.");
            setManualLocationData({
                latitude,
                longitude,
                address: "",
            });
            setManualModalOpen(true);
        }
    };


    const handlePlaceChanged = () => {
        const place = locationRef.current.getPlace();
        if (place.geometry) {
            const location = place.geometry.location;
            const latitude = location.lat();
            const longitude = location.lng();

            // Validate latitude and longitude
            if (typeof latitude === "number" && typeof longitude === "number") {
                const coords = {latitude, longitude};
                setLocationCoords(coords); // Update local state
                setValue("locationCoords", coords); // Update form state
                setValue("locationName", place.formatted_address); // Update location name
                mapRef.current?.panTo({lat: latitude, lng: longitude}); // Re-center map
                mapRef.current?.setZoom(14); // Set zoom level
                toast.success("Location set successfully!");
            } else {
                toast.error("Invalid coordinates received. Please try again.");
            }
        } else {
            toast.error("Location details not available. Please select a valid location.");
        }
    };

    const handleCategoryChange = (value) => {
        setValue("category", value);
        setIsLocationFieldEnabled(!!value);
    };

    const handleSetLocation = (objData) => {
        if (!locationCoords || !locationCoords.latitude || !locationCoords.longitude) {
            toast.error("Please select a valid location from the suggestions.");
            return;
        }

        setSummaryData({
            ...objData,
            locationCoords,
        });
        setOpenModal(true);
    };

    const handleSubmitLocation = (newLocation) => {
        setIsLoading(true);

        const {success, data} = setLocationValidator.safeParse(newLocation);
        if (!success) {
            toast.error("Please fill in all required fields.");
            setIsLoading(false);
            return;
        }

        mutationUpdate.mutate(data, {
            onSuccess: (response) => {
                setSavedLocations(response.geoLocation);
                setIsLocationFieldEnabled(false);
                setValue("category", "");
                setValue("locationName", "");
                setValue("description", "");
                setValue("locationCoords", null);
                toast.success("Location saved successfully!");
                setIsLoading(false);
                queryClient.invalidateQueries({ queryKey: ["UserData"] });
                router.push('/user/profile/location/view');
                setOpenModal(false);
            },
            onError: (error) => {
                toast.error("Error saving location. Please try again.");
                setIsLoading(false);
                console.error("Error saving location:", error);
            },
        });
    };

    return (
        <LoadScriptNext googleMapsApiKey={googleMapsApiKey} libraries={googleMapsLibraries}>
            <Box sx={{height: "100vh", display: "flex", flexDirection: "column"}}>
                <Box
                    component={"form"}
                    onSubmit={handleSubmit(handleSetLocation)}
                    noValidate
                    autoComplete="off"
                    sx={{
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                        padding: "8px 16px",
                        display: "flex",
                        alignItems: "center",
                        boxShadow: 2,
                        zIndex: 1000,
                    }}
                >
                    <Grid container spacing={2} columns={12} sx={{width: "100%", alignItems: "center"}}>
                        <Grid size={12}>
                            <Card sx={{
                                background: 'linear-gradient(to right, #000046, #1cb5e0)',
                                padding: '16px',
                                borderRadius: '10px',
                            }}>
                                <Typography variant="body1"
                                            sx={{
                                                color: '#FFF',
                                                fontSize: xs ? '0.8rem' : sm ? '1.0rem' : '1.2rem',
                                                fontWeight: 'bold',
                                                textAlign: 'center'
                                            }}>
                                    Set and Save your Location
                                </Typography>
                            </Card>
                        </Grid>

                        <Grid size={{xs: 12, sm: 12, md: 12, lg: 2}}>
                            <Controller
                                name="category"
                                control={control}
                                defaultValue=""
                                render={({field}) => (
                                    <TextField
                                        {...field}
                                        select
                                        label="Location Category"
                                        fullWidth
                                        value={field.value || ""}
                                        onChange={(e) => handleCategoryChange(e.target.value)}
                                        error={!!errors.category}
                                        helperText={errors.category ? errors.category.message : ""}
                                    >
                                        {locationCategories.map((cat) => (
                                            <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                                        ))}
                                    </TextField>
                                )}
                            />
                        </Grid>

                        <Grid size={{xs: 12, sm: 12, md: 12, lg: 3.5}}>
                            <Controller
                                name="locationName"
                                control={control}
                                render={({field}) => (
                                    <Autocomplete
                                        onLoad={(autocomplete) => (locationRef.current = autocomplete)}
                                        onPlaceChanged={handlePlaceChanged}
                                    >
                                        <TextField
                                            {...field}
                                            label="Location"
                                            variant="outlined"
                                            size="small"
                                            fullWidth
                                            value={field.value || ""}
                                            error={!!errors.locationName}
                                            helperText={errors.locationName ? errors.locationName.message : ""}
                                            disabled={!isLocationFieldEnabled}
                                        />
                                    </Autocomplete>
                                )}
                            />
                        </Grid>

                        <Grid size={{xs: 12, sm: 12, md: 12, lg: 3.5}}>
                            <Controller
                                name="description"
                                control={control}
                                render={({field}) => (
                                    <TextField
                                        {...field}
                                        value={field.value || ""}
                                        label="Description (Optional)"
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                    />
                                )}
                            />
                        </Grid>

                        <Grid size={{xs: 12, sm: 12, md: 12, lg: 1.5}}>
                            <Button
                                variant="contained"
                                color="primary"
                                endIcon={isLoading ? <CircularProgress size={20}/> : <LocationOnIcon/>}
                                type="submit"
                                fullWidth
                                disabled={isLoading}
                            >
                                {isLoading ? 'Saving...' : 'Save Location'}
                            </Button>
                        </Grid>
                    </Grid>
                </Box>

                {/* Map Section */}
                <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={currentLocation}
                    zoom={12}
                    onLoad={(map) => (mapRef.current = map)}
                    onClick={handleMapClick} // Handle single click
                >
                    {/* Initial Pin at Center */}
                    {currentLocation && (
                        <Marker
                            position={currentLocation}
                            icon={{
                                url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
                            }}
                        />
                    )}
                    {/* Dynamic Pin for Selected Location */}
                    {locationCoords?.latitude && locationCoords?.longitude && (
                        <Marker
                            position={{
                                lat: locationCoords.latitude,
                                lng: locationCoords.longitude
                            }} // Ensure valid format
                            icon={{
                                url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
                            }}
                        />
                    )}
                </GoogleMap>

                {/* Confirmation Modal */}
                <Modal
                    open={openModal}
                    onClose={() => setOpenModal(false)}
                    aria-labelledby="location-summary-modal"
                    aria-describedby="location-summary-description"
                >
                    <Box sx={{
                        ...modalStyle,
                        bgcolor: "background.paper",
                        p: 4,
                        boxShadow: 24,
                        borderRadius: 3,
                        width: "95%",
                        maxWidth: 800,
                    }}>
                        {/* Modal Header */}
                        <Typography
                            id="location-summary-modal"
                            variant="h5"
                            sx={{textAlign: "center", mb: 3, fontWeight: "bold", color: "primary.main"}}
                        >
                            CONFIRM LOCATION DETAILS
                        </Typography>

                        {/* Modal Content */}
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 2,
                                alignItems: "flex-start",
                                justifyContent: "center",
                            }}
                        >
                            {summaryData && (
                                <>
                                    {/* Category */}
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1,
                                            p: 2,
                                            bgcolor: "rgba(63, 81, 181, 0.1)",
                                            borderRadius: "8px",
                                            width: "100%",
                                        }}
                                    >
                                        <DashboardIcon sx={{color: "primary.main"}}/>
                                        <Typography
                                            variant="subtitle2"
                                            sx={{fontWeight: "bold", color: "primary.main", flexGrow: 1}}
                                        >
                                            Category:
                                        </Typography>
                                        <Typography variant="body1" sx={{fontWeight: "bold", color: "text.primary"}}>
                                            {summaryData.category}
                                        </Typography>
                                    </Box>

                                    {/* Location */}
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1,
                                            p: 2,
                                            bgcolor: "rgba(76, 175, 80, 0.1)",
                                            borderRadius: "8px",
                                            width: "100%",
                                        }}
                                    >
                                        <NearMeIcon sx={{color: "success.main"}}/>

                                        <Typography
                                            variant="subtitle2"
                                            sx={{fontWeight: "bold", color: "success.main", flexGrow: 1}}
                                        >
                                            Address:
                                        </Typography>
                                        <Typography variant="body1" sx={{fontWeight: "bold", color: "text.primary"}}>
                                            {summaryData.locationName}
                                        </Typography>
                                    </Box>

                                    {/* Coordinates */}
                                    <Box
                                        sx={{
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: 1,
                                            p: 2,
                                            bgcolor: "rgba(255, 193, 7, 0.1)",
                                            borderRadius: "8px",
                                            width: "100%",
                                        }}
                                    >
                                        <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
                                            <LocationOnIcon sx={{color: "warning.main"}}/>
                                            <Typography
                                                variant="subtitle2"
                                                sx={{fontWeight: "bold", color: "info.main", flexGrow: 1}}
                                            >
                                                Latitude:
                                            </Typography>
                                            <Typography variant="body1"
                                                        sx={{fontWeight: "bold", color: "text.primary"}}>
                                                {summaryData.locationCoords.latitude.toFixed(6)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: 1,
                                            p: 2,
                                            bgcolor: "rgba(255, 193, 7, 0.1)",
                                            borderRadius: "8px",
                                            width: "100%",
                                        }}
                                    >
                                        <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
                                            <LocationOnIcon sx={{color: "warning.main"}}/>
                                            <Typography
                                                variant="subtitle2"
                                                sx={{fontWeight: "bold", color: "info.main", flexGrow: 1}}
                                            >
                                                Longitude:
                                            </Typography>
                                            <Typography variant="body1"
                                                        sx={{fontWeight: "bold", color: "text.primary"}}>
                                                {summaryData.locationCoords.longitude.toFixed(6)}
                                            </Typography>
                                        </Box>

                                    </Box>
                                </>
                            )}
                        </Box>

                        {/* Modal Actions */}
                        <Box
                            mt={4}
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                gap: 2,
                            }}
                        >
                            <Button
                                variant="outlined"
                                color="error"
                                onClick={() => setOpenModal(false)}
                                sx={{
                                    flex: 1,
                                    textTransform: "none",
                                    fontWeight: "bold",
                                    borderRadius: "8px",
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                endIcon={isLoading ?<CircularProgress size={20} sx={{color: 'gold'}} /> : <LocationOnIcon />}
                                disabled={isLoading}
                                onClick={() =>
                                    handleSubmitLocation({
                                        ...summaryData,
                                        locationCoords,
                                    })
                                }
                                sx={{
                                    flex: 1,
                                    textTransform: "none",
                                    fontWeight: "bold",
                                    borderRadius: "8px",
                                    ':disabled': {
                                        backgroundColor: '#FF7E5F',
                                        color: '#FFF',
                                        cursor: 'not-allowed',
                                        opacity: 0.8, // Make it look disabled but still visible
                                    },
                                }}
                            >
                                Confirm
                            </Button>
                        </Box>
                    </Box>
                </Modal>

                {/* Manual Location Modal */}
                <Modal
                    open={manualModalOpen}
                    onClose={() => setManualModalOpen(false)}
                    aria-labelledby="manual-location-modal"
                    aria-describedby="manual-location-description"
                >
                    <Box
                        sx={{
                            ...modalStyle,
                            bgcolor: "background.paper",
                            p: 4,
                            boxShadow: 24,
                            borderRadius: 3,
                            width: "95%",
                            maxWidth: 800,
                        }}
                    >
                        {/* Modal Header */}
                        <Typography
                            id="manual-location-modal"
                            variant="h5"
                            sx={{textAlign: "center", mb: 3, fontWeight: "bold", color: "primary.main"}}
                        >
                            CONFIRM LOCATION DETAILS
                        </Typography>

                        {/* Modal Content */}
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 3,
                                alignItems: "flex-start",
                                justifyContent: "center",
                            }}
                        >
                            {manualLocationData && (
                                <>
                                    {/* Latitude */}
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1,
                                            p: 2,
                                            bgcolor: "rgba(255, 193, 7, 0.1)",
                                            borderRadius: "8px",
                                            width: "100%",
                                        }}
                                    >
                                        <LocationOnIcon sx={{color: "warning.main"}}/>
                                        <Typography
                                            variant="subtitle2"
                                            sx={{fontWeight: "bold", color: "warning.main", flexGrow: 1}}
                                        >
                                            Latitude:
                                        </Typography>
                                        <Typography variant="body1" sx={{fontWeight: "bold", color: "text.primary"}}>
                                            {manualLocationData.latitude.toFixed(6)}
                                        </Typography>
                                    </Box>

                                    {/* Longitude */}
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1,
                                            p: 2,
                                            bgcolor: "rgba(255, 193, 7, 0.1)",
                                            borderRadius: "8px",
                                            width: "100%",
                                        }}
                                    >
                                        <LocationOnIcon sx={{color: "warning.main"}}/>
                                        <Typography
                                            variant="subtitle2"
                                            sx={{fontWeight: "bold", color: "warning.main", flexGrow: 1}}
                                        >
                                            Longitude:
                                        </Typography>
                                        <Typography variant="body1" sx={{fontWeight: "bold", color: "text.primary"}}>
                                            {manualLocationData.longitude.toFixed(6)}
                                        </Typography>
                                    </Box>

                                    {/* Address */}
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1,
                                            p: 2,
                                            bgcolor: "rgba(76, 175, 80, 0.1)",
                                            borderRadius: "8px",
                                            width: "100%",
                                        }}
                                    >
                                        <NearMeIcon sx={{color: "success.main"}}/>
                                        <Typography
                                            variant="subtitle2"
                                            sx={{fontWeight: "bold", color: "success.main", flexGrow: 1}}
                                        >
                                            Address:
                                        </Typography>
                                        <TextField
                                            label="Address (Optional)"
                                            variant="outlined"
                                            fullWidth
                                            value={manualLocationData.address}
                                            onChange={(e) =>
                                                setManualLocationData({
                                                    ...manualLocationData,
                                                    address: e.target.value,
                                                })
                                            }
                                        />
                                    </Box>

                                    {/* Category Selection */}
                                    <Box
                                        sx={{
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: 2,
                                            p: 2,
                                            bgcolor: "rgba(63, 81, 181, 0.1)",
                                            borderRadius: "8px",
                                            width: "100%",
                                        }}
                                    >
                                        <Typography
                                            variant="subtitle2"
                                            sx={{fontWeight: "bold", color: "primary.main"}}
                                        >
                                            Category:
                                        </Typography>
                                        <TextField
                                            select
                                            label="Select Category"
                                            value={manualLocationData.category || ""}
                                            onChange={(e) =>
                                                setManualLocationData({
                                                    ...manualLocationData,
                                                    category: e.target.value,
                                                })
                                            }
                                            fullWidth
                                            variant="outlined"
                                        >
                                            {locationCategories.map((category) => (
                                                <MenuItem key={category} value={category}>
                                                    {category}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                        <br/>
                                        <TextField
                                            value={manualLocationData.description || ""}
                                            label="Description (Optional)"
                                            variant="outlined"
                                            size="small"
                                            fullWidth
                                            onChange={(e) =>
                                                setManualLocationData({
                                                    ...manualLocationData,
                                                    description: e.target.value, // Update the description field
                                                })
                                            }
                                        />
                                    </Box>
                                </>
                            )}
                        </Box>

                        {/* Modal Actions */}
                        <Box
                            mt={4}
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                gap: 2,
                            }}
                        >
                            <Button
                                variant="outlined"
                                color="error"
                                onClick={() => setManualModalOpen(false)}
                                sx={{
                                    flex: 1,
                                    textTransform: "none",
                                    fontWeight: "bold",
                                    borderRadius: "8px",
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() =>
                                    handleSubmitLocation({
                                        category: manualLocationData.category,
                                        locationName: manualLocationData.address,
                                        description: manualLocationData.description,
                                        locationCoords: {
                                            latitude: manualLocationData.latitude,
                                            longitude: manualLocationData.longitude,
                                        },
                                    })
                                }
                                endIcon={isLoading ?<CircularProgress size={20} sx={{color: 'gold'}} /> : <LocationOnIcon />}
                                disabled={isLoading}
                                sx={{
                                    flex: 1,
                                    textTransform: "none",
                                    fontWeight: "bold",
                                    borderRadius: "8px",
                                    ':disabled': {
                                        backgroundColor: '#FF7E5F',
                                        color: '#FFF',
                                        cursor: 'not-allowed',
                                        opacity: 0.8, // Make it look disabled but still visible
                                    },
                                }}
                            >
                                Save Location
                            </Button>
                        </Box>
                    </Box>
                </Modal>

            </Box>
        </LoadScriptNext>
    );
}

export default SetLocation;

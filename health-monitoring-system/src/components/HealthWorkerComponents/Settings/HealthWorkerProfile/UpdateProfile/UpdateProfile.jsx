'use client'
import {useEffect, useState} from 'react';
import {usePathname, useRouter} from 'next/navigation';
import {CircularProgress, useMediaQuery} from '@mui/material';
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Link from "next/link";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid2";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Card from '@mui/material/Card';
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import {Controller, useForm} from "react-hook-form";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {zodResolver} from "@hookform/resolvers/zod";
import {feHealthWorkerProfileUpdateValidator} from "@/validators/feProfileUpdateValidator";
import {FormControl} from "@mui/material/";
import MenuItem from "@mui/material/MenuItem";
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {DatePicker} from "@mui/x-date-pickers/DatePicker";
import {toast} from 'sonner';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import FormHelperText from '@mui/material/FormHelperText';
import dayjs from "dayjs";
import {
    Countries,
    dobProps,
    experienceLevels,
    maritalStatus,
    nextOfKinRelationship,
    sex,
    specializations,
    statesAndLGAs,
    txProps,
} from "@/utils/data"
import AdminUtils from '@/utils/AdminUtils';


function UpdateProfile({healthWorkerProfile}) {

    const [activeTab, setActiveTab] = useState('/health-worker/settings/profile/update');
    const pathname = usePathname();
    const router = useRouter();
    const [dobDate, setDobDate] = useState(null);
    const [updating, setUpdating] = useState(false);
    const [stateOfOrigin, setStateOfOrigin] = useState('');
    const [currStateResidence, setCurrStateResidence] = useState("");
    const [specialization, setSpecialization] = useState('');
    const [yearsOfExperience, setYearsOfExperience] = useState('');

    // Break Points
    const xSmall = useMediaQuery('(min-width:300px) and (max-width:389.999px)');
    const small = useMediaQuery('(min-width:390px) and (max-width:480.999px)');
    const medium = useMediaQuery('(min-width:481px) and (max-width:599.999px)');
    const large = useMediaQuery('(min-width:600px) and (max-width:899.999px)');
    const xLarge = useMediaQuery('(min-width:900px) and (max-width:1199.999px)');
    const isLargeScreen = useMediaQuery('(min-width:900px)');
    // state variables

    const isSmallScreen = useMediaQuery('(max-width:599.999px)');

    const {control, handleSubmit, setValue, formState: {errors}, reset, getValues} = useForm({
        mode: "onTouched",
        resolver: zodResolver(feHealthWorkerProfileUpdateValidator),
        reValidateMode: "onChange",
        defaultValues: {
            dob: '',
        }
    });

    useEffect(() => {
        if (healthWorkerProfile) {
            // Preload form fields with data from healthWorkerProfile
            setValue("firstName", healthWorkerProfile.firstName || "");
            setValue("lastName", healthWorkerProfile.lastName || "");
            setValue("middleName", healthWorkerProfile.middleName || "");
            setValue("email", healthWorkerProfile.email || "");
            setValue("phoneNumber", healthWorkerProfile.phoneNumber || "");
            setValue("maritalStatus", healthWorkerProfile.maritalStatus || "");
            setValue("nextOfKin", healthWorkerProfile.nextOfKin || '');
            setValue("nextOfKinRelationship", healthWorkerProfile.nextOfKinRelationship || '');
            setValue("nextOfKinPhone", healthWorkerProfile.nextOfKinPhone || '');
            setValue("country", healthWorkerProfile.country || "");
            setValue("gender", healthWorkerProfile.gender || "");
            setValue("dob", healthWorkerProfile.dob || "");
            setValue("address", healthWorkerProfile.address || "");
            setValue("stateOfOrigin", healthWorkerProfile.stateOfOrigin || "");
            setValue("stateOfResidence", healthWorkerProfile.stateOfResidence || "");
            setValue("lga", healthWorkerProfile.lga || "");
            setValue("specialization", healthWorkerProfile.specialization || "");
            setValue("licenseNumber", healthWorkerProfile.licenseNumber || "");
            setValue("experienceLevel", healthWorkerProfile.experienceLevel || "");
            setValue("hospitalAffiliation", healthWorkerProfile.hospitalAffiliation || "");
        }
    }, [healthWorkerProfile, setValue]);

    useEffect(() => {
        const dobValue = getValues("dob");
        if (dobValue) {
            setDobDate(dayjs(dobValue, "DD/MMM/YYYY"));
        }
    }, []);

    const phoneInputStyle = {
        '& .PhoneInput': {
            bgcolor: '#274e61',
            borderRadius: '10px',
            border: errors.phoneNumber ? '1px solid #ff4444' : errors.nextOfKinNumber ? '1px solid #ff4444' : '1px solid transparent',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
                bgcolor: '#2c5468',
            },
            '&:focus-within': {
                bgcolor: '#2c5468',
                boxShadow: '0 0 0 2px rgba(70, 240, 249, 0.3)',
            },
        },
        '& .PhoneInputInput': {
            bgcolor: '#051935',
            border: 'none',
            color: 'white',
            p: '8px 12px',
            fontSize: '16px',
            outline: 'none',
            width: '100%',
            height: '45px',
            '&::placeholder': {
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '14px',
            },
            '&:focus': {
                outline: 'none',
                border: 'none',
            },
        },
        '& .PhoneInputCountry': {
            mr: '10px',
            p: '5px',
            display: 'flex',
            alignItems: 'center',
            borderRight: '1px solid rgba(255, 255, 255, 0.1)',
        },
        '& .PhoneInputCountryFlag': {
            width: '28px',
            height: '22px',
            mr: '8px',
        },
        '& .PhoneInputCountrySelect': {
            color: 'white',
            bgcolor: 'transparent',
            border: 'none',
            fontSize: '16px',
            cursor: 'pointer',
            '&:focus': {
                outline: 'none',
            },
            '& option': {
                bgcolor: '#274e61',
                color: 'white',
            },
        },
        '& .PhoneInputCountrySelectArrow': {
            color: 'gold',
            opacity: 0.7,
            borderWidth: '2px',
            ml: '8px',
        },
    }

    const mutation = useMutation({
        mutationKey: ["updateHealthWorkerProfile"],
        mutationFn: AdminUtils.updateHealthWorkerProfile,
    });

    const queryClient = useQueryClient();

    const updateData = async (objData) => {
        try {
            setUpdating(true);
            const {success, data} = feHealthWorkerProfileUpdateValidator.safeParse(objData);
            if (!success) {
                setUpdating(false);
                toast.error('Please fill all the required fields');
                return;
            }
            mutation.mutate(data, {
                onSuccess: () => {
                    toast.success('Profile updated successfully');
                    queryClient.invalidateQueries(['HealthWorkerData']);
                    setUpdating(false);
                    router.refresh();
                    router.push('/health-worker/settings/profile');
                },
                onError: (error) => {
                    console.error('An unexpected error happened:', error);
                    toast.error('An error occurred while updating profile');
                    setUpdating(false);
                }
            })
        } catch (error) {
            setUpdating(false);
            toast.error('An error occurred while updating profile');
            console.error('An unexpected error happened:', error);
        }
    }

    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            toast.error("Please fill all the required fields");
            console.log({errors})
            setUpdating(false);  // Ensure this is only called once per error change
        }
    }, [errors]);

    // next of Kin
    const getNextOfKinOptions = () => {
        return nextOfKinRelationship.map((type) => (
            <MenuItem key={type} value={type}
                      sx={{color: 'white', '&:hover': {backgroundColor: '#051935'}}}>{type}</MenuItem>
        ));
    }
    const handleNextOfKinChange = (event) => {
        // prevent default action of submitting the form
        event.preventDefault();
        setValue('nextOfKinRelationship', event.target.value);
    }

    // Gender Type
    const getGenderType = () => {
        return sex.map((type) => (
            <MenuItem key={type} value={type}
                      sx={{color: 'white', '&:hover': {backgroundColor: '#051935'}}}>{type}</MenuItem>
        ));
    };
    const handleGenderTypeChange = (event) => {
        event.preventDefault();
        setValue('gender', event.target.value);
    }

    // Marital Status
    const getMaritalStatusType = () => {
        return maritalStatus.map((type) => (
            <MenuItem key={type} value={type}
                      sx={{color: 'white', '&:hover': {backgroundColor: '#051935'}}}>{type}</MenuItem>
        ));
    };
    const handleMaritalStatusType = (event) => {
        event.preventDefault();
        setValue('maritalStatus', event.target.value);
    }

    // Country
    const getCountryType = () => {
        return Countries.map((type) => (
            <MenuItem key={type} value={type}
                      sx={{color: 'white', '&:hover': {backgroundColor: '#051935'}}}>{type}</MenuItem>
        ));
    };
    const handleCountryChange = (event) => {
        // prevent default action of submitting the form
        event.preventDefault();
        setValue('country', event.target.value);
    }

    // // State of Origin
    const getStateOfOriginOptions = () => {
        return Object.keys(statesAndLGAs).map((stateName) => (
            <MenuItem key={stateName} value={stateName}
                      sx={{color: 'white', '&:hover': {backgroundColor: '#051935'}}}>
                {stateName}
            </MenuItem>
        ));
    };
    const handleStateOfOriginChange = (event) => {
        // prevent default action of submitting the form
        event.preventDefault();
        setValue('stateOfOrigin', event.target.value)
        setStateOfOrigin(event.target.value)
        setValue('lga', '');
    };

    // LGA
    const getLGAOptions = () => {
        if (!stateOfOrigin) {
            return [];
        }
        return statesAndLGAs[stateOfOrigin].map((lgaName) => (
            <MenuItem key={lgaName} value={lgaName}
                      sx={{color: 'white', '&:hover': {backgroundColor: '#051935'}}}> {lgaName} </MenuItem>
        ));
    };
    const handleLGAChange = (event) => {
        // prevent default action of submitting the form
        event.preventDefault();
        setValue('lga', event.target.value)
    };

    // // State of Residence
    const getStateOfResidence = () => {
        return Object.keys(statesAndLGAs).map((stateName) => (
            <MenuItem key={stateName} value={stateName}
                      sx={{color: 'white', '&:hover': {backgroundColor: '#051935'}}}>
                {stateName}
            </MenuItem>
        ));
    };

    const handleStateOfResidence = (event) => {
        event.preventDefault();
        setCurrStateResidence(event.target.value)
        setValue('stateOfResidence', event.target.value);
    }

    // currLGA
    const getCurrLGAOptions = () => {
        if (!currStateResidence) {
            return [];
        }
        return statesAndLGAs[currStateResidence].map((lgaName) => (
            <MenuItem key={lgaName} value={lgaName}
                      sx={{color: 'white', '&:hover': {backgroundColor: '#051935'}}}> {lgaName} </MenuItem>
        ));
    };
    const handleCurrLGAChange = (event) => {
        // prevent default action of submitting the form
        event.preventDefault();
        setValue('currlga', event.target.value)
    };

    useEffect(() => {
        if (pathname.includes('update')) {
            setActiveTab('/health-worker/settings/profile/update');
        } else if (pathname.includes('avatar')) {
            setActiveTab('/health-worker/settings/profile/avatar');
        } else if (pathname.includes('location')) {
            setActiveTab('/health-worker/location');
        } else {
            setActiveTab('/health-worker/settings/profile');
        }
    }, [pathname]);

    useEffect(() => {
        const dobValue = getValues("dob");
        if (dobValue) {
            setDobDate(dayjs(dobValue, "DD/MMM/YYYY"));
        }
    }, []);

    useEffect(() => {
            if (healthWorkerProfile.stateOfOrigin && healthWorkerProfile.lga) {
                setStateOfOrigin(healthWorkerProfile.stateOfOrigin);
                setValue('stateOfOrigin', healthWorkerProfile.stateOfOrigin);
                setValue('lga', healthWorkerProfile.lga);
            }
            if (healthWorkerProfile.stateOfResidence && healthWorkerProfile.currlga) {
                setCurrStateResidence(healthWorkerProfile.stateOfResidence);
                setValue('stateOfResidence', healthWorkerProfile.stateOfResidence);
                setValue('currlga', healthWorkerProfile.currlga);
            }
        }, [healthWorkerProfile, setValue]
    );

    const handleExperienceLevelChange = (event) => {
        // prevent default action of submitting the form
        event.preventDefault();
        setValue('experienceLevels', event.target.value);
    }


    const handleSpecializationChange = (event) => {
        event.preventDefault();
        setValue('specialization', event.target.value);

    }

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
                    overflow: isSmallScreen ? 'auto' : 'visible',

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
                    </Tabs>
                </Stack>
                <br/>
                <Box
                    component="form"
                    onSubmit={handleSubmit(updateData)}
                    noValidate
                    autoComplete="off"
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        flexWrap: 'nowrap',
                        backgroundColor: "#1F2937",
                        minHeight: '100vh',
                        p: 0.5,
                        overflow: isSmallScreen ? 'auto' : 'visible',
                    }}
                >
                    <Grid container spacing={4}>
                        <Grid size={12}>
                            <Card sx={{
                                background: 'linear-gradient(to right, #000046, #1cb5e0)',
                                padding: '16px',
                                borderRadius: '10px'
                            }}>
                                <Typography variant="body1" sx={{
                                    color: '#FFF',
                                    fontWeight: 'bold',
                                    textAlign: 'center'
                                }}>
                                    Update BioData
                                </Typography>
                            </Card>
                        </Grid>
                        <Grid size={{xs: 12, sm: 12, md: 12, lg: 4}}>
                            <Card sx={{
                                background: 'linear-gradient(to right, #1d4350, #a43931)',
                                padding: '16px',
                                borderRadius: '10px'
                            }}>
                                <Typography variant="subtitle2"
                                            sx={{
                                                color: '#46F0F9',
                                                fontSize: '14px',
                                                mb: 1
                                            }}>
                                    FirstName
                                </Typography>
                                <FormControl fullWidth>
                                    <Controller
                                        name="firstName"
                                        control={control}
                                        render={({field}) => (
                                            <TextField
                                                {...field}
                                                variant="outlined"
                                                error={errors.fullName ? true : false}
                                                helperText={errors.fullName ? errors.fullName.message : ''}
                                                value={field.value || ''}
                                                slotProps={{
                                                    input: {
                                                        sx: txProps,
                                                    },
                                                    inputLabel: {
                                                        sx: {
                                                            color: "#FFF",
                                                            "&.Mui-focused": {
                                                                color: "white"
                                                            },
                                                        }
                                                    }
                                                }}
                                                sx={{
                                                    color: "#46F0F9",
                                                }}
                                            />
                                        )}
                                    />
                                </FormControl>
                            </Card>
                        </Grid>
                        <Grid size={{xs: 12, sm: 12, md: 12, lg: 4}}>
                            <Card sx={{
                                background: 'linear-gradient(to right, #1d4350, #a43931)',
                                padding: '16px',
                                borderRadius: '10px'
                            }}>
                                <Typography variant="subtitle2"
                                            sx={{
                                                color: '#46F0F9',
                                                fontSize: '14px',
                                                mb: 1
                                            }}>
                                    MiddleName
                                </Typography>
                                <FormControl fullWidth>
                                    <Controller
                                        name="middleName"
                                        control={control}
                                        render={({field}) => (
                                            <TextField
                                                {...field}
                                                variant="outlined"
                                                error={errors.middleName ? true : false}
                                                helperText={errors.middleName ? errors.middleName.message : ''}
                                                value={field.value || ''}
                                                slotProps={{
                                                    input: {
                                                        sx: txProps,
                                                    },
                                                    inputLabel: {
                                                        sx: {
                                                            color: "#FFF",
                                                            "&.Mui-focused": {
                                                                color: "white"
                                                            },
                                                        }
                                                    }
                                                }}
                                                sx={{
                                                    color: "#46F0F9",
                                                }}
                                            />
                                        )}
                                    />
                                </FormControl>
                            </Card>
                        </Grid>
                        <Grid size={{xs: 12, sm: 12, md: 12, lg: 4}}>
                            <Card sx={{
                                background: 'linear-gradient(to right, #1d4350, #a43931)',
                                padding: '16px',
                                borderRadius: '10px'
                            }}>
                                <Typography variant="subtitle2"
                                            sx={{
                                                color: '#46F0F9',
                                                fontSize: '14px',
                                                mb: 1
                                            }}>
                                    LastName
                                </Typography>
                                <FormControl fullWidth>
                                    <Controller
                                        name="lastName"
                                        control={control}
                                        render={({field}) => (
                                            <TextField
                                                {...field}
                                                variant="outlined"
                                                error={errors.lastName ? true : false}
                                                helperText={errors.lastName ? errors.lastName.message : ''}
                                                value={field.value || ''}
                                                slotProps={{
                                                    input: {
                                                        sx: txProps,
                                                    },
                                                    inputLabel: {
                                                        sx: {
                                                            color: "#FFF",
                                                            "&.Mui-focused": {
                                                                color: "white"
                                                            },
                                                        }
                                                    }
                                                }}
                                                sx={{
                                                    color: "#46F0F9",
                                                }}
                                            />
                                        )}
                                    />
                                </FormControl>
                            </Card>
                        </Grid>
                        <Grid size={{xs: 12, sm: 12, md: 12, lg: 4}}>
                            <Card sx={{
                                background: 'linear-gradient(to right, #1d4350, #a43931)',
                                padding: '16px',
                                borderRadius: '10px'
                            }}>
                                <Typography variant="subtitle2"
                                            sx={{
                                                color: '#46F0F9',
                                                fontSize: '14px',
                                                mb: 1
                                            }}>
                                    Email
                                </Typography>
                                <FormControl fullWidth>
                                    <Controller
                                        name="email"
                                        control={control}
                                        render={({field}) => (
                                            <TextField
                                                {...field}
                                                variant="outlined"
                                                error={errors.email ? true : false}
                                                helperText={errors.email ? errors.email.message : ''}
                                                value={field.value || ''}
                                                slotProps={{
                                                    input: {
                                                        sx: txProps,
                                                        readOnly: true
                                                    },
                                                    inputLabel: {
                                                        sx: {
                                                            color: "#FFF",
                                                            "&.Mui-focused": {
                                                                color: "white"
                                                            },
                                                        }
                                                    }
                                                }}
                                                sx={{
                                                    color: "#46F0F9",
                                                }}
                                            />
                                        )}
                                    />
                                </FormControl>
                            </Card>
                        </Grid>
                        <Grid size={{xs: 12, sm: 12, md: 12, lg: 4}}>
                            <Card
                                sx={{
                                    background: 'linear-gradient(145deg, #1d4350, #a43931)',
                                    padding: '20px',
                                    borderRadius: '12px',
                                    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.25)',
                                }}
                            >
                                <Typography
                                    variant="subtitle2"
                                    sx={{
                                        color: '#46F0F9',
                                        fontSize: '15px',
                                        fontWeight: 'bold',
                                        mb: 1,
                                    }}
                                >
                                    Phone Number
                                </Typography>
                                <FormControl fullWidth>
                                    <Controller
                                        name="phoneNumber"
                                        control={control}
                                        render={({field}) => (
                                            <Box sx={phoneInputStyle}>
                                                <PhoneInput
                                                    {...field}
                                                    international
                                                    defaultCountry="NG"
                                                    countryCallingCodeEditable={false}
                                                    value={field.value || ''}
                                                    onChange={(value) => {
                                                        field.onChange(value);
                                                        setValue('phoneNumber', value);
                                                    }}
                                                />
                                            </Box>
                                        )}
                                    />
                                    {errors.phoneNumber && (
                                        <FormHelperText
                                            sx={{
                                                color: '#ff4444',
                                                marginTop: 1,
                                                fontSize: '12px',
                                                fontWeight: '500',
                                            }}
                                        >
                                            {errors.phoneNumber.message}
                                        </FormHelperText>
                                    )}
                                </FormControl>
                            </Card>
                        </Grid>
                        <Grid size={{xs: 12, sm: 12, md: 12, lg: 4}}>
                            <Card sx={{
                                background: 'linear-gradient(to right, #1d4350, #a43931)',
                                padding: '16px',
                                borderRadius: '10px'
                            }}>
                                <Typography variant="subtitle2"
                                            sx={{
                                                color: '#46F0F9',
                                                fontSize: '14px',
                                                mb: 1
                                            }}>
                                    Gender
                                </Typography>
                                <FormControl fullWidth>
                                    <Controller
                                        name="gender"
                                        control={control}
                                        render={({field}) => (
                                            <TextField
                                                {...field}
                                                select
                                                value={field.value || ''}
                                                onChange={(e) => {
                                                    field.onChange(e);
                                                    handleGenderTypeChange(e);
                                                }}
                                                required
                                                error={!!errors.gender}
                                                helperText={errors.gender ? errors.gender.message : ''}
                                                slotProps={{
                                                    input: {
                                                        sx: txProps,
                                                    },
                                                    inputLabel: {
                                                        sx: {
                                                            color: "#FFF",
                                                            "&.Mui-focused": {
                                                                color: "white"
                                                            },
                                                        }
                                                    },
                                                    select: {
                                                        MenuProps: {
                                                            PaperProps: {
                                                                sx: {
                                                                    backgroundColor: '#134357',
                                                                    color: 'white',
                                                                    maxHeight: 450,
                                                                    overflow: 'auto',
                                                                },
                                                            },
                                                        },

                                                    }
                                                }}
                                                sx={{
                                                    '& .MuiSelect-icon': {
                                                        color: '#fff',
                                                    },
                                                    '& .MuiSelect-icon:hover': {
                                                        color: '#fff',
                                                    },
                                                }}>
                                                <MenuItem value="" sx={{color: "#4BF807"}}>
                                                    Select Gender
                                                </MenuItem>
                                                {getGenderType()}
                                            </TextField>

                                        )}
                                    />
                                </FormControl>
                            </Card>
                        </Grid>
                        <Grid size={{xs: 12, sm: 12, md: 12, lg: 4}}>
                            <Card sx={{
                                background: 'linear-gradient(to right, #1d4350, #a43931)',
                                padding: '16px',
                                borderRadius: '10px'
                            }}>
                                <Typography variant="subtitle2"
                                            sx={{
                                                color: '#46F0F9',
                                                fontSize: '14px',
                                                mb: 1
                                            }}>
                                    Marital Status
                                </Typography>
                                <FormControl fullWidth>
                                    <Controller
                                        name="maritalStatus"
                                        control={control}
                                        render={({field}) => (
                                            <TextField
                                                {...field}
                                                select
                                                value={field.value || ''}
                                                onChange={(e) => {
                                                    field.onChange(e);
                                                    handleMaritalStatusType(e);
                                                }}
                                                required
                                                error={!!errors.maritalStatus}
                                                helperText={errors.maritalStatus ? errors.maritalStatus.message : ''}
                                                slotProps={{
                                                    input: {
                                                        sx: txProps,
                                                    },
                                                    inputLabel: {
                                                        sx: {
                                                            color: "#FFF",
                                                            "&.Mui-focused": {
                                                                color: "white"
                                                            },
                                                        }
                                                    },
                                                    select: {
                                                        MenuProps: {
                                                            PaperProps: {
                                                                sx: {
                                                                    backgroundColor: '#134357',
                                                                    color: 'white',
                                                                    maxHeight: 450,
                                                                    overflow: 'auto',
                                                                },
                                                            },
                                                        },

                                                    }
                                                }}
                                                sx={{
                                                    '& .MuiSelect-icon': {
                                                        color: '#fff',
                                                    },
                                                    '& .MuiSelect-icon:hover': {
                                                        color: '#fff',
                                                    },
                                                }}>
                                                <MenuItem value="" sx={{color: "#4BF807"}}>
                                                    Marital Status
                                                </MenuItem>
                                                {getMaritalStatusType()}
                                            </TextField>

                                        )}
                                    />
                                </FormControl>
                            </Card>
                        </Grid>

                        <Grid size={{xs: 12, sm: 12, md: 12, lg: 4}}>
                            <Card sx={{
                                background: 'linear-gradient(to right, #1d4350, #a43931)',
                                padding: '16px',
                                borderRadius: '10px'
                            }}>
                                <Typography variant="subtitle2"
                                            sx={{
                                                color: '#46F0F9',
                                                fontSize: '14px',
                                                mb: 1
                                            }}>
                                    Country
                                </Typography>
                                {/* Relationship*/}
                                <FormControl fullWidth>
                                    <Controller
                                        name="country"
                                        control={control}
                                        render={({field}) => (
                                            <TextField
                                                {...field}
                                                select
                                                value={field.value || ''}
                                                error={!!errors.country}
                                                helperText={errors.country ? errors.country.message : ''}
                                                onChange={(e) => {
                                                    field.onChange(e);
                                                    handleCountryChange(e);
                                                }}
                                                required
                                                slotProps={{
                                                    input: {
                                                        sx: txProps,
                                                    },
                                                    inputLabel: {
                                                        sx: {
                                                            color: "#FFF",
                                                            "&.Mui-focused": {
                                                                color: "white"
                                                            },
                                                        }
                                                    },
                                                    select: {
                                                        MenuProps: {
                                                            PaperProps: {
                                                                sx: {
                                                                    backgroundColor: '#134357',
                                                                    color: 'white',
                                                                    maxHeight: 450,
                                                                    overflow: 'auto',
                                                                },
                                                            },
                                                        },

                                                    }
                                                }}
                                                sx={{
                                                    '& .MuiSelect-icon': {
                                                        color: '#fff',
                                                    },
                                                    '& .MuiSelect-icon:hover': {
                                                        color: '#fff',
                                                    },
                                                }}>
                                                <MenuItem value="" sx={{color: "#4BF807"}}>
                                                    Country
                                                </MenuItem>
                                                {getCountryType()}
                                            </TextField>
                                        )}
                                    />
                                </FormControl>
                            </Card>
                        </Grid>
                        <Grid size={{xs: 12, sm: 12, md: 12, lg: 4}}>
                            <Card sx={{
                                background: 'linear-gradient(to right, #1d4350, #a43931)',
                                padding: '16px',
                                borderRadius: '10px'
                            }}>
                                <Typography variant="subtitle2"
                                            sx={{
                                                color: '#46F0F9',
                                                fontSize: '14px',
                                                mb: 1
                                            }}>
                                    State of Origin
                                </Typography>
                                {/* Relationship*/}
                                <FormControl fullWidth>
                                    <Controller
                                        name="stateOfOrigin"
                                        control={control}
                                        render={({field}) => (
                                            <TextField
                                                {...field}
                                                select
                                                value={field.value || ''}
                                                error={!!errors.stateOfOrigin}
                                                helperText={errors.stateOfOrigin ? errors.stateOfOrigin.message : ''}
                                                onChange={(e) => {
                                                    field.onChange(e);
                                                    handleStateOfOriginChange(e);
                                                }}
                                                required
                                                slotProps={{
                                                    input: {
                                                        sx: txProps,
                                                    },
                                                    inputLabel: {
                                                        sx: {
                                                            color: "#FFF",
                                                            "&.Mui-focused": {
                                                                color: "white"
                                                            },
                                                        }
                                                    },
                                                    select: {
                                                        MenuProps: {
                                                            PaperProps: {
                                                                sx: {
                                                                    backgroundColor: '#134357',
                                                                    color: 'white',
                                                                    maxHeight: 450,
                                                                    overflow: 'auto',
                                                                },
                                                            },
                                                        },

                                                    }
                                                }}
                                                sx={{
                                                    '& .MuiSelect-icon': {
                                                        color: '#fff',
                                                    },
                                                    '& .MuiSelect-icon:hover': {
                                                        color: '#fff',
                                                    },
                                                }}>
                                                <MenuItem value="" sx={{color: "#4BF807"}}>
                                                    Select State
                                                </MenuItem>
                                                {getStateOfOriginOptions()}
                                            </TextField>
                                        )}
                                    />
                                </FormControl>
                            </Card>
                        </Grid>
                        {/* LGA */}
                        <Grid size={{xs: 12, sm: 12, md: 12, lg: 4}}>
                            <Card sx={{
                                background: 'linear-gradient(to right, #1d4350, #a43931)',
                                padding: '16px',
                                borderRadius: '10px'
                            }}>
                                <Typography variant="subtitle2"
                                            sx={{
                                                color: '#46F0F9',
                                                fontSize: '14px',
                                                mb: 1
                                            }}>
                                    LGA
                                </Typography>
                                {/* Relationship*/}
                                <FormControl fullWidth>
                                    <Controller
                                        name="lga"
                                        control={control}
                                        render={({field}) => (
                                            <TextField
                                                {...field}
                                                select
                                                value={field.value || ''}
                                                error={!!errors.lga}
                                                helperText={errors.lga ? errors.lga.message : ''}
                                                onChange={(e) => {
                                                    field.onChange(e);
                                                    handleLGAChange(e);
                                                }}
                                                required
                                                slotProps={{
                                                    input: {
                                                        sx: txProps,
                                                    },
                                                    inputLabel: {
                                                        sx: {
                                                            color: "#FFF",
                                                            "&.Mui-focused": {
                                                                color: "white"
                                                            },
                                                        }
                                                    },
                                                    select: {
                                                        MenuProps: {
                                                            PaperProps: {
                                                                sx: {
                                                                    backgroundColor: '#134357',
                                                                    color: 'white',
                                                                    maxHeight: 450,
                                                                    overflow: 'auto',
                                                                },
                                                            },
                                                        },

                                                    }
                                                }}
                                                sx={{
                                                    '& .MuiSelect-icon': {
                                                        color: '#fff',
                                                    },
                                                    '& .MuiSelect-icon:hover': {
                                                        color: '#fff',
                                                    },
                                                }}>
                                                <MenuItem value="" sx={{color: "#4BF807"}}>
                                                    Select LGA
                                                </MenuItem>
                                                {getLGAOptions()}
                                            </TextField>
                                        )}
                                    />
                                </FormControl>
                            </Card>
                        </Grid>
                        <Grid xs={xSmall || small || medium ? 12 : large ? 6 : 6}>
                            <Card sx={{
                                background: 'linear-gradient(to right, #1d4350, #a43931)',
                                padding: '16px',
                                borderRadius: '10px'
                            }}>
                                <Typography variant="subtitle2"
                                            sx={{
                                                color: '#46F0F9',
                                                fontSize: '14px',
                                                mb: 1
                                            }}>
                                    DOB
                                </Typography>
                                <FormControl fullWidth>
                                    <Controller
                                        name="dob"
                                        control={control}
                                        error={errors.dob?.message}
                                        render={({field}) => (
                                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                <DatePicker
                                                    {...field}
                                                    // value should be field.value or today's date
                                                    value={dobDate}
                                                    onChange={(newValue) => {
                                                        setDobDate(newValue);
                                                        field.onChange(dayjs(newValue).format("DD/MMM/YYYY"));
                                                    }}
                                                    disableFuture
                                                    views={['year', 'month', 'day']}
                                                    closeOnSelect={false}
                                                    inputRef={field.ref}
                                                    slotProps={dobProps}
                                                    format="LL"
                                                    sx={{
                                                        '& .MuiPaper-root': {
                                                            bgcolor: '#1F2937',
                                                        }
                                                    }}

                                                />
                                            </LocalizationProvider>
                                        )}
                                    />
                                </FormControl>
                            </Card>
                        </Grid>
                        <Grid size={12}>
                            <Card sx={{
                                background: 'linear-gradient(to right, #000046, #1cb5e0)',
                                padding: '16px',
                                borderRadius: '10px'
                            }}>
                                <Typography variant="body1" sx={{
                                    color: '#FFF',
                                    fontWeight: 'bold',
                                    textAlign: 'center'
                                }}>
                                    Next of Kin Info
                                </Typography>
                            </Card>
                        </Grid>

                        <Grid size={{xs: 12, sm: 12, md: 12, lg: 4}}>
                            <FormControl fullWidth>
                                <Card sx={{
                                    background: 'linear-gradient(to right, #1d4350, #a43931)',
                                    padding: '16px',
                                    borderRadius: '10px'
                                }}>
                                    <Typography variant="subtitle2"
                                                sx={{
                                                    color: '#46F0F9',
                                                    fontSize: '14px',
                                                    mb: 1
                                                }}>
                                        Next of Kin
                                    </Typography>

                                    <Controller
                                        name="nextOfKin"
                                        control={control}
                                        render={({field}) => (
                                            <TextField
                                                {...field}
                                                value={field.value || ''}
                                                slotProps={{
                                                    input: {
                                                        sx: txProps,
                                                    },
                                                    inputLabel: {
                                                        sx: {
                                                            color: "#FFF",
                                                            "&.Mui-focused": {
                                                                color: "white"
                                                            },
                                                        }
                                                    }
                                                }}
                                                sx={{
                                                    color: "#46F0F9",
                                                }}
                                                fullWidth
                                                variant="outlined"
                                                error={!!errors.nextOfKin}
                                                helperText={errors.nextOfKin ? errors.nextOfKin.message : ''}
                                                required
                                            />
                                        )}
                                    />

                                </Card>
                            </FormControl>
                        </Grid>
                        <Grid size={{xs: 12, sm: 12, md: 12, lg: 4}}>
                            <Card sx={{
                                background: 'linear-gradient(to right, #1d4350, #a43931)',
                                padding: '16px',
                                borderRadius: '10px'
                            }}>
                                <Typography variant="subtitle2"
                                            sx={{
                                                color: '#46F0F9',
                                                fontSize: '14px',
                                                mb: 1
                                            }}>
                                    Relationship
                                </Typography>
                                {/* Relationship*/}
                                <FormControl fullWidth>
                                    <Controller
                                        name="nextOfKinRelationship"
                                        control={control}
                                        render={({field}) => (
                                            <TextField
                                                {...field}
                                                select
                                                value={field.value || ''}
                                                error={!!errors.nextOfKinRelationship}
                                                helperText={errors.nextOfKinRelationship ? errors.nextOfKinRelationship.message : ''}
                                                onChange={(e) => {
                                                    field.onChange(e);
                                                    handleNextOfKinChange(e);
                                                }}
                                                required
                                                slotProps={{
                                                    input: {
                                                        sx: txProps,
                                                    },
                                                    inputLabel: {
                                                        sx: {
                                                            color: "#FFF",
                                                            "&.Mui-focused": {
                                                                color: "white"
                                                            },
                                                        }
                                                    },
                                                    select: {
                                                        MenuProps: {
                                                            PaperProps: {
                                                                sx: {
                                                                    backgroundColor: '#134357',
                                                                    color: 'white',
                                                                    maxHeight: 450,
                                                                    overflow: 'auto',
                                                                },
                                                            },
                                                        },

                                                    }
                                                }}
                                                sx={{
                                                    '& .MuiSelect-icon': {
                                                        color: '#fff',
                                                    },
                                                    '& .MuiSelect-icon:hover': {
                                                        color: '#fff',
                                                    },
                                                }}>
                                                <MenuItem value="" sx={{color: "#4BF807"}}>
                                                    Select Relationship
                                                </MenuItem>
                                                {getNextOfKinOptions()}
                                            </TextField>
                                        )}
                                    />
                                </FormControl>
                            </Card>
                        </Grid>
                        <Grid size={{xs: 12, sm: 12, md: 12, lg: 4}}>
                            <Card sx={{
                                background: 'linear-gradient(to right, #1d4350, #a43931)',
                                padding: '16px',
                                borderRadius: '10px'
                            }}>
                                <Typography variant="subtitle2"
                                            sx={{
                                                color: '#46F0F9',
                                                fontSize: '14px',
                                                mb: 1
                                            }}>
                                    Contact Number
                                </Typography>
                                <FormControl fullWidth>
                                    <Controller
                                        name="nextOfKinPhone"
                                        control={control}
                                        render={({field}) => (
                                            <Box sx={phoneInputStyle}>
                                                <PhoneInput
                                                    {...field}
                                                    international
                                                    defaultCountry="NG"
                                                    countryCallingCodeEditable={false}
                                                    value={field.value || ''}
                                                    onChange={(value) => {
                                                        field.onChange(value);
                                                        setValue('nextOfKinPhone', value);
                                                    }}
                                                />
                                            </Box>
                                        )}
                                    />
                                    {errors.nextOfKinPhone && (
                                        <FormHelperText
                                            sx={{
                                                color: 'red',
                                                mt: 1,
                                                ml: 2
                                            }}
                                        >
                                            {errors.nextOfKinPhone.message}
                                        </FormHelperText>
                                    )}
                                </FormControl>
                            </Card>
                        </Grid>
                        <Grid size={12}>
                            <Card sx={{
                                background: 'linear-gradient(to right, #000046, #1cb5e0)',
                                padding: '16px',
                                borderRadius: '10px'
                            }}>
                                <Typography variant="body1" sx={{
                                    color: '#FFF',
                                    fontWeight: 'bold',
                                    textAlign: 'center'
                                }}>
                                    State Address Info
                                </Typography>
                            </Card>
                        </Grid>
                        {/* State of Residence */}
                        <Grid size={{xs: 12, sm: 12, md: 12, lg: 4}}>
                            <Card sx={{
                                background: 'linear-gradient(to right, #1d4350, #a43931)',
                                padding: '16px',
                                borderRadius: '10px'
                            }}>
                                <Typography variant="subtitle2"
                                            sx={{
                                                color: '#46F0F9',
                                                fontSize: '14px',
                                                mb: 1
                                            }}>
                                    State of Residence
                                </Typography>
                                {/* Relationship*/}
                                <FormControl fullWidth>
                                    <Controller
                                        name="stateOfResidence"
                                        control={control}
                                        render={({field}) => (
                                            <TextField
                                                {...field}
                                                select
                                                value={field.value || ''}
                                                error={!!errors.stateOfResidence}
                                                helperText={errors.stateOfResidence ? errors.stateOfResidence.message : ''}
                                                onChange={(e) => {
                                                    field.onChange(e);
                                                    handleStateOfResidence(e);
                                                }}
                                                required
                                                slotProps={{
                                                    input: {
                                                        sx: txProps,
                                                    },
                                                    inputLabel: {
                                                        sx: {
                                                            color: "#FFF",
                                                            "&.Mui-focused": {
                                                                color: "white"
                                                            },
                                                        }
                                                    },
                                                    select: {
                                                        MenuProps: {
                                                            PaperProps: {
                                                                sx: {
                                                                    backgroundColor: '#134357',
                                                                    color: 'white',
                                                                    maxHeight: 450,
                                                                    overflow: 'auto',
                                                                },
                                                            },
                                                        },

                                                    }
                                                }}
                                                sx={{
                                                    '& .MuiSelect-icon': {
                                                        color: '#fff',
                                                    },
                                                    '& .MuiSelect-icon:hover': {
                                                        color: '#fff',
                                                    },
                                                }}>
                                                <MenuItem value="" sx={{color: "#4BF807"}}>
                                                    Select State
                                                </MenuItem>
                                                {getStateOfResidence()}
                                            </TextField>
                                        )}
                                    />
                                </FormControl>
                            </Card>
                        </Grid>
                        {/* LGA */}
                        <Grid size={{xs: 12, sm: 12, md: 12, lg: 4}}>
                            <Card sx={{
                                background: 'linear-gradient(to right, #1d4350, #a43931)',
                                padding: '16px',
                                borderRadius: '10px'
                            }}>
                                <Typography variant="subtitle2"
                                            sx={{
                                                color: '#46F0F9',
                                                fontSize: '14px',
                                                mb: 1
                                            }}>
                                    LGA
                                </Typography>

                                {/* Relationship*/}
                                <FormControl fullWidth>
                                    <Controller
                                        name="currlga"
                                        control={control}
                                        render={({field}) => (
                                            <TextField
                                                {...field}
                                                select
                                                value={field.value || ''}
                                                error={!!errors.currlga}
                                                helperText={errors.currlga ? errors.currlga.message : ''}
                                                onChange={(e) => {
                                                    field.onChange(e);
                                                    handleCurrLGAChange(e);
                                                }}
                                                required
                                                slotProps={{
                                                    input: {
                                                        sx: txProps,
                                                    },
                                                    inputLabel: {
                                                        sx: {
                                                            color: "#FFF",
                                                            "&.Mui-focused": {
                                                                color: "white"
                                                            },
                                                        }
                                                    },
                                                    select: {
                                                        MenuProps: {
                                                            PaperProps: {
                                                                sx: {
                                                                    backgroundColor: '#134357',
                                                                    color: 'white',
                                                                    maxHeight: 450,
                                                                    overflow: 'auto',
                                                                },
                                                            },
                                                        },

                                                    }
                                                }}
                                                sx={{
                                                    '& .MuiSelect-icon': {
                                                        color: '#fff',
                                                    },
                                                    '& .MuiSelect-icon:hover': {
                                                        color: '#fff',
                                                    },
                                                }}>

                                                <MenuItem value="" sx={{color: "#4BF807"}}>
                                                    Select LGA
                                                </MenuItem>
                                                {getCurrLGAOptions()}
                                            </TextField>
                                        )}
                                    />
                                </FormControl>
                            </Card>
                        </Grid>
                        <Grid size={{xs: 12, sm: 12, md: 12, lg: 4}}>
                            <Card sx={{
                                background: 'linear-gradient(to right, #1d4350, #a43931)',
                                padding: '16px',
                                borderRadius: '10px'
                            }}>
                                <Typography variant="subtitle2"
                                            sx={{
                                                color: '#46F0F9',
                                                fontSize: '14px',
                                                mb: 1
                                            }}>
                                    Home Address
                                </Typography>
                                <FormControl fullWidth>
                                    <Controller
                                        name="address"
                                        control={control}
                                        render={({field}) => (
                                            <TextField
                                                {...field}
                                                variant="outlined"
                                                error={errors.address ? true : false}
                                                helperText={errors.address ? errors.address.message : ''}
                                                value={field.value || ''}
                                                slotProps={{
                                                    input: {
                                                        sx: txProps,
                                                    },
                                                    inputLabel: {
                                                        sx: {
                                                            color: "#FFF",
                                                            "&.Mui-focused": {
                                                                color: "white"
                                                            },
                                                        }
                                                    }
                                                }}
                                                sx={{
                                                    color: "#46F0F9",
                                                }}
                                            />
                                        )}
                                    />
                                </FormControl>
                            </Card>
                        </Grid>
                        <Grid size={12}>
                            <Card sx={{
                                background: 'linear-gradient(to right, #000046, #1cb5e0)',
                                padding: '16px',
                                borderRadius: '10px'
                            }}>
                                <Typography variant="body1" sx={{
                                    color: '#FFF',
                                    fontWeight: 'bold',
                                    textAlign: 'center'
                                }}>
                                    Professional Info
                                </Typography>
                            </Card>
                        </Grid>
                        {/* Health Worker Specific Fields */}
                        <Grid size={{xs: 12, sm: 12, md: 12, lg: 4}}>
                            <Controller
                                name="specialization"
                                control={control}
                                render={({field}) => (
                                    <FormControl fullWidth>
                                        <TextField
                                            {...field}
                                            select
                                            label="Specialization"
                                            error={!!errors.specialization}
                                            helperText={errors.specialization?.message}
                                            value={field.value || ''}
                                            onChange={(e) => {
                                                field.onChange(e);
                                                handleSpecializationChange(e);
                                            }}
                                            required
                                            sx={{
                                                '& .MuiSelect-icon': {
                                                    color: '#fff',
                                                },
                                                '& .MuiSelect-icon:hover': {
                                                    color: '#fff',
                                                },
                                            }}
                                            slotProps={{
                                                input: {
                                                    sx: txProps,
                                                },
                                                inputLabel: {
                                                    sx: {
                                                        color: "#FFF",
                                                        "&.Mui-focused": {
                                                            color: "white"
                                                        },
                                                    }
                                                },
                                                select: {
                                                    MenuProps: {
                                                        PaperProps: {
                                                            sx: {
                                                                backgroundColor: '#134357',
                                                                color: 'white',
                                                                maxHeight: 450,
                                                                overflow: 'auto',
                                                            },
                                                        },
                                                    },

                                                }
                                            }}
                                        >
                                            {specializations.map((option) => (
                                                <MenuItem key={option} value={option}>
                                                    {option}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    </FormControl>
                                )}
                            />
                        </Grid>

                        <Grid size={{xs: 12, sm: 12, md: 12, lg: 4}}>
                            <Controller
                                name="licenseNumber"
                                control={control}
                                render={({field}) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        label="License Number"
                                        error={!!errors.licenseNumber}
                                        helperText={errors.licenseNumber?.message}
                                        value={field.value || ''}
                                        slotProps={{
                                            input: {
                                                sx: txProps,
                                            },
                                            inputLabel: {
                                                sx: {
                                                    color: "#FFF",
                                                    "&.Mui-focused": {
                                                        color: "white"
                                                    },
                                                }
                                            }
                                        }}
                                        sx={{
                                            color: "#46F0F9",
                                        }}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid size={{xs: 12, sm: 12, md: 12, lg: 4}}>
                            <Controller
                                name="experienceLevel"
                                control={control}
                                render={({field}) => (
                                    <FormControl fullWidth>
                                        <TextField
                                            {...field}
                                            select
                                            label="Experience Level"
                                            error={!!errors.yearsOfExperience}
                                            helperText={errors.yearsOfExperience?.message}
                                            value={field.value || ''}
                                            required
                                            onChange={(e) => {
                                                field.onChange(e);
                                                handleExperienceLevelChange(e);
                                            }}
                                            sx={{
                                                '& .MuiSelect-icon': {
                                                    color: '#fff',
                                                },
                                                '& .MuiSelect-icon:hover': {
                                                    color: '#fff',
                                                },
                                            }}
                                            slotProps={{
                                                input: {
                                                    sx: txProps,
                                                },
                                                inputLabel: {
                                                    sx: {
                                                        color: "#FFF",
                                                        "&.Mui-focused": {
                                                            color: "white"
                                                        },
                                                    }
                                                },
                                                select: {
                                                    MenuProps: {
                                                        PaperProps: {
                                                            sx: {
                                                                backgroundColor: '#134357',
                                                                color: 'white',
                                                                maxHeight: 450,
                                                                overflow: 'auto',
                                                            },
                                                        },
                                                    },

                                                }
                                            }}
                                        >
                                            {experienceLevels.map((option) => (
                                                <MenuItem key={option} value={option}>
                                                    {option}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    </FormControl>
                                )}
                            />
                        </Grid>

                        <Grid size={{xs: 12, sm: 12, md: 12, lg: 4}}>
                            <Controller
                                name="hospitalAffiliation"
                                control={control}
                                render={({field}) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        label="Hospital Affiliation"
                                        error={!!errors.hospitalAffiliation}
                                        helperText={errors.hospitalAffiliation?.message}
                                        value={field.value || ''}
                                        slotProps={{
                                            input: {
                                                sx: txProps,
                                            },
                                            inputLabel: {
                                                sx: {
                                                    color: "#FFF",
                                                    "&.Mui-focused": {
                                                        color: "white"
                                                    },
                                                }
                                            }
                                        }}
                                        sx={{
                                            color: "#46F0F9",
                                        }}
                                    />
                                )}
                            />
                        </Grid>
                    </Grid>
                    <br/>
                    {/*Submitting button */}
                    <Stack direction='row' gap={3} sx={{marginBottom: '75px', justifyContent: 'flex-start'}}>
                        <Link href="/health-worker/settings/profile">
                            <Button variant="contained" color='success'
                                    aria-label="Go back to user profile"> Back </Button>
                        </Link>
                        <Button variant="contained" color='info' onClick={() => reset()}
                                aria-label="Clear form"> Clear </Button>
                        <Button
                            variant="contained"
                            color="error"
                            type="submit"
                            aria-label="Submit form"
                            endIcon={updating && <CircularProgress size={20} color="inherit"/>}
                            onClick={(e) => updating && e.preventDefault()} // Prevent default click if updating
                            sx={{
                                ...(updating && {
                                    pointerEvents: 'none',  // Disable interaction
                                    opacity: 1,             // Maintain original opacity
                                }),
                            }}
                        >
                            {updating ? 'Updating...' : 'Submit'}
                        </Button>
                    </Stack>

                </Box>
            </Box>
        </>
    )
}

export default UpdateProfile
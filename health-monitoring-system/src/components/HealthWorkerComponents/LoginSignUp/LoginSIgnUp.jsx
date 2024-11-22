'use client';

import React, {useState} from 'react';
import {
    Box,
    Button,
    CircularProgress,
    FormControl,
    IconButton,
    InputAdornment,
    TextField,
    Typography,
    useMediaQuery,
    useTheme
} from '@mui/material';
import {Email, GitHub, Google, Visibility, VisibilityOff} from '@mui/icons-material';
import {AnimatePresence, motion} from 'framer-motion';
import {keyframes} from '@mui/system';
import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {loginValidator, signUpValidator} from "@/validators/healthWorkerValidators";
import {toast} from 'sonner';
import {useMutation} from "@tanstack/react-query";
import {useRouter} from "next/navigation";
import AdminUtils from "@/utils/AdminUtils";
import {signIn} from "next-auth/react";


const txProps = {
    color: "red",
    bgcolor: "#274e61",
    borderRadius: "10px",
    width: "100%",
    fontSize: "16px",
    fontStyle: "bold",
    "&:hover": {
        bgcolor: "#051935",
    },
    fontFamily: "Poppins",
    "& .MuiInputBase-input": {
        color: "white",
    },
    "& .MuiFormHelperText-root": {
        color: "red",
    },
    "& .MuiOutlinedInput-notchedOutline": {
        borderColor: "green",
    },
    "& input:-webkit-autofill": {
        WebkitBoxShadow: "0 0 0 1000px #274e61 inset",
        WebkitTextFillColor: "white",
    },
};
export default function HealthWorkerLoginSignUp() {
    const [authMode, setAuthMode] = useState('login');
    const [passwordVisibility, setPasswordVisibility] = useState({
        loginPassword: false,
        registerPassword: false,
        confirmPassword: false,
    });

    const [toLogin, setToLogin] = useState(false);
    const [loading, setLoading] = useState(false);

    const { control, handleSubmit, formState: { errors } } = useForm({
        mode: "onTouched",
        resolver: zodResolver(authMode === 'login' ? loginValidator : signUpValidator),
        reValidateMode: "onChange",
    });
    const theme = useTheme();

    // Breakpoints
    const xSmall = useMediaQuery(theme.breakpoints.down("xs"));
    const small = useMediaQuery(theme.breakpoints.down("sm"));
    const medium = useMediaQuery(theme.breakpoints.down("md"));
    const large = useMediaQuery(theme.breakpoints.down("lg"));

    // Toggle between Login and Sign-Up modes
    const toggleAuthMode = () => {
        setAuthMode((prev) => (prev === 'login' ? 'signup' : 'login'));
    };

    // Toggle visibility for passwords
    const togglePasswordVisibility = (field) => {
        setPasswordVisibility((prev) => ({
            ...prev,
            [field]: !prev[field],
        }));
    };

    const borderAnimation = keyframes`
        0% {
            border-color: #FF6347;
        }
        25% {
            border-color: #46F0F9;
        }
        50% {
            border-color: #34C0D9;
        }
        75% {
            border-color: #8D3BFF;
        }
        100% {
            border-color: #FF6347;
        }
    `;

    // mutation for register
    const mutationRegister = useMutation({
        mutationKey: ["HealthWorkerRegister"],
        mutationFn: AdminUtils.healthWorkerRegistration,
    });

    // mutation for login
    const mutationLogin = useMutation({
        mutationKey: ["HealthWorkerLogin"],
        mutationFn: AdminUtils.healthWorkerLogin,
    });
    const router = useRouter();

// for registration
    const handleRegister = async (objData) => {
        try {
            console.log({ objData });
            toast.info('Registering... 🚀');
            setLoading(true);

            // Validate the data using the schema
            const { success, data } = signUpValidator.safeParse(objData);
            if (!success) {
                toast.error('Data Validation Failed');
                console.log(success);
                setLoading(false);
                return;
            }

            console.log('Data successfully validated');

            // Encrypt the data
            const encryptedData = await AdminUtils.encryptCredentials(data);

            // Mutate with the registration logic
            mutationRegister.mutate({ encryptedData }, {
                onSuccess: async (responseData) => {
                    toast.success("Registration successful 🚀");

                    // Sign in after successful registration
                    const signInResponse = await signIn('credentials', {
                        redirect: false,
                        email: data.email,
                        password: data.password,
                        role: responseData.role,
                    });

                    console.log(signInResponse);

                    if (signInResponse.ok) {
                        toast.success("Redirecting to dashboard 📡");
                        setLoading(false);
                        router.push('/health-worker/dashboard');
                    } else {
                        toast.error("Automatic login failed. Please login manually. 💺");
                        setLoading(false);
                        toast.info("Kindly login manually 🔭");
                        router.push('/authorization/health-worker');
                    }
                },
                onError: (error) => {
                    toast.error(error.message);
                    setLoading(false);
                },
            });
        } catch (error) {
            console.error("Error during registration:", error);
            toast.error("An unexpected error occurred during registration.");
            setLoading(false);
        }
    };

// for logging in
    const handleLogin = async (objData) => {
        try {
            setToLogin(true);

            // Validate the data using the schema
            const { success, data } = loginValidator.safeParse(objData);
            if (!success) {
                toast.error('Data Validation Failed');
                setToLogin(false);
                return;
            }

            // Encrypt the data
            const encryptedData = await AdminUtils.encryptCredentials(data);

            // Mutate with the login logic
            mutationLogin.mutate({ encryptedData }, {
                onSuccess: async (responseData) => {
                    toast.success("Login successful 🚀");

                    // Log in the user
                    const loginResult = await signIn('credentials', {
                        email: data.email,
                        password: data.password,
                        role: responseData.role,
                        redirect: false,
                    });

                    if (loginResult.ok) {
                        toast.success("Redirecting to dashboard 💡");
                        setToLogin(false);
                        router.push('/health-worker/dashboard'); // Redirect to dashboard
                    } else {
                        toast.error("Login failed after registration");
                        setToLogin(false);
                    }
                },
                onError: (error) => {
                    toast.error("Error: Invalid Credentials");
                    toast.error(error.message);
                    setToLogin(false);
                },
            });
        } catch (error) {
            console.error("Error during login:", error);
            toast.error("An unexpected error occurred during login.");
            setToLogin(false);
        }
    };

    // if errors exist, then log it or toast it
    if (Object.keys(errors).length > 0) {
        console.log({errors});
        toast.error("Validation errors exist");
    }

    return (
        <>
            <Box
                component='form'
                noValidate
                autoComplete="off"
                onSubmit={handleSubmit(authMode === 'login' ? handleLogin : handleRegister)}
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: 2,
                    gap: 3,
                    textAlign: 'center',
                    color: '#FFF',
                    fontFamily: 'Poppins',
                    transition: 'box-shadow 0.3s ease',
                    boxShadow: xSmall ? 'none' : '0 2px 8px rgba(0,0,0,0.1)',
                }}
            >
                {/* Container for Welcome Section and Form */}
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: {xs: 'column', md: 'row'},
                        justifyContent: 'space-between',
                        alignItems: 'stretch', // Ensures LHS and RHS stay aligned
                        maxWidth: '1000px',
                        width: '100%',
                        gap: 3,
                    }}
                >
                    {/* Welcome Section */}
                    <Box
                        sx={{
                            flex: 2, // Increased width allocation for the Welcome Section
                            textAlign: 'center',
                            padding: 2,
                            borderRadius: 2,
                            animation: `${borderAnimation} 4s linear infinite`,
                            border: '1px dashed',
                            color: '#FFF',
                            boxShadow: 4,
                            position: 'sticky', // Ensures the section stays fixed
                            top: '0', // Fix it to the top of the viewport
                            height: '100%', // Full height to match the form section
                        }}
                    >
                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: 'bold',
                                mb: 2,
                                backgroundImage: 'linear-gradient(270deg, #FF6347, #46F0F9, #34C0D9, #8D3BFF, #FF6347)',
                                backgroundSize: '150% 150%',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                color: 'transparent',
                                whiteSpace: 'nowrap', // Ensures text stays on one line
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                            }}
                        >
                            Welcome, Health Worker 🩺
                        </Typography>
                        <Typography variant="h6" sx={{color: '#FFF', mt: 2}}>
                            Access your dashboard and manage community health. Login or sign up to get started.
                        </Typography>
                    </Box>

                    {/* Form Section */}
                    <Box
                        sx={{
                            flex: 1,
                            padding: 4,
                            borderRadius: 2,
                            position: 'relative',
                            overflow: 'hidden',
                            animation: `${borderAnimation} 4s linear infinite`,
                            border: '4px solid',
                            color: '#FFF',
                            boxShadow: 4,
                            minHeight: '400px', // Fixed height for consistency
                        }}
                    >
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={authMode}
                                initial={{x: authMode === 'login' ? 300 : -300, opacity: 0}}
                                animate={{x: 0, opacity: 1}}
                                exit={{x: authMode === 'login' ? -300 : 300, opacity: 0}}
                                transition={{duration: 0.5}}
                            >
                                <Typography
                                    variant="h5"
                                    sx={{
                                        fontWeight: 'bold',
                                        mb: 2,
                                        color: '#FFF',
                                        textAlign: 'center',
                                    }}
                                >
                                    {authMode === 'login' ? 'Login' : 'Sign Up'}
                                </Typography>

                                <FormControl fullWidth>
                                    <Controller
                                        name="email"
                                        control={control}
                                        defaultValue=""
                                        rules={{required: "Email is required"}}
                                        render={({field}) => (
                                            <TextField
                                                {...field}
                                                InputProps={{
                                                    sx: txProps,
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <IconButton edge="end" sx={{color: 'gold'}}>
                                                                <Email size={xSmall || small || medium ? 12 : 24}/>
                                                            </IconButton>
                                                        </InputAdornment>
                                                    ),
                                                }}
                                                InputLabelProps={{
                                                    sx: {
                                                        color: "#46F0F9",
                                                        fontSize: xSmall ? '10px' : small ? '10px' : medium ? "10px" : large ? "14px" : "16px",
                                                        "&.Mui-focused": {
                                                            color: "white",
                                                        },
                                                    },
                                                    shrink: true,
                                                }}
                                                sx={{mb: 5, mt: 1}}
                                                label="Email"
                                                variant="outlined"
                                                autoComplete="off"
                                                error={!!errors.email}
                                                helperText={errors.email ? errors.email.message : ""}
                                                required
                                            />
                                        )}
                                    />
                                </FormControl>

                                <FormControl fullWidth>
                                    <Controller
                                        name="password"
                                        control={control}
                                        defaultValue=""
                                        rules={{required: "Password is required"}}
                                        render={({field}) => (
                                            <TextField
                                                {...field}
                                                fullWidth
                                                label="Password"
                                                variant="outlined"
                                                margin="normal"
                                                type={
                                                    authMode === "login"
                                                        ? passwordVisibility.loginPassword
                                                            ? "text"
                                                            : "password"
                                                        : passwordVisibility.registerPassword
                                                            ? "text"
                                                            : "password"
                                                }
                                                InputProps={{
                                                    sx: txProps,
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <IconButton
                                                                onClick={() =>
                                                                    togglePasswordVisibility(
                                                                        authMode === "login"
                                                                            ? "loginPassword"
                                                                            : "registerPassword"
                                                                    )
                                                                }
                                                                edge="end"
                                                                color="error"
                                                            >
                                                                {authMode === "login"
                                                                    ? passwordVisibility.loginPassword
                                                                        ? <VisibilityOff/>
                                                                        : <Visibility/>
                                                                    : passwordVisibility.registerPassword
                                                                        ? <VisibilityOff/>
                                                                        : <Visibility/>}
                                                            </IconButton>
                                                        </InputAdornment>
                                                    ),
                                                }}
                                                InputLabelProps={{
                                                    sx: {
                                                        color: "#46F0F9",
                                                        "&.Mui-focused": {
                                                            color: "white",
                                                        },
                                                    },
                                                    shrink: true,
                                                }}
                                                sx={{marginBottom: 5}}
                                                required
                                            />
                                        )}
                                    />
                                </FormControl>


                                {/* Confirm Password Field for Sign-Up */}
                                {authMode === 'signup' && (
                                    <FormControl fullWidth>
                                        <Controller
                                            name="confirmPassword"
                                            control={control}
                                            defaultValue=""
                                            rules={{required: "Confirm Password is required"}}
                                            render={({field}) => (
                                                <TextField
                                                    {...field}
                                                    fullWidth
                                                    label="Confirm Password"
                                                    variant="outlined"
                                                    margin="normal"
                                                    type={passwordVisibility.confirmPassword ? 'text' : 'password'}
                                                    InputProps={{
                                                        sx: txProps,
                                                        endAdornment: (
                                                            <InputAdornment position="end">
                                                                <IconButton
                                                                    onClick={() => togglePasswordVisibility('confirmPassword')}
                                                                    edge="end"
                                                                    color="error"
                                                                >
                                                                    {passwordVisibility.confirmPassword ?
                                                                        <VisibilityOff/> : <Visibility/>}
                                                                </IconButton>
                                                            </InputAdornment>
                                                        ),
                                                    }}
                                                    InputLabelProps={{
                                                        sx: {
                                                            color: "#46F0F9",
                                                            "&.Mui-focused": {
                                                                color: "white",
                                                            },
                                                        },
                                                        shrink: true,
                                                    }}
                                                    sx={{marginBottom: 5}}
                                                    required
                                                />
                                            )}
                                        />
                                    </FormControl>
                                )}

                                <Button
                                    variant="contained"
                                    fullWidth
                                    sx={{
                                        ...(toLogin && {
                                            pointerEvents: 'none',
                                            opacity: 1,
                                        }),
                                        mt: 2,
                                        backgroundColor: '#00cc00'
                                    }}
                                    type="submit"
                                    endIcon={toLogin && <CircularProgress size={20} color="inherit"/>}
                                >
                                    {authMode === 'login' ? 'Login' : 'Sign Up'}
                                </Button>

                                <Box sx={{mt: 3, textAlign: 'center'}}>
                                    <Typography variant="body2" sx={{color: '#FFF', mb: 1}}>
                                        Or continue with
                                    </Typography>
                                    <Box sx={{display: 'flex', justifyContent: 'center', gap: 2}}>
                                        <IconButton
                                            sx={{backgroundColor: '#FFF', '&:hover': {backgroundColor: '#F1F1F1'}}}
                                        >
                                            <Google color="primary"/>
                                        </IconButton>
                                        <IconButton
                                            sx={{backgroundColor: '#FFF', '&:hover': {backgroundColor: '#F1F1F1'}}}
                                        >
                                            <GitHub color="action"/>
                                        </IconButton>
                                    </Box>
                                </Box>

                                <Typography
                                    variant="body2"
                                    sx={{
                                        textAlign: 'center',
                                        marginTop: 3,
                                        color: '#46F0F9',
                                        cursor: 'pointer',
                                    }}
                                    onClick={toggleAuthMode}
                                >
                                    {authMode === 'login' ? "Don't have an account? Sign Up"  : 'Already have an account? Login'}
                                </Typography>
                            </motion.div>
                        </AnimatePresence>
                    </Box>
                </Box>
            </Box>
        </>
    )
        ;
}

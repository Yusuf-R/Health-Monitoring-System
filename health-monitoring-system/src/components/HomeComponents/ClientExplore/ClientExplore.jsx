'use client';
import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import { Email, TripOrigin, Visibility, VisibilityOff } from '@mui/icons-material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LazyLoading from '@/components/LazyLoading/LazyLoading';

import { motion, AnimatePresence } from 'framer-motion';
import { keyframes } from '@mui/system';
import { IconButton } from '@mui/material';
import { GitHub, Google, Apple } from '@mui/icons-material'; // Import icons
import { useMediaQuery, useTheme } from '@mui/material';
import { Controller, useForm } from "react-hook-form";

import { signUpValidator, loginValidator } from '@/validators/validateAuth';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import AdminUtils from '@/lib/utils/AdminUitls';
import { signIn } from "next-auth/react";

const borderAnimation = keyframes`
  0% { border-color: #FF6347; }
  25% { border-color: #46F0F9; }
  50% { border-color: #34C0D9; }
  75% { border-color: #8D3BFF; }
  100% { border-color: #FF6347; }
`;

function ClientExplore() {
    const theme = useTheme();

    // Breakpoints
    const xSmall = useMediaQuery(theme.breakpoints.down("xs"));
    const small = useMediaQuery(theme.breakpoints.down("sm"));
    const medium = useMediaQuery(theme.breakpoints.down("md"));
    const large = useMediaQuery(theme.breakpoints.down("lg"));


    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showPasswordP1, setShowPasswordP1] = useState(false);
    const [showPasswordP2, setShowPasswordP2] = useState(false);
    const [isLogin, setIsLogin] = useState(true);
    const [toLogin, setToLogin] = useState(false);

    const handlePasswordVisibility = () => setShowPassword(!showPassword);
    const handleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

    const { control, handleSubmit, formState: { errors } } = useForm({
        mode: "onTouched",
        resolver: zodResolver(isLogin ? loginValidator : signUpValidator),
        reValidateMode: "onChange",
    });

    // mutation for register
    const mutationRegister = useMutation({
        mutationKey: ["Register"],
        mutationFn: AdminUtils.clientRegistration,
    });

    // mutation for login
    const mutationLogin = useMutation({
        mutationKey: ["Login"],
        mutationFn: AdminUtils.clientLogin,
    });
    const router = useRouter();

    // for registration
    const onSubmit = async (objData) => {
        setToLogin(true);
        // we ensure validation with our schema
        const { success, data } = signUpValidator.safeParse(objData);
        if (!success) {
            toast.error('Data Validation Failed');
            setToLogin(false);
            return;
        }
        console.log('Data successfully validated');
        const encryptedData = await AdminUtils.encryptCredentials(data);
        mutationRegister.mutate({ encryptedData }, {
            onSuccess: async () => {
                toast.success("Registration successful 🚀");
                const signInResponse = await signIn('credentials', {
                    redirect: false,
                    email: data.email,
                    password: data.password,
                });

                if (signInResponse.ok) {
                    toast.success("Redirecting to dashboard 📡");
                    setToLogin(false);
                    router.push('/user/dashboard');
                } else {
                    toast.error("Automatic login failed. Please login manually. 💺");
                    setToLogin(false);
                    toast.info("Kindly login manually 🔭");
                }
                toast.success("Redirecting to dashboard 🖥 ")
                setToLogin(false);
                router.push('/user/dashboard');
            },
            onError: (error) => {
                console.error(error);
                toast.error(error.message);
                setToLogin(false);
            },
        });
    };

    //  for logging in 
    const onLogin = async (objData) => {
        setToLogin(true);
        // we ensure validation with our schema
        const { success, data } = loginValidator.safeParse(objData);
        if (!success) {
            toast.error('Data Validation Failed');
            setToLogin(false);
            return;
        }
        console.log('Data successfully validated');
        const encryptedData = await AdminUtils.encryptCredentials(data);
        mutationLogin.mutate({ encryptedData }, {
            onSuccess: async () => {
                toast.success("Login successful 🚀");

                // Log in the user immediately after successful registration
                const loginResult = await signIn("credentials", {
                    email: data.email,
                    password: data.password,
                    redirect: false,
                });

                if (loginResult.ok) {
                    toast.success("Redirecting to dashboard 💡");
                    setToLogin(false);
                    router.push('/user/dashboard'); // Redirect to dashboard
                } else {
                    toast.error("Login failed after registration");
                    setToLogin(false);
                }
            },

            onError: (error) => {
                console.error(error);
                toast.error("Error: Invalid Credentials");
                setToLogin(false);
            },
        });
    }
    // Handle toggle between Login and Sign Up
    const handleToggle = () => {
        setIsLogin(!isLogin);
    };

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


    const handleClickPassword1 = () => setShowPasswordP1((show) => !show);
    const handleClickPassword2 = () => setShowPasswordP2((show) => !show);
   
    return (
        <>

            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'row-reverse',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    minHeight: '90vh',
                    overflow: 'hidden',
                }}
            >
                {/* right most Main Log in Form */}
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        width: '50%',
                        p: 5,
                    }}
                >
                    {/* Control Wheel Toggle */}
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'flex-end',
                            justifyContent: 'center',
                            marginBottom: '20px',
                            flexWrap: 'wrap-reverse',
                        }}
                    >
                        <Box
                            component={motion.div}
                            initial={false}
                            animate={{ rotate: isLogin ? 0 : 360 }}
                            sx={{
                                width: '100px',
                                height: '100px',
                                borderRadius: '50%',
                                backgroundColor: '#ffeba7',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
                                ":hover": {
                                    backgroundColor: '#f1da87',
                                },
                            }}
                            onClick={handleToggle}
                        >
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#102770' }}>
                                {isLogin ? 'LOGIN' : 'SIGN UP'}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Form Display */}
                    <Box sx={{ width: '100%', maxWidth: '450px', position: 'relative' }}>
                        <AnimatePresence mode="wait">
                            {isLogin ? (
                                <motion.div
                                    key="login"
                                    initial={{ x: 300, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: -300, opacity: 0 }}
                                    transition={{ duration: 0.5 }}
                                    style={{ position: 'absolute', width: '100%' }}
                                >
                                    {/* Login Form */}
                                    <Box
                                        component='form'
                                        noValidate
                                        autoComplete="off"
                                        onSubmit={handleSubmit(onLogin)}
                                        sx={{
                                            padding: '20px',
                                            backgroundColor: '#2a2b38',
                                            color: 'white',
                                            border: '4px solid',
                                            animation: `${borderAnimation} 3s linear infinite`,
                                            borderRadius: '5%',
                                        }}
                                    >
                                        <Box sx={{ mb: 2 }}>
                                            <Controller
                                                name="email"
                                                control={control}
                                                defaultValue=""
                                                rules={{ required: "Email is required" }}
                                                render={({ field }) => (
                                                    <TextField
                                                        fullWidth
                                                        {...field}
                                                        InputProps={{
                                                            sx: txProps,
                                                            endAdornment: (
                                                                <InputAdornment position="end">
                                                                    <IconButton edge="end" sx={{ color: 'gold' }}>
                                                                        <Email size={xSmall || small || medium ? 12 : 24} />
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
                                                        sx={{ mb: 5, mt: 5 }}
                                                        label="Email"
                                                        variant="outlined"
                                                        autoComplete="off"
                                                        error={!!errors.email}
                                                        helperText={errors.email ? errors.email.message : ""}
                                                        required
                                                    />
                                                )}
                                            />
                                        </Box>
                                        <Box sx={{ mb: 2 }}>
                                            <Controller
                                                name="password"
                                                control={control}
                                                defaultValue=""
                                                rules={{ required: "Password is required" }}
                                                render={({ field }) => (
                                                    <TextField
                                                        {...field}
                                                        fullWidth
                                                        InputProps={{
                                                            sx: txProps,
                                                            endAdornment: (
                                                                <InputAdornment position="end">
                                                                    <IconButton
                                                                        aria-label="toggle password visibility"
                                                                        onClick={handlePasswordVisibility}
                                                                        edge="end"
                                                                        color="error"
                                                                    >
                                                                        {showPassword ? <VisibilityOff /> : <Visibility />}
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
                                                        sx={{ marginBottom: 5 }}
                                                        label="Password"
                                                        variant="outlined"
                                                        autoComplete="off"
                                                        error={!!errors.password}
                                                        helperText={errors.password ? errors.password.message : ""}
                                                        required
                                                        type={showPassword ? "text" : "password"}
                                                    />
                                                )}
                                            />
                                        </Box>
                                        <Button
                                            variant="contained"
                                            fullWidth
                                            sx={{ backgroundColor: '#ffeba7', color: '#102770', '&:hover': { backgroundColor: '#f1da87' } }}
                                            type='submit'
                                            disabled={toLogin}
                                        >
                                            Login
                                        </Button>

                                        {/* Social Login Icons */}
                                        <Box sx={{ mt: 3, textAlign: 'center' }}>
                                            <Typography sx={{ mb: 1 }}>Or login with</Typography>
                                            <IconButton sx={{ color: 'white' }}>
                                                <Google fontSize="large" />
                                            </IconButton>
                                            <IconButton sx={{ color: 'white' }}>
                                                <GitHub fontSize="large" />
                                            </IconButton>
                                            <IconButton sx={{ color: 'white' }}>
                                                <Apple fontSize="large" />
                                            </IconButton>
                                        </Box>
                                    </Box>
                                </motion.div>

                            ) : (
                                <motion.div
                                    key="signup"
                                    initial={{ x: 300, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: -300, opacity: 0 }}
                                    transition={{ duration: 0.5 }}
                                    style={{ position: 'absolute', width: '100%' }}
                                >
                                    {/* Sign Up Form */}
                                    <Box
                                        component='form'
                                        noValidate
                                        autoComplete="off"
                                        onSubmit={handleSubmit(onSubmit)}
                                        sx={{
                                            padding: '20px',
                                            backgroundColor: '#2a2b38',
                                            color: 'white',
                                            borderRadius: '5%',
                                            border: '4px solid',
                                            animation: `${borderAnimation} 3s linear infinite`, // Border animation
                                        }}
                                    >
                                        {/* Full Name */}
                                        <Box sx={{ mb: 2, mt: 5 }}>
                                            <Controller
                                                name="fullName"
                                                control={control}
                                                defaultValue=""
                                                render={({ field }) => (
                                                    <TextField
                                                        fullWidth
                                                        {...field}
                                                        InputProps={{
                                                            sx: txProps,
                                                            endAdornment: (
                                                                <InputAdornment position="end">
                                                                    <IconButton edge="end" sx={{ color: 'gold' }}>
                                                                        <AccountCircleIcon fontSize={xSmall || small || medium ? 'small' : 'medium'} />
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
                                                        sx={{ marginBottom: 5 }}
                                                        label="FullName"
                                                        variant="outlined"
                                                        autoComplete="off"
                                                        error={!!errors.fullName}
                                                        helperText={errors.fullName ? errors.fullName.message : ""}
                                                        required
                                                    />
                                                )}
                                            />
                                        </Box>
                                        {/* SignUp -- >> Email */}
                                        <Box sx={{ mb: 2 }}>
                                            <Controller
                                                name="email"
                                                control={control}
                                                defaultValue=""
                                                render={({ field }) => (
                                                    <TextField
                                                        fullWidth
                                                        {...field}
                                                        InputProps={{
                                                            sx: txProps,
                                                            endAdornment: (
                                                                <InputAdornment position="end">
                                                                    <IconButton edge="end" sx={{ color: 'gold' }}>
                                                                        <Email size={xSmall || small || medium ? 12 : 24} />
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
                                                        sx={{ marginBottom: 5 }}
                                                        label="Email"
                                                        variant="outlined"
                                                        autoComplete="off"
                                                        error={!!errors.email}
                                                        helperText={errors.email ? errors.email.message : ""}
                                                        required
                                                    />
                                                )}
                                            />
                                        </Box>
                                        {/* SignUp -- >> Password */}
                                        <Box sx={{ mb: 2 }}>
                                            <Controller
                                                name="password"
                                                control={control}
                                                defaultValue=""
                                                render={({ field }) => (
                                                    <TextField
                                                        {...field}
                                                        fullWidth
                                                        InputProps={{
                                                            sx: txProps,
                                                            endAdornment: (
                                                                <InputAdornment position="end">
                                                                    <IconButton
                                                                        aria-label="toggle password visibility"
                                                                        onClick={handleClickPassword1}
                                                                        edge="end"
                                                                        color="error"
                                                                    >
                                                                        {showPasswordP1 ? <VisibilityOff /> : <Visibility />}
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
                                                        sx={{ marginBottom: 5 }}
                                                        label="Password"
                                                        variant="outlined"
                                                        autoComplete="off"
                                                        error={!!errors.password}
                                                        helperText={errors.password ? errors.password.message : ""}
                                                        required
                                                        type={showPasswordP1 ? "text" : "password"}

                                                    />
                                                )}
                                            />
                                        </Box>
                                        {/* SignUp -- >> Confirm Password */}
                                        <Box sx={{ mb: 2 }}>
                                            <Controller
                                                name="confirmPassword"
                                                control={control}
                                                defaultValue=""
                                                render={({ field }) => (
                                                    <TextField
                                                        {...field}
                                                        fullWidth
                                                        InputProps={{
                                                            sx: txProps,
                                                            endAdornment: (
                                                                <InputAdornment position="end">
                                                                    <IconButton
                                                                        aria-label="toggle confirm password visibility"
                                                                        onClick={handleClickPassword2}
                                                                        edge="end"
                                                                        color="error"
                                                                    >
                                                                        {showPasswordP2 ? <VisibilityOff /> : <Visibility />}
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
                                                        sx={{ marginBottom: 5 }}
                                                        label="Confirm Password"
                                                        variant="outlined"
                                                        autoComplete="off"
                                                        error={!!errors.confirmPassword}
                                                        helperText={errors.confirmPassword ? errors.confirmPassword.message : ""}
                                                        required
                                                        type={showPasswordP2 ? "text" : "password"}
                                                    />
                                                )}
                                            />
                                        </Box>
                                        <Button
                                            variant="contained"
                                            fullWidth
                                            sx={{ backgroundColor: '#ffeba7', color: '#102770', '&:hover': { backgroundColor: '#f1da87' } }}
                                            type='submit'
                                        >
                                            Submit
                                        </Button>

                                        {/* Social Login Icons */}
                                        <Box sx={{ mt: 3, textAlign: 'center' }}>
                                            <Typography sx={{ mb: 1 }}>Or sign up with</Typography>
                                            <IconButton sx={{ color: 'white' }}>
                                                <Google fontSize="large" />
                                            </IconButton>
                                            <IconButton sx={{ color: 'white' }}>
                                                <GitHub fontSize="large" />
                                            </IconButton>
                                            <IconButton sx={{ color: 'white' }}>
                                                <Apple fontSize="large" />
                                            </IconButton>
                                        </Box>
                                    </Box>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Box>
                </Box>
                {/* Left most, any content */}

            </Box>
            {toLogin && <LazyLoading />}
        </>

    );
}

export default ClientExplore;


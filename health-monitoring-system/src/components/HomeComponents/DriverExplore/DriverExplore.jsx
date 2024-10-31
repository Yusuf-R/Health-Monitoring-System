'use client';
import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LazyLoading from '@/components/LazyLoading/LazyLoading';

import { keyframes } from '@mui/system';
import { IconButton } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Google, GitHub, Apple, Email, Visibility, VisibilityOff } from '@mui/icons-material';

import { useMediaQuery, useTheme } from '@mui/material';
import { Controller, useForm } from "react-hook-form";

import { signUpValidator, loginValidator } from '@/validators/validateAuth';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import AdminUtils from '@/lib/utils/AdminUitls';
import { signIn } from "next-auth/react";

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

const borderAnimation = keyframes`
  0% { border-color: #FF6347; }
  25% { border-color: #46F0F9; }
  50% { border-color: #34C0D9; }
  75% { border-color: #8D3BFF; }
  100% { border-color: #FF6347; }
`;



function DriverExplore() {
    const theme = useTheme();

    // Breakpoints
    const xSmall = useMediaQuery(theme.breakpoints.down("xs"));
    const small = useMediaQuery(theme.breakpoints.down("sm"));
    const medium = useMediaQuery(theme.breakpoints.down("md"));
    const large = useMediaQuery(theme.breakpoints.down("lg"));

    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [toLogin, setToLogin] = useState(false);

    const { control, handleSubmit, formState: { errors } } = useForm({
        mode: "onTouched",
        resolver: zodResolver(isLogin ? loginValidator : signUpValidator),
        reValidateMode: "onChange",
    });

    const handleToggle = () => setIsLogin((prev) => !prev);
    const router = useRouter();

    // mutation for register
    const mutationRegister = useMutation({
        mutationKey: ["Register"],
        mutationFn: AdminUtils.driverRegistration,
    });

    // mutation for login
    const mutationLogin = useMutation({
        mutationKey: ["Login"],
        mutationFn: AdminUtils.driverLogin,
    });

    // for registration
    const onRegister = async (objData) => {
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
                    router.push('/driver/dashboard');
                } else {
                    toast.error("Automatic login failed. Please login manually. 💺");
                    setToLogin(false);
                    toast.info("Kindly login manually 🔭");
                }
                toast.success("Redirecting to dashboard 🖥 ")
                setToLogin(false);
                router.push('/driver/dashboard');
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
                    router.push('/driver/dashboard'); // Redirect to dashboard
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

    return (
        <>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'row-reverse',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexWrap: 'no-wrap',
                    minHeight: '90vh',
                    overflow: 'hidden',

                }}
            >
                <Box
                    sx={{
                        width: 600,
                        maxWidth: '90%',
                        minHeight: isLogin ? 550 : 750,
                        borderRadius: 10,
                        boxShadow: '0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)',
                        position: 'relative',
                        background: 'linear-gradient(to right, #0f0c29, #302b63, #24243e)',

                    }}
                >
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
                                <LoginForm
                                    control={control}
                                    handleSubmit={handleSubmit}
                                    onLogin={onLogin}
                                    errors={errors}
                                    handleToggle={handleToggle}
                                    showPassword={showPassword}
                                    setShowPassword={setShowPassword}
                                    toLogin={toLogin}
                                />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="register"
                                initial={{ x: -300, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: 300, opacity: 0 }}
                                transition={{ duration: 0.5 }}
                                style={{ position: 'absolute', width: '100%' }}
                            >
                                <RegisterForm
                                    control={control}
                                    handleSubmit={handleSubmit}
                                    onRegister={onRegister}
                                    errors={errors}
                                    handleToggle={handleToggle}
                                    showPassword={showPassword}
                                    setShowPassword={setShowPassword}
                                    toLogin={toLogin}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Box>
            </Box>
            {toLogin && <LazyLoading />}
        </>
    );
}


function LoginForm({ control, handleSubmit, onLogin, errors, handleToggle, showPassword, setShowPassword, toLogin }) {
    const theme = useTheme();

    // Breakpoints
    const xSmall = useMediaQuery(theme.breakpoints.down("xs"));
    const small = useMediaQuery(theme.breakpoints.down("sm"));
    const medium = useMediaQuery(theme.breakpoints.down("md"));
    const large = useMediaQuery(theme.breakpoints.down("lg"));
    const handlePasswordVisibility = () => setShowPassword((prev) => !prev);

    return (
        <Box
            component="form"
            noValidate
            autoComplete="off"
            onSubmit={handleSubmit(onLogin)}
            sx={{
                padding: '30px',
                color: 'white',
                border: '3px solid ',
                animation: `borderAnimation 3s linear infinite`,
                borderRadius: '5%',
                animation: `${borderAnimation} 3s linear infinite`,

            }}
        >
            <Typography
                variant="h4"
                mb={2}
                textAlign="center"
                sx={{
                    color: 'white',
                    fontWeight: 'bold',
                }}
            >
                LOGIN
            </Typography>

            {/* Social Login Icons */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 4 }}>
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

            <Typography variant="body2" mb={2} textAlign="center">
                Or login with your email and password
            </Typography>

            <Box sx={{ mb: 2 }}>
                <Controller
                    name="email"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                        <TextField
                            fullWidth
                            {...field}
                            label="Email"
                            variant="outlined"
                            error={!!errors.email}
                            helperText={errors.email?.message}
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
                                    "&.Mui-focused": { color: "white" },
                                },
                                shrink: true,
                            }}
                            sx={{ marginBottom: 3 }}
                            autoComplete="off"
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
                    render={({ field }) => (
                        <TextField
                            {...field}
                            fullWidth
                            label="Password"
                            type={showPassword ? "text" : "password"}
                            variant="outlined"
                            error={!!errors.password}
                            helperText={errors.password?.message}
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
                                    "&.Mui-focused": { color: "white" },
                                },
                                shrink: true,
                            }}
                            sx={{ marginBottom: 3 }}
                            autoComplete="off"
                            required
                        />
                    )}
                />
            </Box>

            <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={toLogin}
                sx={{
                    mt: 2,
                    backgroundColor: '#ffeba7',
                    color: '#102770',
                    '&:hover': { backgroundColor: '#f1da87' },
                }}
            >
                Login
            </Button>

            <Typography sx={{ mt: 2, textAlign: 'center' }}>
                Don’t have an account?{" "}
                <Button
                    onClick={handleToggle}
                    variant='contained'
                    sx={{ color: '#ffeba7', textTransform: 'none' }}
                >
                    Register
                </Button>
            </Typography>
        </Box>
    );
}





// Register form
function RegisterForm({ control, handleSubmit, onRegister, errors, handleToggle, toLogin }) {
    const theme = useTheme();

    // Password visibility states specific to RegisterForm
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Handle password visibility toggling
    const handlePasswordVisibility = () => setShowPassword((prev) => !prev);
    const handleConfirmPasswordVisibility = () => setShowConfirmPassword((prev) => !prev);

    // Breakpoints for responsive UI
    const xSmall = useMediaQuery(theme.breakpoints.down("xs"));
    const small = useMediaQuery(theme.breakpoints.down("sm"));
    const medium = useMediaQuery(theme.breakpoints.down("md"));

    return (
        <Box
            component="form"
            noValidate
            autoComplete="off"
            onSubmit={handleSubmit(onRegister)}
            sx={{
                padding: '30px',
                color: 'white',
                borderRadius: '5%',
                border: '3px solid ',
                animation: `${borderAnimation} 3s linear infinite`,
            }}
        >
             <Typography variant="h4" mb={2} textAlign="center"
                sx={{
                    color: 'white',
                    fontWeight: 'bold',
                }}
            > 
                REGISTER
            </Typography>
            {/* Social Login Options */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
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

            <Typography variant="body2" mb={2} textAlign="center">
                Or Register with your email and password
            </Typography>

            {/* Full Name */}
            <Box sx={{ mb: 2 }}>
                <Controller
                    name="fullName"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                        <TextField
                            fullWidth
                            {...field}
                            label="Full Name"
                            error={!!errors.fullName}
                            helperText={errors.fullName?.message}
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
                                    "&.Mui-focused": { color: "white" },
                                },
                                shrink: true,
                            }}
                            sx={{ mb: 3 }}
                            variant="outlined"
                            autoComplete="off"
                            required
                        />
                    )}
                />
            </Box>

            {/* Email */}
            <Box sx={{ mb: 2 }}>
                <Controller
                    name="email"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                        <TextField
                            fullWidth
                            {...field}
                            label="Email"
                            error={!!errors.email}
                            helperText={errors.email?.message}
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
                                    "&.Mui-focused": { color: "white" },
                                },
                                shrink: true,
                            }}
                            sx={{ mb: 3 }}
                            variant="outlined"
                            autoComplete="off"
                            required
                        />
                    )}
                />
            </Box>

            {/* Password */}
            <Box sx={{ mb: 2 }}>
                <Controller
                    name="password"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                        <TextField
                            {...field}
                            fullWidth
                            label="Password"
                            type={showPassword ? "text" : "password"}
                            error={!!errors.password}
                            helperText={errors.password?.message}
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
                                sx: { color: "#46F0F9", "&.Mui-focused": { color: "white" } },
                                shrink: true,
                            }}
                            sx={{ mb: 3 }}
                            variant="outlined"
                            autoComplete="off"
                            required
                        />
                    )}
                />
            </Box>

            {/* Confirm Password */}
            <Box sx={{ mb: 2 }}>
                <Controller
                    name="confirmPassword"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                        <TextField
                            {...field}
                            fullWidth
                            label="Confirm Password"
                            type={showConfirmPassword ? "text" : "password"}
                            error={!!errors.confirmPassword}
                            helperText={errors.confirmPassword?.message}
                            InputProps={{
                                sx: txProps,
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle confirm password visibility"
                                            onClick={handleConfirmPasswordVisibility}
                                            edge="end"
                                            color="error"
                                        >
                                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            InputLabelProps={{
                                sx: { color: "#46F0F9", "&.Mui-focused": { color: "white" } },
                                shrink: true,
                            }}
                            sx={{ mb: 3 }}
                            variant="outlined"
                            autoComplete="off"
                            required
                        />
                    )}
                />
            </Box>

            {/* Register Button */}
            <Button
                type="submit"
                variant="contained"
                disabled={toLogin}
                fullWidth
                sx={{
                    mt: 2,
                    backgroundColor: '#ffeba7',
                    color: '#102770',
                    '&:hover': { backgroundColor: '#f1da87' },
                }}
            >
                Register
            </Button>

            {/* Login Text */}
            <Typography sx={{ mt: 2, textAlign: 'center', color: '#ffeba7' }}>
                Already have an account?{' '}
                <Button
                    onClick={handleToggle}
                    variant='contained'
                    sx={{ textTransform: 'none', color: '#ffeba7' }}
                >
                    Login
                </Button>
            </Typography>
        </Box>
    );
}



export default DriverExplore;
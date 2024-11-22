'use client';
import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import { Controller, useForm } from "react-hook-form";
import { Email, Visibility, VisibilityOff } from '@mui/icons-material';
import { FormControl, IconButton } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { GitHub, Google, Apple } from '@mui/icons-material';
import { keyframes } from '@mui/system';
import { signUpValidator, loginValidator } from '@/validators/userValidators';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import AdminUtils from "@/utils/AdminUtils";
import { signIn } from "next-auth/react";
import { useMediaQuery, useTheme } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';

const borderAnimation = keyframes`
  0% { border-color: #FF6347; }
  25% { border-color: #46F0F9; }
  50% { border-color: #34C0D9; }
  75% { border-color: #8D3BFF; }
  100% { border-color: #FF6347; }
`;

const textGradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

export default function LoginSignUp() {
    const theme = useTheme();

    // Breakpoints
    const xSmall = useMediaQuery(theme.breakpoints.down("xs"));
    const small = useMediaQuery(theme.breakpoints.down("sm"));
    const medium = useMediaQuery(theme.breakpoints.down("md"));
    const large = useMediaQuery(theme.breakpoints.down("lg"));


    const [loginPassword, setLoginPassword] = useState(false);
    const [registerPassword, setRegisterPassword] = useState(false);
    const [confirmRegisterPassword, setConfirmRegisterPassword] = useState(false);
    const [isLogin, setIsLogin] = useState(true);
    const [toLogin, setToLogin] = useState(false);

    // Toggle functions for password visibility
    const handleClickPassword = () => setLoginPassword((show) => !show);
    const handleRegisterPassword = () => setRegisterPassword((show) => !show);
    const handleConfirmRegisterPassword = () => setConfirmRegisterPassword((show) => !show);


    // Function to switch between Login and Sign-Up modes
    const handleToggle = (mode) => {
        if ((mode === 'login' && !isLogin) || (mode === 'signup' && isLogin)) {
            setIsLogin(!isLogin);
        }
    };

    const { control, handleSubmit, formState: { errors } } = useForm({
        mode: "onTouched",
        resolver: zodResolver(isLogin ? loginValidator : signUpValidator),
        reValidateMode: "onChange",
    });

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

    // mutation for register
    const mutationRegister = useMutation({
        mutationKey: ["Register"],
        mutationFn: AdminUtils.userRegistration,
    });

    // mutation for login
    const mutationLogin = useMutation({
        mutationKey: ["Login"],
        mutationFn: AdminUtils.userLogin,
    });
    const router = useRouter();

    // for registration
    const onRegister = async (objData) => {
        toast.info('Registering... 🚀');
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
            onSuccess: async (responseData) => {
                toast.success("Registration successful 🚀");
                const signInResponse = await signIn('credentials', {
                    redirect: false,
                    email: data.email,
                    password: data.password,
                    role: responseData.role,
                });
                console.log(signInResponse);

                if (signInResponse.ok) {
                    toast.success("Redirecting to dashboard 📡");
                    setToLogin(false);
                    router.push('/user/dashboard');
                } else {
                    toast.error("Automatic login failed. Please login manually. 💺");
                    setToLogin(false);
                    toast.info("Kindly login manually 🔭");
                    router.push('/authorization/users')
                }
            },
            onError: (error) => {
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
            onSuccess: async (responseData) => {
                toast.success("Login successful 🚀");
                // Log in the user immediately after successful registration
                const loginResult = await signIn("credentials", {
                    email: data.email,
                    password: data.password,
                    role: responseData.role,
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
                toast.error("Error: Invalid Credentials");
                toast.error(error.message);
                setToLogin(false);
            },
        });
    }

    // if errors exist, then log it or toast it
    if (Object.keys(errors).length > 0) {
        console.log(errors);
        toast.error("Validation errors exist");
    }
    return (
        <Box
            component='form'
            noValidate
            autoComplete="off"
            onSubmit={isLogin ? handleSubmit(onLogin) : handleSubmit(onRegister)}
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                color: '#FFF',
                marginTop: '5x',
                overflow: 'hidden',
            }}
        >
            <Typography
                variant="h4"
                sx={{
                    fontWeight: 'bold',
                    mb: 5,
                    backgroundImage: 'linear-gradient(270deg, #FF6347, #46F0F9, #34C0D9, #8D3BFF, #FF6347)',
                    backgroundSize: '150% 150%',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    color: 'transparent',
                    animation: `${textGradientAnimation} 5s ease infinite`,
                }}
            >
                Community Health Monitoring System 🩺
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 5 , textAlign:'center'}}>
                To get started, please login or sign up.
            </Typography>
            {/* Toggle Slider */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '300px',
                    height: '40px',
                    borderRadius: '20px',
                    background: '#333',
                    marginBottom: '30px',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Sliding toggle button with smoother transition */}
                <motion.div
                    animate={{ x: isLogin ? 0 : 150 }} // Sliding between positions
                    transition={{ duration: 0.4, ease: "easeInOut" }} // Smooth animation
                    style={{
                        width: '50%',
                        height: '100%',
                        borderRadius: '20px',
                        background: '#46F0F9',
                        position: 'absolute',
                        cursor: 'pointer',
                    }}
                />
                <Box
                    sx={{
                        display: 'flex',
                        width: '100%',
                        justifyContent: 'space-between',
                        padding: '0 15px',
                        zIndex: 1,
                    }}
                >
                    <Typography
                        variant="body1"
                        sx={{ color: isLogin ? '#000' : '#777', fontWeight: 'bold', cursor: 'pointer' }}
                        onClick={() => handleToggle('login')}
                    >
                        Login
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{ color: isLogin ? '#777' : '#000', fontWeight: 'bold', cursor: 'pointer' }}
                        onClick={() => handleToggle('signup')}
                    >
                        Sign Up
                    </Typography>
                </Box>
            </Box>

            {/* Container with fixed height to prevent layout shift */}
            <Box sx={{
                width: '100%',
                maxWidth: '400px',
                minHeight: '700px',
                display: 'flex',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
            }}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={isLogin ? 'login' : 'signup'}
                        initial={{ x: isLogin ? 300 : -300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: isLogin ? -300 : 300, opacity: 0 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        style={{ width: '100%', position: 'absolute' }} // Keeps the form centered
                    >
                        <Box

                            sx={{
                                padding: '30px',
                                borderRadius: '8px',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                                backgroundColor: '#2a2b38',
                                textAlign: 'center',
                                animation: `${borderAnimation} 3s linear infinite`,
                                maxWidth: '100%',
                            }}
                        >
                            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                                {isLogin ? 'Login' : 'Sign Up'}
                            </Typography>

                            {/* Email Field */}
                            <FormControl fullWidth>
                                <Controller
                                    name="email"
                                    control={control}
                                    defaultValue=""
                                    rules={{ required: "Email is required" }}
                                    render={({ field }) => (
                                        <TextField
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
                                            sx={{ mb: 5, mt: 1 }}
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

                            {/* Password Field with Visibility Toggle */}
                            <FormControl fullWidth>
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
                                                            onClick={isLogin ? handleClickPassword : handleRegisterPassword} // Conditional toggle
                                                            edge="end"
                                                            color="error"
                                                        >
                                                            {isLogin
                                                                ? (loginPassword ? <VisibilityOff /> : <Visibility />)
                                                                : (registerPassword ? <VisibilityOff /> : <Visibility />)
                                                            }
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
                                            type={isLogin ? (loginPassword ? "text" : "password") : (registerPassword ? "text" : "password")} // Conditional type based on state
                                        />
                                    )}
                                />
                            </FormControl>


                            {/* Additional Confirm Password Field for Sign-Up */}
                            {!isLogin && (
                                <FormControl fullWidth>
                                    <Controller
                                        name="confirmPassword"
                                        control={control}
                                        defaultValue=""
                                        rules={{ required: "Confirm Password is required" }}
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
                                                                onClick={handleConfirmRegisterPassword} // Only for confirm password field
                                                                edge="end"
                                                                color="error"
                                                            >
                                                                {confirmRegisterPassword ? <VisibilityOff /> : <Visibility />}
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
                                                type={confirmRegisterPassword ? "text" : "password"}
                                            />
                                        )}
                                    />
                                </FormControl>
                            )}

                            {/* Submit Button */}
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
                                endIcon={toLogin && <CircularProgress size={20} color="inherit" />}
                            >
                                {isLogin ? 'Login' : 'Sign Up'}
                            </Button>

                            {/* Social Logins */}
                            <Box sx={{ mt: 3 }}>
                                <Typography variant="body2">Or continue with</Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1, gap: 2 }}>
                                    <IconButton>
                                        <Google color="primary" />
                                    </IconButton>
                                    <IconButton>
                                        <GitHub color="primary" />
                                    </IconButton>
                                    <IconButton>
                                        <Apple color="primary" />
                                    </IconButton>
                                </Box>
                            </Box>

                            {/* Toggle Prompt */}
                            <Box sx={{ mt: 3 }}>
                                {isLogin ? (
                                    <Typography variant="body2">
                                        Don't have an account?{' '}
                                        <span style={{ color: '#46F0F9', cursor: 'pointer' }} onClick={() => handleToggle('signup')}>
                                            Sign Up
                                        </span>
                                    </Typography>
                                ) : (
                                    <Typography variant="body2">
                                        Already have an account?{' '}
                                        <span style={{ color: '#46F0F9', cursor: 'pointer' }} onClick={() => handleToggle('login')}>
                                            Login
                                        </span>
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                    </motion.div>
                </AnimatePresence>
                {/* Lazy Component */}
            </Box>
        </Box>
    );
}

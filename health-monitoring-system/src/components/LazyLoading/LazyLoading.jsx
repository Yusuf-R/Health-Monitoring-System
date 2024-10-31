'use client';
import Box from "@mui/material/Box";
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import HashLoader from "react-spinners/HashLoader";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme, keyframes } from "@mui/material/styles";

function LazyLoading() {
    const theme = useTheme();
 // Breakpoints as defined before
 const xSmall = useMediaQuery(theme.breakpoints.down("xs"));
 const small = useMediaQuery(theme.breakpoints.down("sm"));
 const medium = useMediaQuery(theme.breakpoints.down("md"));
 const large = useMediaQuery(theme.breakpoints.down("lg"));
 const xLarge = useMediaQuery(theme.breakpoints.down("xl"));
 const xxLarge = useMediaQuery(theme.breakpoints.down("xxl"));
 const ultraWide = useMediaQuery(theme.breakpoints.down("xxxxl"));

    // Dynamically adjust loader size and font size based on screen size
    const loaderSize = xSmall || small ? 35 : medium || large ? 45 : 55;
    const fontSize = xSmall || small ? '1rem' : medium || large ? '1.5rem' : '2rem';
    return (
        <>
            <Box
                sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',  // Semi-transparent background

                }}
            >
               <Stack direction="row" spacing={2} alignItems="center">
                    <Typography variant='h5'
                                sx={{
                                    fontWeight: 'bold',
                                    color: '#FFF',
                                    fontSize: fontSize,  // Responsive font size
                                }}>
                        Loading
                    </Typography>
                    <HashLoader color="#07ebf1" size={loaderSize}/> {/* Responsive loader size */}
                </Stack>
            </Box>
        </>
   )
}

export default LazyLoading

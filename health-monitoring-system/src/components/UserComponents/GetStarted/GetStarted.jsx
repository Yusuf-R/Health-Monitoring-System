'use client';

import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";


function GetStarted () {
    return (
        <>
            <Box sx={{ padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#F2F2F2' }}>
                <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#000000' }}>
                    Get started with Health Monitoring System
                </Typography>
            </Box>

        </>
    )
}

export default GetStarted;
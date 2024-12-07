"use client";
import TopNav from "@/components/HealthWorkerComponents/TopNav/TopNav";
import Box from "@mui/material/Box";
import {useTheme} from "@mui/material/styles";
import {useCallback, useEffect, useState} from "react";
import useMediaQuery from "@mui/material/useMediaQuery";
import SideNav from "@/components/HealthWorkerComponents/SideNav/SideNav";
import {useRouter} from "next/navigation";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import AdminUtils from "@/utils/AdminUtils";
import LazyLoading from "@/components/LazyLoading/LazyLoading";
import {doc, getDoc, setDoc, serverTimestamp, updateDoc} from "firebase/firestore";
import {db} from "@/server/db/fireStore";
import {toast} from 'sonner';

function HealthWorkerLayout({children}) {
    const router = useRouter();
    const theme = useTheme();

    const isMediumScreen = useMediaQuery(theme.breakpoints.down("md"));
    const [navState, setNavState] = useState("full"); // "full", "icon", "hidden"

    const queryClient = useQueryClient();
    const {healthWorkerProfile} = queryClient.getQueryData(["HealthWorkerData"]) || {};

    const {data, isLoading, isError} = useQuery({
        queryKey: ["HealthWorkerData"],
        queryFn: AdminUtils.healthWorkerProfile,
        staleTime: Infinity,
        enabled: !healthWorkerProfile,
    });

    const effectiveHealthWorkerData = healthWorkerProfile || data;

    useEffect(() => {
        if (!effectiveHealthWorkerData) {
            return;
        }

        const storeHealthWorkerData = async () => {
            if (!effectiveHealthWorkerData || !effectiveHealthWorkerData._id) {
                console.error('Invalid effective health worker data:', effectiveHealthWorkerData);
                return;
            }

            const healthWorkerRef = doc(db, "healthWorkers", effectiveHealthWorkerData._id);
            try {
                const healthWorkerDoc = await getDoc(healthWorkerRef);

                if (!healthWorkerDoc.exists()) {
                    console.log('Creating new health worker document...');
                    await setDoc(healthWorkerRef, {
                        healthWorkerId: effectiveHealthWorkerData._id,
                        email: effectiveHealthWorkerData.email,
                        status: 'online',
                        role: effectiveHealthWorkerData.role,
                        lastActive: serverTimestamp(),
                        updatedAt: serverTimestamp(),
                    }, {merge: true});
                } else {
                    console.log('Updating existing health worker document...');
                    await setDoc(healthWorkerRef, {
                        status: 'online',
                        lastActive: serverTimestamp(),
                        updatedAt: serverTimestamp(),
                    }, {merge: true});
                }
            } catch (error) {
                console.error('Error storing health worker data:', error);
            }
        };

        storeHealthWorkerData();
    }, [effectiveHealthWorkerData]);

    useEffect(() => {
        if (!effectiveHealthWorkerData?.email || !effectiveHealthWorkerData?._id) {
          return;
        }

        const healthWorkerRef = doc(db, "healthWorkers", effectiveHealthWorkerData._id);

        const updateOnlineStatus = async () => {
            try {
                const healthWorkerRef = doc(db, "healthWorkers", effectiveHealthWorkerData._id);
                const healthWorkerDoc = await getDoc(healthWorkerRef);

                if (!healthWorkerDoc.exists()) {
                    console.warn('No document found for health worker ID:', effectiveHealthWorkerData._id);
                    await setDoc(healthWorkerRef, {
                        healthWorkerId: effectiveHealthWorkerData._id,
                        email: effectiveHealthWorkerData.email,
                        status: 'online',
                        createdAt: serverTimestamp(),
                        lastActive: serverTimestamp(),
                        updatedAt: serverTimestamp(),
                    });
                    console.log('Document created during update process.');
                }

                await updateDoc(healthWorkerRef, {
                    status: 'online',
                    name: effectiveHealthWorkerData.firstName || '' ,
                    firstName: effectiveHealthWorkerData.firstName || '',
                    lastName: effectiveHealthWorkerData.lastName || '',
                    lastActive: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                });
                console.log('Online status updated successfully.');
            } catch (error) {
                console.error('Error updating online status:', error?.message || 'Unknown error');
                toast.error('Failed to update online status');
            }
        };

        const setupOfflineStatus = async () => {
            try {
                await updateDoc(healthWorkerRef, {
                    status: 'offline',
                    lastActive: serverTimestamp(),
                    updatedAt: serverTimestamp()
                });
            } catch (error) {
                console.error('Error updating offline status:', error?.message || 'Unknown error');
            }
        };

        // Update status to online when component mounts
        updateOnlineStatus();

        // Set up cleanup for page unload
        const handleBeforeUnload = () => {
            setupOfflineStatus();
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        // Cleanup function
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            setupOfflineStatus();
        };
    }, [effectiveHealthWorkerData?.email, effectiveHealthWorkerData?._id]);

    if (isLoading) {
        return <LazyLoading/>;
    }

    if (isError || !data) {
        router.push("/error/e401");
    }

    const sideNavWidth = navState === "full" ? 250 : navState === "icon" ? 80 : 0;
    return (
        <Box
            sx={{
                display: "flex",
                height: "100vh",
                width: "100vw",
                overflow: "hidden",
                position: "relative",
            }}
        >
            {/* Side Navigation */}
            <Box
                sx={{
                    width: sideNavWidth,
                    transition: "width 0.3s",
                    background: "linear-gradient(to bottom, #1e3c72, #2a5298)",
                    overflow: "hidden",
                    flexShrink: 0, // Prevent shrinking of the side navigation
                }}
            >
                <SideNav navState={navState} activeRoute={router.pathname}/>
            </Box>

            {/* Main Content Wrapper */}
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                    minWidth: 0, // Prevent content overflow
                    overflow: "hidden",
                }}
            >
                {/* Top Navigation */}
                <Box
                    sx={{
                        flexShrink: 0,
                        background: "#2a5298",
                        zIndex: 10,
                    }}
                >
                    <TopNav
                        onToggleSideNav={() =>
                            setNavState((prevState) =>
                                prevState === "full"
                                    ? "icon"
                                    : prevState === "icon"
                                        ? "hidden"
                                        : "full"
                            )
                        }
                        navState={navState}
                        healthWorkerProfile={effectiveHealthWorkerData}
                    />
                </Box>

                {/* Main Content */}
                <Box
                    sx={{
                        flex: 1,
                        padding: "2px",
                        overflowY: "auto", // Vertical scrolling for the main content
                        background: "Linear-gradient(to right, #1e3c72, #2a5298)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px", // Add space between children
                    }}
                >
                    {children}
                </Box>
            </Box>
        </Box>
    );
}

export default HealthWorkerLayout;

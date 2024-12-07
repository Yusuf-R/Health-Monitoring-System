"use client";
import TopNav from "@/components/UserComponents/TopNav/TopNav";
import Box from "@mui/material/Box";
import {useTheme} from "@mui/material/styles";
import {useCallback, useEffect, useState} from "react";
import useMediaQuery from "@mui/material/useMediaQuery";
import SideNav from "@/components/UserComponents/SideNav/SideNav";
import {useRouter} from "next/navigation";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import AdminUtils from "@/utils/AdminUtils";
import LazyLoading from "@/components/LazyLoading/LazyLoading";
import {ActivityLoggerService} from "@/utils/ActivityLoggerService";
import {doc, getDoc, setDoc, updateDoc, serverTimestamp} from "firebase/firestore";
import {db} from "@/server/db/fireStore";
import {toast} from "sonner";

function UserLayout({children}) {
    const router = useRouter();
    const theme = useTheme();

    const isMediumScreen = useMediaQuery(theme.breakpoints.down("md"));
    const [navState, setNavState] = useState("full"); // "full", "icon", "hidden"

    const queryClient = useQueryClient();
    const {userProfile} = queryClient.getQueryData(["UserData"]) || {};

    const {data, isLoading, isError} = useQuery({
        queryKey: ["UserData"],
        queryFn: AdminUtils.userProfile,
        staleTime: Infinity,
        enabled: !userProfile,
    });

    const effectiveUserData = userProfile || data;

    const encryptAndStoreData = useCallback(async () => {
        try {
            if (effectiveUserData) {
                await AdminUtils.encryptAndStoreProfile(effectiveUserData);
            }
        } catch (error) {
            console.error("Encryption Error:", error);
        }
    }, [effectiveUserData]);

    // Check for daily activity logging
    useEffect(() => {
        const checkDailyActivity = async () => {
            if (effectiveUserData?._id) {
                await ActivityLoggerService.checkAndSendDailyLoggerNotification(effectiveUserData._id);
            }
        };
        checkDailyActivity();
    }, [effectiveUserData?._id]);

    useEffect(() => {
        encryptAndStoreData();
    }, [encryptAndStoreData]);

    useEffect(() => {
        if (!effectiveUserData) {
            return;
        }

        const storeUserData = async () => {
            if (!effectiveUserData || !effectiveUserData._id) {
                console.error('Invalid effective user data:', effectiveUserData);
                return;
            }

            const userRef = doc(db, "users", effectiveUserData._id);
            try {
                const userDoc = await getDoc(userRef);

                if (!userDoc.exists()) {
                    console.log('Creating new user document...');
                    await setDoc(userRef, {
                        userId: effectiveUserData._id,
                        email: effectiveUserData.email,
                        status: 'online',
                        role: effectiveUserData.role,
                        notificationPreferences: {
                            news: true,
                            feeds: true,
                            tipsGuides: true,
                            categories: [], // User can customize later
                            email: true,
                            scope: {
                                personal: true,
                                lga: true,
                                state: true,
                                national: true
                            },
                            push: true
                        },
                        lastActive: serverTimestamp(),
                        updatedAt: serverTimestamp(),
                    }, {merge: true});
                } else {
                    console.log('Updating existing user document...');
                    await setDoc(userRef, {
                        status: 'online',
                        firstName: effectiveUserData.firstName || '',
                        lastName: effectiveUserData.lastName || '',
                        lastActive: serverTimestamp(),
                        updatedAt: serverTimestamp(),
                    }, {merge: true});
                }
            } catch (error) {
                console.error('Error storing user data:', error);
                toast.error('Failed to update status');
            }
        };
        storeUserData();
    }, [effectiveUserData]);

    useEffect(() => {
        if (!effectiveUserData?.email || !effectiveUserData?._id) {
          return;
        }

        const userRef = doc(db, "users", effectiveUserData._id);

        const updateOnlineStatus = async () => {
            try {
                const userRef = doc(db, "users", effectiveUserData._id);
                const userDoc = await getDoc(userRef);

                if (!userDoc.exists()) {
                    console.warn('No document found for user ID:', effectiveUserData._id);
                    await setDoc(userRef, {
                        userId: effectiveUserData._id,
                        email: effectiveUserData.email,
                        status: 'online',
                        createdAt: serverTimestamp(),
                        lastActive: serverTimestamp(),
                        updatedAt: serverTimestamp(),
                    });
                    console.log('Document created during update process.');
                }

                await updateDoc(userRef, {
                    status: 'online',
                    name: effectiveUserData.firstName || '',
                    firstName: effectiveUserData.firstName || '',
                    lastName: effectiveUserData.lastName || '',
                    lga: effectiveUserData.currlga || '',
                    state: effectiveUserData.stateOfResidence || '',
                    country: effectiveUserData.country || 'Nigeria',
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
                await updateDoc(userRef, {
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
    }, [effectiveUserData?.email, effectiveUserData?._id]);

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
                overflow: "hidden", // Prevent horizontal scrolling
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
                        userProfile={effectiveUserData}
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

export default UserLayout;

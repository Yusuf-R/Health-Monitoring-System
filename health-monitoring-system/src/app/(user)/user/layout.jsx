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
import {doc, getDoc, setDoc} from "firebase/firestore";
import {db} from "@/server/db/fireStore";

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
        const storeUserData = async () => {
            if (!effectiveUserData) {
                return;
            }

            try {
                // Reference to the user document using user.uid from Firebase Auth
                const userRef = doc(db, "users", effectiveUserData._id);

                // Check if user document already exists
                const userDoc = await getDoc(userRef);

                if (!userDoc.exists()) {
                    // Only create if doesn't exist
                    await setDoc(userRef, {
                        userId: effectiveUserData._id,
                        email: effectiveUserData.email,
                        role: effectiveUserData?.role,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        notificationPreferences: {
                            news: true,
                            feeds: true,
                            tipsGuides: true,
                            categories: [], // User can customize later
                            email: true,
                            push: true
                        },
                        lastActive: new Date()
                    }, {merge: true});
                } else {
                    // Update lastActive timestamp
                    await setDoc(userRef, {
                        lastActive: new Date(),
                        updatedAt: new Date()
                    }, {merge: true});
                }
            } catch (error) {
                console.error('Error storing user data:', error);
            }
        };

        storeUserData();
    }, [effectiveUserData]);

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

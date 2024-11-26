'use client';

import { useEffect, useState, useCallback, lazy, Suspense } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import AdminUtils from "@/utils/AdminUtils";
import LazyLoading from "@/components/LazyLoading/LazyLoading";
import { useRouter } from "next/navigation";

// Lazy-loaded profile component
const Profile = lazy(() => import("@/components/UserComponents/UserProfile/Profile/Profile"));

function UserProfile() {
    const router = useRouter();
    const queryClient = useQueryClient();

    // Retrieve cached user profile
    const { userProfile } = queryClient.getQueryData(["UserData"]) || {};

    // Fetch user profile if not already cached
    const { data, isLoading, isError } = useQuery({
        queryKey: ["UserData"],
        queryFn: AdminUtils.userProfile,
        staleTime: Infinity,
        enabled: !userProfile, // Skip if profile exists
    });

    // Effective user data (cached or fetched)
    const effectiveUserData = userProfile || data;

    // Encrypt and store profile data
    const encryptAndStoreData = useCallback(async () => {
        if (effectiveUserData) {
            try {
                await AdminUtils.encryptAndStoreProfile(effectiveUserData);
            } catch (error) {
                console.error("Encryption Error:", error);
            }
        }
    }, [effectiveUserData]);

    // Perform encryption and storage on data update
    useEffect(() => {
        encryptAndStoreData();
    }, [encryptAndStoreData]);

    // Handle loading state
    if (isLoading) {
        return <LazyLoading />;
    }

    // Handle error state
    if (isError || !data) {
        console.error("Error fetching user profile.");
        return (
            <div style={{ textAlign: "center", marginTop: "20px" }}>
                <p>An error occurred while loading your profile. Please try again.</p>
                <button
                    onClick={() => router.push("/")}
                    style={{
                        padding: "10px 20px",
                        border: "none",
                        backgroundColor: "#FF6A88",
                        color: "#FFF",
                        borderRadius: "5px",
                        cursor: "pointer",
                    }}
                >
                    Go Home
                </button>
            </div>
        );
    }

    // Render user profile with fallback
    return (
        <Suspense fallback={<LazyLoading />}>
            <Profile userProfile={effectiveUserData} />
        </Suspense>
    );
}

export default UserProfile;

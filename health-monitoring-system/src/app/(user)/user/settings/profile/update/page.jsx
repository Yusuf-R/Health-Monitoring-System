'use client';

import { useEffect, useState, useCallback, lazy, Suspense } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import AdminUtils from "@/utils/AdminUtils";
import LazyLoading from "@/components/LazyLoading/LazyLoading";
import { useRouter } from "next/navigation";
import DataFetchError from "@/components/Errors/DataFetchError/DataFetchError";

// Lazy-loaded update profile component
const UpdateProfile = lazy(() => import("@/components/UserComponents/UserProfile/UpdateProfile/UpdateProfile"));

function UpdateUserProfile() {
    const router = useRouter();
    const queryClient = useQueryClient();

    // Retrieve cached user profile
    const { userProfile } = queryClient.getQueryData(["UserData"]) || {};

    // Fetch user profile if not already cached
    const { data, isLoading, isError } = useQuery({
        queryKey: ["UserData"],
        queryFn: AdminUtils.userProfile,
        staleTime: Infinity,
        enabled: !userProfile, // Skip fetching if profile exists
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

    useEffect(() => {
        (async () => {
            await encryptAndStoreData();
        })(); // Immediately-invoked async function
    }, [encryptAndStoreData]);

    // Handle loading state
    if (isLoading) {
        return <LazyLoading />;
    }

    // Handle error state
    if (isError || !data) {
        return (
            <>
                <DataFetchError/>
            </>
        );
    }

    // Render update profile component with fallback
    return (
        <Suspense fallback={<LazyLoading />}>
            <UpdateProfile userProfile={effectiveUserData} />
        </Suspense>
    );
}

export default UpdateUserProfile;

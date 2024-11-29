'use client';

import { useEffect, useState, useCallback, lazy, Suspense } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import AdminUtils from "@/utils/AdminUtils";
import LazyLoading from "@/components/LazyLoading/LazyLoading";
import { useRouter } from "next/navigation";
import DataFetchError from "@/components/Errors/DataFetchError/DataFetchError";

// Lazy-loaded update profile component
const Avatar = lazy(() => import("@/components/HealthWorkerComponents/Settings/HealthWorkerProfile/Avatar/Avatar"));

function UserAvatar () {
    const router = useRouter();
    const queryClient = useQueryClient();

    // Retrieve cached user profile
    const { healthWorkerProfile } = queryClient.getQueryData(["HealthWorkerData"]) || {};

    // Fetch user profile if not already cached
    const { data, isLoading, isError } = useQuery({
        queryKey: ["HealthWorkerData"],
        queryFn: AdminUtils.healthWorkerProfile,
        staleTime: Infinity,
        enabled: !healthWorkerProfile, // Skip fetching if profile exists
    });

    // Effective user data (cached or fetched)
    const effectiveUserData = healthWorkerProfile || data;

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
            <Avatar healthWorkerProfile={effectiveUserData} />
        </Suspense>
    );
}

export default UserAvatar;

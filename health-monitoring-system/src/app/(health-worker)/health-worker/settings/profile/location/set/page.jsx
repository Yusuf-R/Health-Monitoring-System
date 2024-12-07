'use client';

import { useEffect, useState, useCallback, lazy, Suspense } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import AdminUtils from "@/utils/AdminUtils";
import LazyLoading from "@/components/LazyLoading/LazyLoading";
import DataFetchError from "@/components/Errors/DataFetchError/DataFetchError";

// Lazy-loaded set location component
const SetLocation = lazy(() => import("@/components/HealthWorkerComponents/Settings/HealthWorkerProfile/Location/SetLocation/SetLocation"));

function SetHealthWorkerLocation() {
    const queryClient = useQueryClient();

    // Retrieve cached health worker profile
    const { healthWorkerProfile } = queryClient.getQueryData(["HealthWorkerData"]) || {};

    // Fetch health worker profile if not already cached
    const { data, isLoading, isError } = useQuery({
        queryKey: ["HealthWorkerData"],
        queryFn: AdminUtils.healthWorkerProfile,
        staleTime: Infinity,
        enabled: !healthWorkerProfile, // Skip fetching if profile exists
    });

    // Effective user data (cached or fetched)
    const effectiveHealthWorkerData = healthWorkerProfile || data;

    // Encrypt and store profile data
    const encryptAndStoreData = useCallback(async () => {
        if (effectiveHealthWorkerData) {
            try {
                await AdminUtils.encryptAndStoreProfile(effectiveHealthWorkerData);
            } catch (error) {
                console.error("Encryption Error:", error);
            }
        }
    }, [effectiveHealthWorkerData]);

    useEffect(() => {
        (async () => {
            await encryptAndStoreData();
        })();
    }, [encryptAndStoreData]);

    // Handle loading state
    if (isLoading) {
        return <LazyLoading />;
    }

    // Handle error state
    if (isError || !data) {
        return <DataFetchError />;
    }

    // Render set location component with fallback
    return (
        <Suspense fallback={<LazyLoading />}>
            <SetLocation healthWorkerProfile={effectiveHealthWorkerData} />
        </Suspense>
    );
}

export default SetHealthWorkerLocation;

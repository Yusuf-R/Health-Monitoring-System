'use client';

import { useEffect, useState, useCallback, lazy, Suspense } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import AdminUtils from "@/utils/AdminUtils";
import LazyLoading from "@/components/LazyLoading/LazyLoading";
import { useRouter } from "next/navigation";
import DataFetchError from "@/components/Errors/DataFetchError/DataFetchError";
import useLocationStore from "@/store/useLocationStore";

// Lazy-loaded update profile component
const EditLocation = lazy(() => import("@/components/UserComponents/UserProfile/Location/EditLocation/EditLocation"));

function EditUserLocation() {
    const queryClient = useQueryClient();

    // Retrieve cached user profile
    const { userProfile } = queryClient.getQueryData(["UserData"]) || {};
    const { geoId } = useLocationStore();

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
    if (isError || !data || !geoId) {
        return (
            <>
                <DataFetchError/>
            </>
        );
    }


    // Render update profile component with fallback
    return (
        <Suspense fallback={<LazyLoading />}>
            <EditLocation userProfile={effectiveUserData} geoId={geoId} />
        </Suspense>
    );
}

export default EditUserLocation;
'use client';

import { lazy, Suspense } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import AdminUtils from "@/utils/AdminUtils";
import LazyLoading from "@/components/LazyLoading/LazyLoading";
import DataFetchError from "@/components/Errors/DataFetchError/DataFetchError";
import useLocationStore from "@/store/useLocationStore";

// Lazy-loaded edit location component
const EditLocation = lazy(() => import("@/components/HealthWorkerComponents/Settings/HealthWorkerProfile/Location/EditLocation/EditLocation"));

function EditHealthWorkerLocation() {
    const queryClient = useQueryClient();
    const { geoId } = useLocationStore();

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
    const effectiveUserData = healthWorkerProfile || data;

    // Handle loading state
    if (isLoading) {
        return <LazyLoading />;
    }

    // Handle error state
    if (isError || !data || !geoId) {
        return <DataFetchError />;
    }

    // Render edit location component with fallback
    return (
        <Suspense fallback={<LazyLoading />}>
            <EditLocation healthWorkerProfile={effectiveUserData} geoId={geoId} />
        </Suspense>
    );
}

export default EditHealthWorkerLocation;

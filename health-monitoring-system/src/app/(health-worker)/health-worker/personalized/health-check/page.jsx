'use client';
import {useQuery, useQueryClient} from "@tanstack/react-query";
import AdminUtils from "@/utils/AdminUtils";
import LazyLoading from "@/components/LazyLoading/LazyLoading";
import {lazy, Suspense} from "react";
import DataFetchError from "@/components/Errors/DataFetchError/DataFetchError";
import HealthCheck from "@/components/HealthWorkerComponents/HealthInsights/HealthCheck/HealthCheck";


function UserHealthCheck() {
    const queryClient = useQueryClient();

    // Retrieve cached user profile
    const {healthWorkerProfile} = queryClient.getQueryData(["HealthWorkerData"]) || {};

    // Fetch user profile if not already cached
    const {data, isLoading, isError} = useQuery({
        queryKey: ["HealthWorkerData"],
        queryFn: AdminUtils.healthWorkerProfile,
        staleTime: Infinity,
        enabled: !healthWorkerProfile, // Skip fetching if profile exists
    });

    // Effective user data (cached or fetched)
    const effectiveHealthWorkerData = healthWorkerProfile || data;

    // Handle loading state
    if (isLoading) {
        return <LazyLoading/>;
    }

    // Handle error state
    if (isError || !data) {
        return (
            <>
                <Suspense fallback={<LazyLoading/>}>
                    <DataFetchError/>
                </Suspense>
            </>
        );
    }
    return (
        <>
            <Suspense fallback={<LazyLoading/>}>
                <HealthCheck healthWorkerProfile={effectiveHealthWorkerData}/>
            </Suspense>
        </>
    )
}

export default UserHealthCheck;
'use client';
import {useQuery, useQueryClient} from "@tanstack/react-query";
import AdminUtils from "@/utils/AdminUtils";
import LazyLoading from "@/components/LazyLoading/LazyLoading";
import {lazy, Suspense} from "react";
import DataFetchError from "@/components/Errors/DataFetchError/DataFetchError";

const Feeds = lazy(() => import("@/components/HealthWorkerComponents/NewsHub/Feeds/Feeds"));

function InfoFeeds() {
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
                <Feeds healthWorkerProfile={effectiveHealthWorkerData}/>
            </Suspense>
        </>
    )
}

export default InfoFeeds;
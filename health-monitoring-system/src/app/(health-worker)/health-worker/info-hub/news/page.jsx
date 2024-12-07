'use client';
import {useQuery, useQueryClient} from "@tanstack/react-query";
import AdminUtils from "@/utils/AdminUtils";
import LazyLoading from "@/components/LazyLoading/LazyLoading";
import {Suspense} from "react";
import dynamic from "next/dynamic"
import ErrorBoundary from "@/components/Errors/ErrorBoundary/ErrorBoundary";
import DataFetchError from "@/components/Errors/DataFetchError/DataFetchError";

const NewsCentral = dynamic(() =>
    import("@/components/HealthWorkerComponents/NewsHub/NewsCentral/NewsCentral"), {
    suspense: true,
});

function NewsHub() {
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
                <ErrorBoundary>
                    <NewsCentral healthWorkerProfile={effectiveHealthWorkerData}/>
                </ErrorBoundary>
            </Suspense>
        </>
    )
}

export default NewsHub;
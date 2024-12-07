'use client';
import FullArticle from "@/components/HealthWorkerComponents/NewsHub/NewsCentral/FullArticle/FullArticle";
import {useParams} from "next/navigation";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import AdminUtils from "@/utils/AdminUtils";
import LazyLoading from "@/components/LazyLoading/LazyLoading";
import {Suspense} from "react";
import DataFetchError from "@/components/Errors/DataFetchError/DataFetchError";


function FullArticlePage() {
    const queryClient = useQueryClient();
    const {id} = useParams(); // Use `useParams` hook for dynamic routes

    // Retrieve cached health worker profile
    const {healthWorkerProfile} = queryClient.getQueryData(["HealthWorkerData"]) || {};

    // Fetch health worker profile if not already cached
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
                <FullArticle id={id} healthWorkerProfile={effectiveHealthWorkerData}/>
            </Suspense>
        </>
    )
}

export default FullArticlePage;

'use client';
import {useParams} from "next/navigation";
import FullHealthCheck from "@/components/UserComponents/HealthInsights/HealthCheck/FullHealthCheck/FullHealthCheck";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import AdminUtils from "@/utils/AdminUtils";
import LazyLoading from "@/components/LazyLoading/LazyLoading";
import {Suspense} from "react";
import DataFetchError from "@/components/Errors/DataFetchError/DataFetchError";


function FullHealthCheckPage() {
    const queryClient = useQueryClient();
    const {id} = useParams(); // Use `useParams` hook for dynamic routes
    // Retrieve cached user profile
    const {userProfile} = queryClient.getQueryData(["UserData"]) || {};

    // Fetch user profile if not already cached
    const {data, isLoading, isError} = useQuery({
        queryKey: ["UserData"],
        queryFn: AdminUtils.userProfile,
        staleTime: Infinity,
        enabled: !userProfile, // Skip fetching if profile exists
    });

    // Effective user data (cached or fetched)
    const effectiveUserData = userProfile || data;

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
                <FullHealthCheck userProfile={effectiveUserData} id={id}/>
            </Suspense>
        </>

    )
}

export default FullHealthCheckPage;

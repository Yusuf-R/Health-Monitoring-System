'use client';
import {useQuery, useQueryClient} from "@tanstack/react-query";
import AdminUtils from "@/utils/AdminUtils";
import LazyLoading from "@/components/LazyLoading/LazyLoading";
import {lazy, Suspense} from "react";
import DataFetchError from "@/components/Errors/DataFetchError/DataFetchError";

const Feeds = lazy(() => import("@/components/UserComponents/NewsHub/Feeds/Feeds"));

function InfoFeeds() {
    const queryClient = useQueryClient();

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
                <Feeds userProfile={effectiveUserData}/>
            </Suspense>
        </>
    )
}

export default InfoFeeds;
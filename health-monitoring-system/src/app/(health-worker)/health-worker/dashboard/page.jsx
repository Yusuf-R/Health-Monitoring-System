'use client';

import { Suspense, useCallback, useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import AdminUtils from "@/utils/AdminUtils";
import LazyLoading from "@/components/LazyLoading/LazyLoading";
import DataFetchError from "@/components/Errors/DataFetchError/DataFetchError";
import Dashboard from "@/components/HealthWorkerComponents/Dashboard/Dashboard";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

function HealthWorkerDashboard() {
    const queryClient = useQueryClient();
    const router = useRouter();
    const [decryptedProfile, setDecryptedProfile] = useState(null);

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

    // Handle location check for health worker
    const handleLocationCheck = useCallback((profile) => {
        const hasValidLocation = profile?.geoLocation && profile.geoLocation.length > 0 && profile.address;
        if (!hasValidLocation) {
            toast.info('Redirecting to finish your profile setup...');
            toast.info('Please set up your locations to proceed.');
            router.push("/health-worker/get-started"); // Redirect to location setup page
        } else {
            setDecryptedProfile(profile); // Set decrypted profile for Dashboard
        }
    }, [router]);

    useEffect(() => {
        (async () => {
            if (effectiveHealthWorkerData) {
                await encryptAndStoreData(); // Encrypt and store data
                handleLocationCheck(effectiveHealthWorkerData); // Perform location check
            }
        })(); // Immediately-invoked async function
    }, [encryptAndStoreData, effectiveHealthWorkerData, handleLocationCheck]);

    // Handle loading state
    if (isLoading) {
        return <LazyLoading />;
    }

    // Handle error state
    if (isError || !data) {
        return (
            <>
                <DataFetchError />
            </>
        );
    }

    // Render the dashboard
    return (
        <Suspense fallback={<LazyLoading />}>
            <Dashboard healthWorkerProfile={decryptedProfile}/>
        </Suspense>
    );
}

export default HealthWorkerDashboard;

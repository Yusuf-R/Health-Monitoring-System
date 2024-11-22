'use client';
import { lazy, useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import AdminUtils from "@/utils/AdminUtils";
import { userDataStore} from "@/store/profileDataStore";
import LazyLoading from "@/components/LazyLoading/LazyLoading";
import { toast } from 'sonner';

const Dashboard = lazy(() => import("@/components/UserComponents/DahsboardComponents/Dashboard/Dashboard"));

function UserHMSDashboard() {
    const [decryptedProfile, setDecryptedProfile] = useState(null);
    const { encryptedUserData, setEncryptedUserData } = userDataStore();
    const queryClient = useQueryClient();
    const router = useRouter();

    // Step 1: Check for the cached original client profile in TanStack
    const userProfile = queryClient.getQueryData(["UserData"]);

    useEffect(() => {
        async function fetchAndProcessData() {
            if (userProfile) {
                // Case 1: If original profile data is found in TanStack, use it directly
                handleLocationCheck(userProfile);
            } else if (encryptedUserData) {
                // Case 2: If not in TanStack, but encrypted data exists in Zustand, decrypt it
                try {
                    const decryptedData = await AdminUtils.dataDecryption(encryptedUserData);
                    queryClient.setQueryData(["UserData"], decryptedData); // Cache decrypted data in TanStack
                    handleLocationCheck(decryptedData);
                } catch (error) {
                    console.error("Decryption error:", error);
                    router.push('/error/e401'); // Navigate to error page
                }
            } else {
                // Case 3: If neither TanStack nor Zustand has data, fetch from backend
                try {
                    const response = await AdminUtils.userProfile();
                    const { userProfile: fetchedProfile } = response;

                    // encrypt data and store in Zustand
                    const newEncryptedData = await AdminUtils.encryptData(fetchedProfile);

                    // Cache both original and encrypted data
                    queryClient.setQueryData(["UserData"], fetchedProfile);
                    setEncryptedUserData(newEncryptedData);

                    handleLocationCheck(fetchedProfile);
                } catch (error) {
                    console.error("Fetching error:", error);
                    router.push('/error/e404'); // Navigate to error page
                }
            }
        }

        function handleLocationCheck(profile) {
            // Step 4: Check if the profile has saved locations
            const hasLocations = profile.email && profile.email.length > 0;
            if (!hasLocations) {
                // Redirect to Location Setup Page if no locations are found
                toast.info('Redirecting to location setup page...');
                toast.info('Please set up your locations to continue.');
                router.push("/user/get-started");
            } else {
                setDecryptedProfile(profile); // Set decrypted profile to load RideBookingMap
            }
        }

        fetchAndProcessData();
    }, [userProfile, encryptedUserData, queryClient, setEncryptedUserData, router]);

    // Show loading state while data is processed or redirecting
    if (!decryptedProfile) {
        return <LazyLoading />;
    }

    return (
        <Suspense fallback={<LazyLoading />}>
            <Dashboard userProfile={decryptedProfile} />
        </Suspense>
    );
}

export default UserHMSDashboard;

import {useEffect, useState} from 'react';
import {useQuery} from "@tanstack/react-query";
import AdminUtils from "@/utils/AdminUtils";

export function useAuthState() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // Get user data from your backend through AdminUtils
    const {data: effectiveUserData, isLoading, isError} = useQuery({
        queryKey: ['UserData'],
        queryFn: AdminUtils.userProfile,
        staleTime: Infinity,
    });

    useEffect(() => {
        setLoading(isLoading);
        setError(isError ? new Error('Failed to fetch user data') : null);
    }, [isLoading, isError]);

    return {
        user: effectiveUserData || null,
        loading,
        error,
        effectiveUserData
    };
}

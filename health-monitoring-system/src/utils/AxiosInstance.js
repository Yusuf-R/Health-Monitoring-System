import axios from "axios";
import { getSession } from "next-auth/react";
import AdminUtils from "@/utils/AdminUtils";

console.log(process.env.NEXT_PUBLIC_BACKEND_URL);
// Public Axios instance (no token needed)
export const axiosPublic = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

// Private Axios instance (for protected routes)
export const axiosPrivate = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

axiosPrivate.interceptors.request.use(
    async(config) => {
        try {
            const session = await getSession();
            if (!session) throw new Error("No active session.");
            const encryptedId = await AdminUtils.encryptUserId(session.user.id);
            config.headers.Authorization = `Bearer ${encryptedId}`;
            return config;
        } catch (error) {
            console.error("Error setting up private request:", error);
            throw error;
        }
    },
    (error) => Promise.reject(error)
);
import axios from "axios";
import { getSession } from "next-auth/react";
import AdminUtils from "@/utils/AdminUtils";

// public routes, login, register, about, contact, etc
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

// all protected routes api/v1/auth/user/...routes, api/v1/auth/health-worker/...routes , api/v1/auth/admin/...routes etc
axiosPrivate.interceptors.request.use(
    async(config) => {
        try {
            const session = await getSession();
            if (!session) throw new Error("No active session.");
            const encryptedId = await AdminUtils.encryptCredentials(session.user.id);
            config.headers.Authorization = `Bearer ${encryptedId}`;
            return config;
        } catch (error) {
            console.error("Error setting up private request:", error);
            throw error;
        }
    },
    (error) => Promise.reject(error)
);
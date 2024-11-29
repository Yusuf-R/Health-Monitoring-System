'use client';

import { lazy, Suspense } from "react";
import LazyLoading from "@/components/LazyLoading/LazyLoading";

// Lazy-loaded location landing page component
const LandingPage = lazy(() => import("@/components/HealthWorkerComponents/Settings/HealthWorkerProfile/Location/LandingPage/LandingPage"));

function HealthWorkerLocation() {
    return (
        <Suspense fallback={<LazyLoading />}>
            <LandingPage />
        </Suspense>
    );
}

export default HealthWorkerLocation;
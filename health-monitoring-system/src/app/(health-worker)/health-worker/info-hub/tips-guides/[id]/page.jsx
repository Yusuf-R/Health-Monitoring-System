'use client';
import { useParams } from "next/navigation";
import FullTipsAndGuides from "@/components/HealthWorkerComponents/NewsHub/TipsAndGuides/FullTipsAndGuides/FullTipsAndGuides";


function FullTipsGuidesPage() {
    const { id } = useParams(); // Use `useParams` hook for dynamic routes

    return <FullTipsAndGuides id={id} />;
}

export default FullTipsGuidesPage;

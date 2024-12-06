'use client';
import FullFeed from "@/components/HealthWorkerComponents/NewsHub/Feeds/FullFeed/FullFeed";
import { useParams } from "next/navigation";


function FullFeedPage() {
    const { id } = useParams(); // Use `useParams` hook for dynamic routes

    return <FullFeed id={id} />;
}

export default FullFeedPage;

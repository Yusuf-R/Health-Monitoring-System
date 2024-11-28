'use client';
import ReadMessage from "@/components/UserComponents/Inbox/ReadMessage/ReadMessage";
import { useParams } from "next/navigation";

function ViewMessage() {
    const { id } = useParams(); // Use `useParams` hook for dynamic routes
    return (
        <>
            <ReadMessage id={id} />
        </>
    )
}

export default ViewMessage;

'use client';
import FullArticle from "@/components/UserComponents/NewsHub/NewsCentral/FullArticle/FullArticle";
import { useParams } from "next/navigation";


function FullArticlePage() {
  const { id } = useParams(); // Use `useParams` hook for dynamic routes

  return <FullArticle id={id} />;
}

export default FullArticlePage;

import { useRouter } from 'next/navigation';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/server/db/fireStore';
import { toast } from 'sonner';
import { NotificationManager } from '@/utils/notificationManager';

export const useNewsForm = (healthWorkerProfile) => {
    const router = useRouter();

    const handleSubmit = async (formData, initialData = null) => {
        try {
            const newsData = {
                title: formData.title,
                snippet: formData.snippet,
                content: formData.content,
                category: formData.category,
                scope: {
                    state: formData.state,
                    lga: formData.lga,
                    country: formData.country
                },
                author: {
                    id: healthWorkerProfile._id,
                    name: healthWorkerProfile.name,
                    image: healthWorkerProfile.image
                }
            };

            if (initialData?.id) {
                // Update existing news
                const newsRef = doc(db, 'news', initialData.id);
                await updateDoc(newsRef, {
                    ...newsData,
                    updatedAt: serverTimestamp()
                });
                toast.success('News updated successfully!');
            } else {
                // Create new news
                const newsRef = collection(db, 'news');
                const docRef = await addDoc(newsRef, {
                    ...newsData,
                    timestamp: serverTimestamp(),
                    createdAt: serverTimestamp()
                });

                // Create notification for new news
                const notificationManager = new NotificationManager();
                await notificationManager.createNotification({
                    type: "NEWS",
                    scope: formData.visibility || "all",
                    title: `New Health News: ${formData.title}`,
                    message: formData.snippet,
                    metadata: {
                        newsId: docRef.id
                    }
                });

                toast.success('News published successfully!');
            }

            router.push('/health-worker/info-hub/news');
        } catch (error) {
            console.error('Error with news:', error);
            toast.error(initialData?.id ? 'Failed to update news' : 'Failed to publish news');
        }
    };

    return {
        handleSubmit
    };
};

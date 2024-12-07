import { useRouter } from 'next/navigation';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/server/db/fireStore';
import { toast } from 'sonner';
import { NotificationManager } from '@/utils/notificationManager';

export const useFeedForm = (healthWorkerProfile) => {
    const router = useRouter();

    const handleSubmit = async (formData, initialData = null) => {
        try {
            const feedData = {
                title: formData.title,
                content: formData.content,
                type: formData.type,
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

            // Add type-specific data
            if (formData.type === 'polls') {
                feedData.pollOptions = formData.pollOptions;
                feedData.pollQuestion = formData.pollQuestion;
            } else if (formData.type === 'events') {
                feedData.eventDate = formData.eventDate;
                feedData.eventLocation = formData.eventLocation;
                feedData.eventTime = formData.eventTime;
            }

            if (initialData?.id) {
                // Update existing feed
                const feedRef = doc(db, 'feeds', initialData.id);
                await updateDoc(feedRef, {
                    ...feedData,
                    updatedAt: serverTimestamp()
                });
                toast.success('Feed updated successfully!');
            } else {
                // Create new feed
                const feedRef = collection(db, 'feeds');
                const docRef = await addDoc(feedRef, {
                    ...feedData,
                    timestamp: serverTimestamp(),
                    createdAt: serverTimestamp()
                });

                // Create notification for new feed
                const notificationManager = new NotificationManager();
                await notificationManager.createNotification({
                    type: "FEED",
                    scope: formData.visibility || "all",
                    title: `New Health Feed: ${formData.title}`,
                    message: formData.content,
                    metadata: {
                        feedId: docRef.id
                    }
                });

                toast.success('Feed published successfully!');
            }

            router.push('/health-worker/info-hub/feeds');
        } catch (error) {
            console.error('Error with feed:', error);
            toast.error(initialData?.id ? 'Failed to update feed' : 'Failed to publish feed');
        }
    };

    return {
        handleSubmit
    };
};

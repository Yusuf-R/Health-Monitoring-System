import { useMutation } from '@tanstack/react-query';
import { NotificationService } from '@/services/NotificationService';
import { ChatService } from '@/services/ChatService';

export const useHealthWorkerActions = (healthWorkerProfile) => {
    // Review a health request
    const reviewRequest = async ({ requestId, review, startChat = false }) => {
        try {
            // 1. Update request status in MongoDB
            const response = await fetch(`/api/medical-history/${requestId}`, {
                method: 'PATCH',
                body: JSON.stringify(review)
            });
            const updatedRequest = await response.json();

            // 2. Send notification to user
            await NotificationService.sendMedicalReviewNotification({
                userId: updatedRequest.userId,
                reviewerId: healthWorkerProfile._id,
                reviewerName: healthWorkerProfile.fullName,
                medicalHistoryId: requestId,
                message: review.message
            });

            // 3. Optionally start a chat session
            if (startChat) {
                const chatId = await ChatService.createChat({
                    participants: [
                        { 
                            userId: updatedRequest.userId, 
                            role: 'User',
                            name: updatedRequest.userName 
                        },
                        { 
                            userId: healthWorkerProfile._id, 
                            role: 'HealthWorker',
                            name: healthWorkerProfile.fullName 
                        }
                    ],
                    type: 'medical_consultation',
                    relatedTo: {
                        model: 'MedicalHistory',
                        id: requestId
                    }
                });

                return { ...updatedRequest, chatId };
            }

            return updatedRequest;
        } catch (error) {
            console.error('Error reviewing request:', error);
            throw error;
        }
    };

    // Send message in chat
    const sendMessage = async ({ chatId, content, attachments = [] }) => {
        try {
            return await ChatService.sendMessage({
                chatId,
                sender: {
                    id: healthWorkerProfile._id,
                    role: 'HealthWorker',
                    name: healthWorkerProfile.fullName
                },
                content,
                attachments
            });
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    };

    const reviewMutation = useMutation({
        mutationFn: reviewRequest
    });

    const messageMutation = useMutation({
        mutationFn: sendMessage
    });

    return {
        reviewRequest: reviewMutation.mutate,
        sendMessage: messageMutation.mutate,
        isReviewing: reviewMutation.isLoading,
        isSending: messageMutation.isLoading
    };
};

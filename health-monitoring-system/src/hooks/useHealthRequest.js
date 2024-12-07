import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { NotificationService } from '@/services/NotificationService';
import { ChatService } from '@/server/services/ChatService';

export const useHealthRequest = (userProfile) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Submit health check request
    const submitRequest = async (requestData) => {
        try {
            setIsSubmitting(true);
            
            // 1. Save to MongoDB
            const response = await fetch('/api/medical-history', {
                method: 'POST',
                body: JSON.stringify(requestData)
            });
            const savedRequest = await response.json();

            // 2. Create real-time notification for health workers
            await NotificationService.createNotification({
                userId: 'all_health_workers', // Special identifier for health worker group
                type: 'medical_review',
                title: 'New Health Check Request',
                message: `New request from ${userProfile.firstName}`,
                relatedTo: {
                    model: 'MedicalHistory',
                    id: savedRequest._id
                },
                priority: 'high',
                actionRequired: true,
                actionUrl: `/admin/medical-requests/${savedRequest._id}`
            });

            return savedRequest;
        } catch (error) {
            console.error('Error submitting request:', error);
            throw error;
        } finally {
            setIsSubmitting(false);
        }
    };

    // Get user's requests with real-time updates
    const { data: requests, isLoading } = useQuery({
        queryKey: ['medical-history', userProfile?._id],
        queryFn: async () => {
            const response = await fetch(`/api/users/${userProfile._id}/medical-history`);
            return response.json();
        },
        enabled: !!userProfile?._id
    });

    return {
        submitRequest,
        requests,
        isLoading,
        isSubmitting
    };
};

import { create } from 'zustand';

const useChatStore = create((set, get) => ({
    inChatView: false,
    unreadMessages: 0,
    activeChatId: null,
    messageNotifications: {}, // Store notifications by chatId

    setInChatView: (value) => set({ inChatView: value }),

    setActiveChatId: (chatId) => {
        set({ activeChatId: chatId });
        // Clear notifications for this chat when it becomes active
        if (chatId) {
            const notifications = get().messageNotifications;
            delete notifications[chatId];
            set({ messageNotifications: { ...notifications } });
            // Recalculate total unread messages
            const totalUnread = Object.values(notifications).reduce((sum, count) => sum + count, 0);
            set({ unreadMessages: totalUnread });
        }
    },

    addMessageNotification: (chatId) => {
        if (get().inChatView && get().activeChatId === chatId) {
            return; // Don't add notification if user is in the chat view
        }
        const notifications = get().messageNotifications;
        notifications[chatId] = (notifications[chatId] || 0) + 1;
        set({
            messageNotifications: { ...notifications },
            unreadMessages: get().unreadMessages + 1
        });
    },

    clearChatNotifications: (chatId) => {
        const notifications = get().messageNotifications;
        const clearedCount = notifications[chatId] || 0;
        delete notifications[chatId];
        set({
            messageNotifications: { ...notifications },
            unreadMessages: Math.max(0, get().unreadMessages - clearedCount)
        });
    },

    resetAllNotifications: () => {
        set({
            messageNotifications: {},
            unreadMessages: 0
        });
    }
}));

export { useChatStore };

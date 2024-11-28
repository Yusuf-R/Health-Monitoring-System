import {db} from '@/server/db/fireStore';
import {
    addDoc,
    collection,
    doc,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    where
} from 'firebase/firestore';
import NotificationService from './NotificationService';

class ChatService {
    static async createChat({participants, type, relatedTo}) {
        try {
            const chatRef = collection(db, 'chats');
            const chat = await addDoc(chatRef, {
                participants,
                type,
                relatedTo,
                status: 'active',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            // Notify all participants about the new chat
            participants.forEach(async (participant) => {
                if (participant.role === 'User') {
                    await NotificationService.createNotification({
                        userId: participant.userId,
                        type: 'chat_request',
                        title: 'New Chat Session',
                        message: `A healthcare professional has started a chat regarding your medical inquiry`,
                        relatedTo: {
                            model: 'Chat',
                            id: chat.id
                        },
                        priority: 'medium',
                        actionRequired: true,
                        actionUrl: `/chat/${chat.id}`
                    });
                }
            });

            return chat.id;
        } catch (error) {
            console.error('Error creating chat:', error);
            throw error;
        }
    }

    static async sendMessage({chatId, sender, content, attachments = []}) {
        try {
            const chatRef = doc(db, 'chats', chatId);
            const messagesRef = collection(chatRef, 'messages');

            const message = await addDoc(messagesRef, {
                sender,
                content,
                attachments,
                status: 'sent',
                timestamp: serverTimestamp()
            });

            // Update chat metadata
            await updateDoc(chatRef, {
                'metadata.lastMessage': {
                    content,
                    sender: sender.name,
                    timestamp: serverTimestamp()
                },
                updatedAt: serverTimestamp()
            });

            // Notify other participants
            const chat = await getDoc(chatRef);
            const participants = chat.data().participants;
            participants.forEach(async (participant) => {
                if (participant.userId !== sender.id) {
                    await NotificationService.createNotification({
                        userId: participant.userId,
                        type: 'message',
                        title: 'New Message',
                        message: `${sender.name}: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`,
                        relatedTo: {
                            model: 'Chat',
                            id: chatId
                        },
                        priority: 'medium',
                        actionUrl: `/chat/${chatId}`
                    });
                }
            });

            return message.id;
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    }

    static subscribeToChat(chatId, callback) {
        const chatRef = doc(db, 'chats', chatId);
        const messagesRef = collection(chatRef, 'messages');
        const q = query(messagesRef, orderBy('timestamp', 'asc'));

        return onSnapshot(q, (snapshot) => {
            const messages = [];
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    messages.push({
                        id: change.doc.id,
                        ...change.doc.data()
                    });
                }
            });

            if (messages.length > 0) {
                callback(messages);
            }
        });
    }

    static async markMessagesAsRead(chatId, userId) {
        try {
            const chatRef = doc(db, 'chats', chatId);
            const messagesRef = collection(chatRef, 'messages');
            const q = query(messagesRef, where('status', '==', 'sent'));

            const snapshot = await getDocs(q);
            const batch = writeBatch(db);

            snapshot.docs.forEach((doc) => {
                batch.update(doc.ref, {
                    status: 'read',
                    readBy: arrayUnion({
                        userId,
                        readAt: serverTimestamp()
                    })
                });
            });

            await batch.commit();
        } catch (error) {
            console.error('Error marking messages as read:', error);
            throw error;
        }
    }
}

export default ChatService;

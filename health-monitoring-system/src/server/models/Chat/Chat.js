import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const MessageSchema = new Schema({
    sender: {
        id: {
            type: Schema.Types.ObjectId,
            ref: 'CareBase',
            required: true
        },
        role: {
            type: String,
            enum: ['HealthWorker', 'User'],
            required: true
        },
        name: String
    },
    content: {
        type: String,
        required: true
    },
    attachments: [{
        type: {
            type: String,
            enum: ['image', 'document', 'voice'],
            required: true
        },
        url: String,
        name: String,
        size: Number
    }],
    readBy: [{
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'CareBase'
        },
        readAt: {
            type: Date,
            default: Date.now
        }
    }],
    status: {
        type: String,
        enum: ['sent', 'delivered', 'read'],
        default: 'sent'
    }
}, {
    timestamps: true
});

const ChatSchema = new Schema({
    participants: [{
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'CareBase',
            required: true
        },
        role: {
            type: String,
            enum: ['HealthWorker', 'User'],
            required: true
        },
        name: String,
        lastSeen: Date
    }],
    type: {
        type: String,
        enum: ['medical_consultation', 'general_inquiry', 'follow_up'],
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'archived', 'closed'],
        default: 'active'
    },
    relatedTo: {
        model: {
            type: String,
            enum: ['MedicalHistory'],
            required: true
        },
        id: {
            type: Schema.Types.ObjectId,
            required: true
        }
    },
    messages: [MessageSchema],
    metadata: {
        lastMessage: {
            content: String,
            sender: String,
            timestamp: Date
        },
        unreadCount: {
            type: Map,
            of: Number,
            default: new Map()
        }
    }
}, {
    timestamps: true
});

// Indexes for better query performance
ChatSchema.index({ 'participants.userId': 1 });
ChatSchema.index({ status: 1 });
ChatSchema.index({ 'relatedTo.id': 1 });

const Chat = mongoose.models.Chat || model('Chat', ChatSchema);
export default Chat;

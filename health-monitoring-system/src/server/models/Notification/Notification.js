import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const NotificationSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'CareBase'
    },
    type: {
        type: String,
        enum: ['message', 'update', 'chat_request', 'medical_review', 'system'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    relatedTo: {
        model: {
            type: String,
            enum: ['MedicalHistory', 'Chat', 'User'],
            required: true
        },
        id: {
            type: Schema.Types.ObjectId,
            required: true
        }
    },
    sender: {
        id: {
            type: Schema.Types.ObjectId,
            ref: 'CareBase',
            required: true
        },
        role: {
            type: String,
            enum: ['HealthWorker', 'User', 'System'],
            required: true
        },
        name: String
    },
    status: {
        type: String,
        enum: ['unread', 'read', 'archived'],
        default: 'unread'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    actionRequired: {
        type: Boolean,
        default: false
    },
    actionUrl: String,
    expiresAt: Date
}, {
    timestamps: true
});

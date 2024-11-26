import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const MedicalHistorySchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'CareBase'
    },
    healthIssueId: {
        type: String,
        required: true
    },
    conditionTitle: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    message: String,
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'resolved', 'cancelled'],
        default: 'pending'
    },
    specialistNotes: String,
    followUpDate: Date,
    severity: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    resolved: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Create indexes for frequent queries
MedicalHistorySchema.index({ userId: 1, createdAt: -1 });
MedicalHistorySchema.index({ status: 1 });

const MedicalHistory = mongoose.models.MedicalHistory || model('MedicalHistory', MedicalHistorySchema);
export default MedicalHistory;

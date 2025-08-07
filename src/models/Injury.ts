import mongoose from 'mongoose';

export interface IInjury extends mongoose.Document {
  child: mongoose.Types.ObjectId;
  type: string;
  description: string;
  date: Date;
  location: string;
  severity: 'mild' | 'moderate' | 'severe';
  recoveryStatus: 'Resting' | 'Light Activity' | 'Full Play';
  photos: string[];
  notes: string;
  suggestedTimeline: number; // in days
  lastReminderSent: Date;
  createdAt: Date;
  updatedAt: Date;
}

const injurySchema = new mongoose.Schema<IInjury>({
  child: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Child',
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  location: {
    type: String,
    required: true,
  },
  severity: {
    type: String,
    enum: ['mild', 'moderate', 'severe'],
    required: true,
  },
  recoveryStatus: {
    type: String,
    enum: ['Resting', 'Light Activity', 'Full Play'],
    default: 'Resting',
  },
  photos: [{
    type: String,
  }],
  notes: {
    type: String,
    default: '',
  },
  suggestedTimeline: {
    type: Number,
    default: 7, // default 7 days
  },
  lastReminderSent: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Calculate progress percentage based on recovery status
injurySchema.virtual('progressPercentage').get(function() {
  switch (this.recoveryStatus) {
    case 'Resting':
      return 33;
    case 'Light Activity':
      return 66;
    case 'Full Play':
      return 100;
    default:
      return 0;
  }
});

export default mongoose.models.Injury || mongoose.model<IInjury>('Injury', injurySchema); 
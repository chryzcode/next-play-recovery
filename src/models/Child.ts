import mongoose from 'mongoose';

export interface IChild extends mongoose.Document {
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  sport: string;
  notes: string;
  parent: mongoose.Types.ObjectId;
  injuries: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const childSchema = new mongoose.Schema<IChild>({
  name: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
    min: 0,
    max: 18,
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    default: 'male',
  },
  sport: {
    type: String,
    default: '',
  },
  notes: {
    type: String,
    default: '',
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  injuries: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Injury',
  }],
}, {
  timestamps: true,
});

export default mongoose.models.Child || mongoose.model<IChild>('Child', childSchema); 
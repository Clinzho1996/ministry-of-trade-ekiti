// src/models/Opportunity.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IOpportunity extends Document {
  title: string;
  description: string;
  range: string;
  image: string;
  imagePublicId?: string;
  link: string;
  sector: string;
  isActive: boolean;
  sortOrder: number;
}

const OpportunitySchema = new Schema<IOpportunity>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    range: {
      type: String,
      required: [true, 'Investment range is required'],
    },
    image: {
      type: String,
      required: [true, 'Image URL is required'],
    },
    imagePublicId: {
      type: String,
    },
    link: {
      type: String,
      required: [true, 'Link is required'],
    },
    sector: {
      type: String,
      required: [true, 'Sector is required'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IOpportunity>('Opportunity', OpportunitySchema);
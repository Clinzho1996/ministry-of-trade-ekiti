// src/models/Gallery.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IGallery extends Document {
  title: string;
  category: 'Past' | 'Upcoming';
  date: Date;
  image: string;
  imagePublicId?: string;
  description?: string;
  isPublished: boolean;
}

const GallerySchema = new Schema<IGallery>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['Past', 'Upcoming'],
      required: [true, 'Category is required'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    image: {
      type: String,
      required: [true, 'Image URL is required'],
    },
    imagePublicId: {
      type: String,
    },
    description: {
      type: String,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IGallery>('Gallery', GallerySchema);
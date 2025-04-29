import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Please provide a post content'],
    maxlength: [280, 'Post cannot be more than 280 characters'],
  },
  likes: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Post || mongoose.model('Post', PostSchema); 
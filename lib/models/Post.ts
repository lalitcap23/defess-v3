import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Please provide a comment content'],
    maxlength: [280, 'Comment cannot be more than 280 characters'],
  },
  username: {
    type: String,
    required: [true, 'Please provide a username'],
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const PostSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Please provide a post content'],
    maxlength: [280, 'Post cannot be more than 280 characters'],
  },
  username: {
    type: String,
    required: [true, 'Please provide a username'],
    trim: true,
  },
  likes: {
    type: Number,
    default: 0,
  },
  likedBy: {
    type: [String],
    default: [],
  },
  comments: [CommentSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Post || mongoose.model('Post', PostSchema);
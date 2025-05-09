import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  userId:     { type: mongoose.Types.ObjectId, required: true },
  userName:   { type: String},
  postTitle:  { type: String, required: true },
  postCaption:{ type: String, required: true },
  imageUrl:   { type: String },
  likes:      { type: Number, default: 0 },
  likedBy:    { type: [String], default: [] },
  comments:   { type: [String], default: [] }
}, { timestamps: true });

export default mongoose.model('Post', postSchema);

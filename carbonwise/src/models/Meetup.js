import mongoose from 'mongoose';

const meetupSchema = new mongoose.Schema({
  theme: { type: String, required: true },
  location: { type: String, required: true },
  date: { type: Date, required: true },
  posterUrl: { type: String },
  isOnline: { type: Boolean, default: false },
  link: { type: String },
  attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  linkCreatedAt: { type: Date },
});

const Meetup = mongoose.model('Meetup', meetupSchema);
export default Meetup;

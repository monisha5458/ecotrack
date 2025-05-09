import mongoose from 'mongoose';

const leaderBoardSchema = new mongoose.Schema({
  userId:     { type: mongoose.Types.ObjectId, required: true },
  name:       { type: String, required: true },
  date:       { type: Date, required: true },
  city:       { type: String, required: true },
  totalCarbon:{ type: Number, required: true }
});

export default mongoose.model('LeaderBoard', leaderBoardSchema);

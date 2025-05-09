import mongoose from 'mongoose';

const transportationSchema = new mongoose.Schema({
  mode:     { type: String, required: true },
  distance: { type: Number, required: true },
  time:     { type: Number, required: true }
}, { _id: false });

const wastageSchema = new mongoose.Schema({
  wetWaste: { type: Number, required: true },
  dryWaste: { type: Number, required: true }
}, { _id: false });

const carbonRecordSchema = new mongoose.Schema({
  userId:          { type: mongoose.Types.ObjectId, required: true },
  name:            { type: String, required: true },
  date:            { type: Date, required: true },
  city:            { type: String, required: true },
  transportations: [transportationSchema],
  wastages:        [wastageSchema],
  prevWatts:       { type: Number, required: true },
  todayWatts:      { type: Number, required: true },
  carbonFootprint: { type: Number, required: true }
}, { timestamps: true });

export default mongoose.model('CarbonRecord', carbonRecordSchema);

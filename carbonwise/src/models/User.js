import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name:                 { type: String, required: true },
  email:                { type: String, required: true, unique: true },
  password:             { type: String, required: true },
  city:                 { type: String, required: true },
  totalCarbonFootprint: { type: Number, default: 0 },
  role:                 { type: String, enum: ['USER','SERVICE_PROVIDER','ADMIN'], default: 'USER' }
}, { timestamps: true });

export default mongoose.model('User', userSchema);

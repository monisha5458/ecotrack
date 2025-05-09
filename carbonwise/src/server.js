import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import postRoutes from './routes/postRoutes.js';
import carbonRoutes from './routes/carbonRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

dotenv.config();
await connectDB();

const app = express();
app.use(cors({
  origin: process.env.CLIENT_ORIGIN,
  methods: ['GET','POST','PUT','DELETE'],
  allowedHeaders: ['Authorization','Content-Type']
}));
app.use(express.json());

// Get the current directory name (since __dirname is not available)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.urlencoded({ extended: true })); // ✅ ADD THIS
// Serve uploaded images
// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
//app.use('/uploads', serveUploads);


// Mount feature routers
app.use('/auth',      authRoutes);
app.use('/users',     userRoutes);
app.use('/community', postRoutes);
app.use('/carbonTrack', carbonRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));



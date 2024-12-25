import dotenv from 'dotenv';
import express from 'express';
import authRoutes from './controllers/authController.js';
import cors from 'cors';

dotenv.config();

const app = express();

app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true
}));

app.use(express.json());

app.use('/auth', authRoutes);

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});
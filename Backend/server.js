import dotenv from 'dotenv';
import express from 'express';
import authRoutes from './controllers/authController.js';


dotenv.config();

const app = express();

app.use(express.json());

app.use('/auth', authRoutes);

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});
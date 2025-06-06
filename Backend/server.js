import dotenv from 'dotenv';
import express from 'express';
import authRoutes from './controllers/authController.js';
import dbRoutes from './controllers/dbController.js';
import cors from 'cors';

dotenv.config();

const app = express();

app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:5050'],
    credentials: true
}));

app.use(express.json());

app.use('/auth', authRoutes);

app.use('/db', dbRoutes);

// app.get('/proxy-video/:letter', async (req, res) => {
//     const letter = req.params.letter.toLowerCase();
//     const url = `https://www.handspeak.com/word/${letter}/${letter}-abc.mp4`;
    
//     try {
//         const response = await fetch(url);
//         const buffer = await response.arrayBuffer();
        
//         // Set appropriate headers
//         res.setHeader('Content-Type', 'video/mp4');
//         res.setHeader('Access-Control-Allow-Origin', '*');
        
//         res.send(Buffer.from(buffer));
//     } catch (error) {
//         res.status(500).send('Error fetching video');
//     }
// });


app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});
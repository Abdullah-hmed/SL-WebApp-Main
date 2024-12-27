import express from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

router.get('/flashcards/alphabets', async (req, res) => {
    try {
        const {data, err} = await supabase
        .from('sign_flashcards')
        .select('*')
        .eq('status', 'unread')
        .order('sign_text', { ascending: true })

        if (err) {
            console.error(err);
        } else {
            res.status(200).json(data);
        }
    } catch (err) {
        res.status(500).json({error: err.message});
    }
})



export default router;
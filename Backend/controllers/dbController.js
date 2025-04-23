import express from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

// Get Flashcards for learning
router.get('/flashcards_learn/:category', async (req, res) => {
    try {

        const { category } = req.params;

        const {data, err} = await supabase
        .from('sign_flashcards')
        .select('*')
        .eq('sign_type', category)
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

router.get('/flashcards_quiz/:category', async (req, res) => {
    try {

        const { category } = req.params;

        const {data, err} = await supabase
        .from('sign_flashcards')
        .select('*')
        .eq('sign_type', category)
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

// Set Flashcard status as read
router.post('/flashcards_read', async (req, res) => {
    const { sign_id } = req.body;

    try {
        const {data, err} = await supabase
        .from('sign_flashcards')
        .update({status: 'read'})
        .eq('id', sign_id)

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
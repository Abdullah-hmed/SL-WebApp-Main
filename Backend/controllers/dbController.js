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
router.post('/flashcards_learn/', async (req, res) => {
    const { category, userId } = req.body;

    try {
        const { data, error } = await supabase
            .rpc('get_unlearned_flashcard', {
                user_uuid: userId,
                category_text: category
            });

        if (error) {
            console.error(error);
            return res.status(500).json({ error: error.message });
        }

        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Set Flashcard status as read
router.post('/flashcards_read', async (req, res) => {
    const { sign_id, userId } = req.body;

    try {
        if (!sign_id || !userId) {
            return res.status(400).json({ error: 'sign_id and userId are required' });
        }

        const { data, error } = await supabase
        .rpc('add_user_flashcard', {
            user_uuid: userId,
            card_id: sign_id
        });

        if (error) {
            console.error('RPC Error:', error);
            return res.status(500).json({ error: error.message });
        }

        res.status(200).json({ message: 'Flashcard marked as read' });
    } catch (err) {
        console.error('Server Error:', err);
        res.status(500).json({ error: err.message });
    }
});

router.post('/flashcards_quiz', async (req, res) => {
    try {
        const { category, userId } = req.body;

        const { data, error } = await supabase
        .from('user_flashcards')
        .select(`
            flashcard_id,
            box_level,
            sign_flashcards (
            sign_text,
            sign_description
            )
        `)
        .eq('user_id', userId);
        if (error) {
        console.error('Error fetching flashcards:', error);
        } else {
        console.log('Flashcards:', data);
        }

        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/update_flashcards', async (req, res) => {
    const { sign_id, box_level, user_id } = req.body;
    const leitnerBoxMapping = {
        1: 1,
        2: 4,
        3: 7,
        4: 14,
        5: 30,
    };
    try {
        if (!sign_id || !user_id) {
            return res.status(400).json({ error: 'sign_id and user_id are required' });
        }

        const { data, error } = await supabase
        .rpc('update_flashcard_review', {
            user_uuid: user_id,
            flashcard_id_input: sign_id,
            new_box_level: box_level,
            next_review_day: leitnerBoxMapping[box_level]
        });

        if (error) {
            console.error('RPC Error:', error);
            return res.status(500).json({ error: error.message });
        }

        res.status(200).json({ message: 'Flashcard review submitted' });
    } catch (err) {
        console.error('Server Error:', err);
        res.status(500).json({ error: err.message });
    }
});


export default router;
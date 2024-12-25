import express from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

// SIGN UP
router.post('/signup', async (req, res) => {
    const {username, email, password} = req.body;

    try {

        const { data: authData, error: authError } = await supabase.auth.signUp({
            email, password
        });

        if (authError) {
            console.error('Auth Error:', authError);
            return res.status(400).json({ error: authError.message });
        }

        const userId = authData.user.id;

        const { error: dbError } = await supabase.from('users').insert([
            { id: userId, username },
        ]);

        if (dbError) {
            console.error('Database Error:', dbError);
            return res.status(400).json({ error: dbError.message });
        }

        res.status(201).json({ message: 'User created successfully' });

    } catch (err) {
        console.error('Server Error:', err);
        res.status(500).json({ message: 'Server Error!' });
    }
});


// LOGIN
router.post('/login', async (req, res) => {
    const {email, password} = req.body;

    try {

        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email, password
        });

        if (authError) {
            console.error('Auth Error:', authError);
            return res.status(400).json({ error: authError.message });
        } 

        return res.status(200).json({ 
            message: 'User logged in!',
            accessToken: authData.session.access_token,
            refreshToken: authData.session.refresh_token,
            user: authData.user
         });

    } catch (err) {
        console.error('Server Error:', err);
        return res.status(500).json({ message: 'Server Error!'});

    }
});

// SIGN OUT
router.post('/logout', async (req, res) => {
    try {

        await supabase.auth.signOut();
        return res.status(200).json({ message: 'User signed out!' });

    } catch (err) {
        console.error('Server Error:', err);
        return res.status(500).json({ message: "Server Error!"});

    }
});

export default router;

import express from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { parse } from 'uuid';

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
            { id: userId, username, email },
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


router.post('/userdata', async (req, res) => {
    const { user_id } = req.body; // Extract user_id from the request body
  
    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' });
    }

    try {
                
        // Call the stored function to fetch user data from Supabase
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', user_id)
            .single();
        if (error) {
            return res.status(500).json({ error: error.message });
        }
    
        // Return the user data as JSON
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;

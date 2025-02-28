import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { supabase } from '@/lib/supabaseClient';
import nc from 'next-connect';

const handler = nc<NextApiRequest, NextApiResponse>();

// Middleware: Ensure the user is authenticated and a photographer
handler.use(async (req, res, next) => {
  const session = await getSession({ req });

  console.log("Session Debug:", session); // 🔍 Check if session is being read properly

  if (!session || !session.user) {
    return res.status(401).json({ message: 'Unauthorized: No session found' });
  }

  if (!session.user.role || session.user.role !== 'photographer') {
    return res.status(403).json({ message: 'Forbidden: You must be a photographer' });
  }

  next();
});

// POST request: Create an album
handler.post(async (req, res) => {
  const { title, description } = req.body;
  const session = await getSession({ req });

  if (!title) {
    return res.status(400).json({ message: 'Album title is required' });
  }

  // Insert album into Supabase
  const { data, error } = await supabase.from('albums').insert([
    {
      photographer_id: session.user.id,
      title,
      description: description || '',
    },
  ]).select().single();

  if (error) {
    return res.status(500).json({ message: 'Error creating album', error });
  }

  res.status(200).json({ message: 'Album created successfully', album: data });
});

export default handler;

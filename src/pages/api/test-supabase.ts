import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { data: users, error: userError } = await supabase.from('users').select('*');
  const { data: albums, error: albumError } = await supabase.from('albums').select('*');
  const { data: photos, error: photoError } = await supabase.from('photos').select('*');

  if (userError || albumError || photoError) {
    return res.status(500).json({ message: 'Error fetching data', userError, albumError, photoError });
  }

  res.status(200).json({ users, albums, photos });
}

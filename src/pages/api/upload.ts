import { getSession } from 'next-auth/react';
import { Storage } from '@google-cloud/storage';
import { supabase } from '@/lib/supabaseClient';
import fs from 'fs';
import multer from 'multer';
import nc from 'next-connect';
import path from 'path';
import type { NextApiRequest, NextApiResponse } from 'next';

// Initialize Google Cloud Storage
const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  keyFilename: process.env.GCP_KEYFILE_PATH,
});

const bucket = storage.bucket(process.env.GCP_STORAGE_BUCKET as string);

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: '/tmp',
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));
    },
  }),
});


// Initialize API Handler
const handler = nc<NextApiRequest, NextApiResponse>()

// Middlware to check if the user is authenticated (!!!)
handler.use(async (req: NextApiRequest, res: NextApiResponse, next) => {
  const session = await getSession({ req });

  // Only allow authenticated photographers to upload photos
  if (!session || !session.user || session.user.role !== 'photographer') {
    return res.status(403).json({ message: 'Access denied. You must be logged in as a photographer.' });
  }

  next();
});

// Apply file upload middleware
handler.use(upload.single('photo'));

// Logic to upload file and store the metadata in supabase
handler.post(async (req: NextApiRequest & { file: Express.Multer.File }, res: NextApiResponse) => {

  const { album_id } = req.body;

  if (!req.file || !album_id) {
    return res.status(400).json({ message: 'No file uploaded or missing album id' });
  }


  // TODO: Implement logic to add supabase to the album table. 
  try{
    
    const { data: album, error: albumError } = await supabase
      .from('albums')
      .select('id')
      .eq('id', album_id)
      .single();
      

      if(albumError || !album) {
        return res.status(404).json({ message: 'Album not found' });
      }

      const { file } = req;
      const blob = bucket.file(file.filename);

      const blobStream = blob.createWriteStream({
        resumable: false,
        contentType: file.mimetype,
        metadata: {
          cacheControl: 'public, max-age=31536000',
        },
      });

      blobStream.on('error', (err) => {
        console.error('Upload error:', err);
        res.status(500).json({ message: 'Upload to GCS failed' });
      });

      blobStream.on('finish', async () => {
        const fileUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
        // Store photo metadata in supabase
        const { data, error } = await supabase.from('photos').insert({
          album_id,
          filename: file.filename,
          gcs_url: fileUrl,
        })
        if (error) {
          return res.status(500).json({ message: 'Failed to save photo metadata', error });
        }
        res.status(200).json({
          message: 'Upload successful',
          url: fileUrl,
          metadata: data,
        }); 
      });

      fs.createReadStream(file.path).pipe(blobStream);
      
    
  }catch (error) {
    res.status(500).json({ message: 'Unexpected error during upload', error });
  }
});


export const config = {
  api: {
    bodyParser: false, // Allow multer to handle multipart/form-data
  },
};

export default handler;

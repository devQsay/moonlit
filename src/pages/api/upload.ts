import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import nc from 'next-connect';
import multer from 'multer';
import { Storage } from '@google-cloud/storage';
import path from 'path';
import fs from 'fs';

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

// Initialize next-connect handler
const handler = nc<NextApiRequest, NextApiResponse>({
  onError(error, req, res) {
    res.status(500).json({ message: `An error occurred: ${error.message}` });
  },
  onNoMatch(req, res) {
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  },
});

// Middleware to check authentication
handler.use(async (req: NextApiRequest, res: NextApiResponse, next) => {
  const session = await getSession({ req });

  // Only allow authenticated photographers to upload photos
  if (!session || session.user.role !== 'photographer') {
    return res.status(403).json({ message: 'Access denied. You must be logged in as a photographer.' });
  }

  next();
});

// Apply file upload middleware
handler.use(upload.single('photo'));

// Handle the POST request (file upload)
handler.post(async (req: NextApiRequest & { file: Express.Multer.File }, res: NextApiResponse) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
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

    blobStream.on('finish', () => {
      // Send back the uploaded file's GCS URL
      res.status(200).json({
        message: 'Upload successful',
        url: `https://storage.googleapis.com/${bucket.name}/${blob.name}`,
      });
    });

    fs.createReadStream(file.path).pipe(blobStream);
  } catch (error) {
    res.status(500).json({ message: 'Unexpected error during upload', error });
  }
});

export const config = {
  api: {
    bodyParser: false, // Allow multer to handle multipart/form-data
  },
};

export default handler;

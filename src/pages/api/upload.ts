import type { NextApiRequest, NextApiResponse } from 'next';
import { Storage } from '@google-cloud/storage';
import multer from 'multer';
import nextConnect  from 'next-connect'; // ✅ Correct way
import path from 'path';
import fs from 'fs';

// Initialize Google Cloud Storage
const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  keyFilename: process.env.GCP_KEYFILE_PATH,
});

const bucket = storage.bucket(process.env.GCP_STORAGE_BUCKET as string);

// Configure multer for handling file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: '/tmp', // Temporary folder for uploads
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    },
  }),
});

const apiRoute = nextConnect({
  onError(error, req: NextApiRequest, res: NextApiResponse) {
    res.status(500).json({ message: `Upload error: ${error.message}` });
  },
  onNoMatch(req: NextApiRequest, res: NextApiResponse) {
    res.status(405).json({ message: 'Method not allowed' });
  },
});

apiRoute.use(upload.single('photo'));

// POST endpoint to handle file uploads
apiRoute.post(async (req: NextApiRequest & { file: Express.Multer.File }, res: NextApiResponse) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    const { file } = req;

    // Upload to GCS bucket
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
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
      res.status(200).json({ url: publicUrl });
    });

    // Pipe the uploaded file to GCS
    fs.createReadStream(file.path).pipe(blobStream);
  } catch (error) {
    res.status(500).json({ message: 'Unexpected error', error });
  }
});

export const config = {
  api: {
    bodyParser: false, // Disabling Next.js body parser to allow multer to handle the file
  },
};

export default apiRoute;

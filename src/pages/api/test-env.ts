import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Log environment variables in the terminal (backend-only)
  console.log('GCP Project ID:', process.env.GCP_PROJECT_ID);
  console.log('GCP Storage Bucket:', process.env.GCP_STORAGE_BUCKET);
  console.log('GCP Keyfile Path:', process.env.GCP_KEYFILE_PATH);

  // Send a response to verify everything is working
  res.status(200).json({
    projectId: process.env.GCP_PROJECT_ID,
    bucket: process.env.GCP_STORAGE_BUCKET,
    keyFilePath: process.env.GCP_KEYFILE_PATH,
  });
}

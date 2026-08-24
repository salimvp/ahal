import Busboy from 'busboy';
import { requireAuth } from './_lib/auth.js';
import { uploadToR2, generateObjectKey, validateUploadFile } from './_lib/r2.js';
import { json, error } from './_lib/response.js';

export const config = {
  api: {
    bodyParser: false // Disable Vercel's default JSON body parser for streaming multipart
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return error(res, 'Method not allowed', 405);
  }

  const user = requireAuth(req, res);
  if (!user) return;

  const contentType = req.headers['content-type'] || '';
  if (!contentType.includes('multipart/form-data')) {
    return error(res, 'Content-Type must be multipart/form-data', 400);
  }

  try {
    const uploadResult = await new Promise((resolve, reject) => {
      const busboy = Busboy({
        headers: req.headers,
        limits: {
          fileSize: 25 * 1024 * 1024 // 25 MB
        }
      });

      let folder = 'uploads';
      let fileProcessed = false;
      let uploadPromise = null;

      busboy.on('field', (name, val) => {
        if (name === 'folder' && val) {
          folder = val.replace(/[^a-zA-Z0-9_-]/g, '');
        }
      });

      busboy.on('file', (fieldname, fileStream, fileInfo) => {
        fileProcessed = true;
        const { filename, mimeType } = fileInfo;

        try {
          validateUploadFile({ filename, contentType: mimeType });
        } catch (validationErr) {
          fileStream.resume();
          return reject(validationErr);
        }

        const chunks = [];
        fileStream.on('data', chunk => chunks.push(chunk));
        fileStream.on('limit', () => {
          reject(new Error('File size exceeds 25MB limit'));
        });
        fileStream.on('end', () => {
          const buffer = Buffer.concat(chunks);
          const key = generateObjectKey(folder, filename);
          uploadPromise = uploadToR2({
            buffer,
            key,
            contentType: mimeType
          }).then(result => ({
            ...result,
            originalFilename: filename,
            mimeType
          }));
        });
      });

      busboy.on('finish', async () => {
        if (!fileProcessed || !uploadPromise) {
          return reject(new Error('No file was uploaded'));
        }
        try {
          const result = await uploadPromise;
          resolve(result);
        } catch (err) {
          reject(err);
        }
      });

      busboy.on('error', err => reject(err));

      req.pipe(busboy);
    });

    return json(res, {
      success: true,
      url: uploadResult.url,
      key: uploadResult.key,
      filename: uploadResult.originalFilename,
      size: uploadResult.size,
      storage: uploadResult.storage
    }, 201);
  } catch (err) {
    return error(res, err.message || 'File upload failed', 400);
  }
}

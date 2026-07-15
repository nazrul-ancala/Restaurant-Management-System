import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import multer from 'multer';

const UPLOAD_DIR = path.join(__dirname, '..', '..', '..', 'uploads', 'menu');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => cb(null, `${randomUUID()}${path.extname(file.originalname)}`),
});

export const menuImageUpload = multer({
  storage,
  // Uncompressed phone-camera/screenshot PNGs routinely run 10-20MB — 5MB was
  // silently rejecting real uploads (satay.png at 11MB, chicken steak.png at 18MB, etc).
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Only image files are allowed'));
      return;
    }
    cb(null, true);
  },
});

import fs from 'fs';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const ALLOWED_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']);

const ensureUploadDir = () => {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
};

export const listMediaFiles = () => {
  ensureUploadDir();

  const files = fs
    .readdirSync(UPLOAD_DIR, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => ALLOWED_EXT.has(path.extname(name).toLowerCase()))
    .sort((a, b) => a.localeCompare(b));

  return files.map((filename) => ({
    filename,
    url: `/uploads/${filename}`,
  }));
};

export const getUploadDir = () => {
  ensureUploadDir();
  return UPLOAD_DIR;
};

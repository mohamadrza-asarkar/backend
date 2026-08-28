/**
 * Format utilities for currency, numbers, dates, and server image URLs
 */

export const formatPrice = (price) => {
  if (price === undefined || price === null) return '۰ تومان';
  return new Intl.NumberFormat('fa-IR').format(Number(price) || 0) + ' تومان';
};

export const formatNumber = (num) => {
  if (num === undefined || num === null) return '۰';
  return new Intl.NumberFormat('fa-IR').format(Number(num) || 0);
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch {
    return dateStr;
  }
};

import fs from 'fs';
import path from 'path';

/**
 * Format image path to full server URL accessible by frontend or return base64 unchanged
 */
export const formatImageUrl = (imagePath, req) => {
  if (!imagePath) return '';
  if (typeof imagePath !== 'string') return imagePath;
  // If already base64 data URI or absolute HTTP/HTTPS URL, return directly
  if (imagePath.startsWith('data:') || imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  if (req && req.headers && req.headers.host) {
    const protocol = req.protocol || 'http';
    return `${protocol}://${req.headers.host}${cleanPath}`;
  }
  return cleanPath;
};

/**
 * Convert local file or buffer to base64 Data URI
 */
export const convertFileToBase64 = (filePath, mimetype = 'image/jpeg') => {
  try {
    if (fs.existsSync(filePath)) {
      const fileBuffer = fs.readFileSync(filePath);
      return `data:${mimetype};base64,${fileBuffer.toString('base64')}`;
    }
  } catch (err) {
    console.error('Base64 conversion error:', err);
  }
  return null;
};

import crypto from 'crypto';

/**
 * Creates a clean, SEO-friendly slug from text supporting both English and Persian/Arabic characters.
 */
export const slugify = (text) => {
  if (!text) return '';
  return text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    // Keep Persian characters, English letters, digits, and hyphen/underscore
    .replace(/[^\u0600-\u06FF\uFB8A\u067E\u0686\u06AFa-z0-9_-]/g, '')
    .replace(/-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start
    .replace(/-+$/, ''); // Trim - from end
};

/**
 * Saves a base64 string as a physical file on the server and returns the relative path.
 * Enforces saving each unique image exactly once using a content hash (deduplication).
 * Uses strictly .jpg or .png format, and uses customName to generate SEO-friendly filenames.
 */
export const saveBase64ToFile = (base64Str, subfolder = 'products', customName = '') => {
  if (!base64Str || typeof base64Str !== 'string') return base64Str;
  
  // If it's not a base64 data URI, return it directly
  if (!base64Str.startsWith('data:')) {
    return base64Str;
  }

  try {
    // Parse base64 string
    const matches = base64Str.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-+.]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return base64Str;
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    // Create a deterministic hash of the image content (md5 is extremely fast and perfect for deduplication)
    const hash = crypto.createHash('md5').update(buffer).digest('hex').substring(0, 16);

    // Get file extension from MIME type - strictly .png or .jpg
    let ext = 'jpg';
    if (mimeType.toLowerCase().includes('png')) {
      ext = 'png';
    }

    // Ensure directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', subfolder);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Deduplication check: "هر تصویر فقط یک بار"
    // Find if a file containing this hash already exists in this folder to avoid duplicate storage
    const files = fs.readdirSync(uploadDir);
    const existingFile = files.find(f => f.endsWith(`-${hash}.${ext}`) || f === `${hash}.${ext}`);
    if (existingFile) {
      return `/uploads/${subfolder}/${existingFile}`;
    }

    // If not found, build a beautiful, SEO-friendly file name with the slugified customName
    const cleanSlug = slugify(customName);
    const filename = cleanSlug 
      ? `${cleanSlug}-${hash}.${ext}` 
      : `${subfolder}-${hash}.${ext}`;

    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, buffer);

    // Return the relative URL path
    return `/uploads/${subfolder}/${filename}`;
  } catch (err) {
    console.error('Failed to save base64 image to file:', err);
    return base64Str;
  }
};

/**
 * Alias for saveBase64ToFile to maintain compatibility with saveBase64Image
 */
export const saveBase64Image = saveBase64ToFile;



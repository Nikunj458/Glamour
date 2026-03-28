import express from 'express';
import multer  from 'multer';
import imagekit from '../config/imagekit.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'), false);
  },
});

const router = express.Router();

// POST /api/upload
// Body: multipart/form-data, field "images" (up to 5 files)
// Optional query: ?folder=categories   (defaults to products)
// Returns: { images: [{ url, fileId }] }
router.post('/', protect, adminOnly, upload.array('images', 5), async (req, res) => {
  if (!req.files?.length)
    return res.status(400).json({ message: 'No files provided' });

  // Validate ImageKit is configured
  if (!process.env.IMAGEKIT_PRIVATE_KEY || !process.env.IMAGEKIT_PUBLIC_KEY) {
    return res.status(500).json({ message: 'ImageKit not configured — check IMAGEKIT_PRIVATE_KEY and IMAGEKIT_PUBLIC_KEY in .env' });
  }

  // Allow caller to specify folder (categories vs products)
  const folderType = req.query.folder === 'categories' ? 'categories' : 'products';
  const folder = `/boutique/${folderType}`;

  try {
    const results = await Promise.all(
      req.files.map((file) =>
        imagekit.upload({
          file:              file.buffer,
          fileName:          `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`,
          folder,
          useUniqueFileName: true,
          tags:              ['boutique', folderType],
        })
      )
    );

    res.json({
      images: results.map((r) => ({ url: r.url, fileId: r.fileId })),
      urls:   results.map((r) => r.url),
    });
  } catch (err) {
    console.error('ImageKit upload error:', err);
    res.status(500).json({
      message: 'Image upload failed',
      error:   err.message,
      // Help diagnose: show which config is missing
      hint: !process.env.IMAGEKIT_PRIVATE_KEY ? 'IMAGEKIT_PRIVATE_KEY missing in .env'
          : !process.env.IMAGEKIT_PUBLIC_KEY  ? 'IMAGEKIT_PUBLIC_KEY missing in .env'
          : !process.env.IMAGEKIT_URL_ENDPOINT ? 'IMAGEKIT_URL_ENDPOINT missing in .env'
          : 'Check ImageKit dashboard for account issues',
    });
  }
});

// DELETE /api/upload
router.delete('/', protect, adminOnly, async (req, res) => {
  const { fileId } = req.body;
  if (!fileId) return res.status(400).json({ message: 'fileId is required' });
  try {
    await imagekit.deleteFile(fileId);
    res.json({ message: 'File deleted from ImageKit' });
  } catch (err) {
    console.error('ImageKit delete error:', err.message);
    res.status(500).json({ message: 'Delete failed', error: err.message });
  }
});

// GET /api/upload/auth
router.get('/auth', protect, adminOnly, (req, res) => {
  try {
    const authParams = imagekit.getAuthenticationParameters();
    res.json(authParams);
  } catch (err) {
    res.status(500).json({ message: 'Auth params failed', error: err.message });
  }
});

export default router;
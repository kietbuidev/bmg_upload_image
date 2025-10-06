import multer from "multer";

const storage = multer.memoryStorage();

const defaultMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const allowedMimeTypes = (process.env.ALLOWED_MIME_TYPES || "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);
const mimeTypes = allowedMimeTypes.length ? allowedMimeTypes : defaultMimeTypes;

const maxFileSizeMb = Number(process.env.MAX_UPLOAD_SIZE_MB || 5);
const upload = multer({
  storage,
  limits: {
    fileSize: maxFileSizeMb * 1024 * 1024
  },
  fileFilter: (_req, file, cb) => {
    if (mimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Unsupported file type"));
    }
  }
});

const maxFiles = Number(process.env.MAX_UPLOAD_FILES || 10);

export const uploadSingle = upload.single("image");
export const uploadMultiple = upload.array("images", maxFiles);

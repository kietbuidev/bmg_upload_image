import multer from "multer";

const storage = multer.memoryStorage();

const DEFAULT_MAX_FILE_SIZE_MB = 2;
const DEFAULT_MAX_FILES = 5;
const defaultMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const allowedMimeTypes = (process.env.ALLOWED_MIME_TYPES || "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);
const mimeTypes = allowedMimeTypes.length ? allowedMimeTypes : defaultMimeTypes;

const parsedMaxFileSize = Number(process.env.MAX_UPLOAD_SIZE_MB);
export const maxUploadFileSizeMb =
  Number.isFinite(parsedMaxFileSize) && parsedMaxFileSize > 0
    ? parsedMaxFileSize
    : DEFAULT_MAX_FILE_SIZE_MB;

const parsedMaxFiles = Number(process.env.MAX_UPLOAD_FILES);
export const maxUploadFiles =
  Number.isInteger(parsedMaxFiles) && parsedMaxFiles > 0 ? parsedMaxFiles : DEFAULT_MAX_FILES;

const upload = multer({
  storage,
  limits: {
    fileSize: maxUploadFileSizeMb * 1024 * 1024,
    files: maxUploadFiles
  },
  fileFilter: (_req, file, cb) => {
    if (mimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Unsupported file type"));
    }
  }
});

export const uploadSingle = upload.single("image");
export const uploadMultiple = upload.array("images", maxUploadFiles);

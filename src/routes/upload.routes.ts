import { Router, Request, Response } from "express";
import streamifier from "streamifier";
import cloudinary from "../lib/cloudinary.js";
import { uploadSingle, uploadMultiple } from "../middlewares/upload.js";

const router = Router();

type UploadResult = {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
};

const uploadBufferToCloudinary = (
  buffer: Buffer,
  folder?: string
): Promise<UploadResult> => {
  return new Promise((resolve, reject) => {
    const options: Record<string, unknown> = {};
    if (folder) options.folder = folder;

    const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err) return reject(err);
      if (!result) return reject(new Error("Cloudinary error: empty result"));
      resolve(result as UploadResult);
    });

    streamifier.createReadStream(buffer).pipe(stream);
  });
};

router.get("/health", (_req, res) => {
  res.json({ ok: true, service: "cloudinary-express-railway" });
});

router.post("/upload", uploadSingle, async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const folder = process.env.CLOUDINARY_FOLDER || undefined;
    const result = await uploadBufferToCloudinary(req.file.buffer, folder);

    return res.json({
      message: "Uploaded",
      data: {
        public_id: result.public_id,
        url: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes
      }
    });
  } catch (error: any) {
    return res
      .status(500)
      .json({ message: "Upload failed", error: error?.message || "Unknown error" });
  }
});

router.post("/uploads", uploadMultiple, async (req: Request, res: Response) => {
  try {
    const files = (req.files as Express.Multer.File[]) || [];
    if (!files.length) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const folder = process.env.CLOUDINARY_FOLDER || undefined;
    const results = await Promise.all(
      files.map(file => uploadBufferToCloudinary(file.buffer, folder))
    );

    return res.json({
      message: "Uploaded",
      count: results.length,
      data: results.map(result => ({
        public_id: result.public_id,
        url: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes
      }))
    });
  } catch (error: any) {
    return res
      .status(500)
      .json({ message: "Upload failed", error: error?.message || "Unknown error" });
  }
});

router.delete("/delete/:publicId", async (req: Request, res: Response) => {
  try {
    const { publicId } = req.params;
    if (!publicId) {
      return res.status(400).json({ message: "publicId required" });
    }

    const result = await cloudinary.uploader.destroy(publicId);
    return res.json({ message: "Deleted", result });
  } catch (error: any) {
    return res
      .status(500)
      .json({ message: "Delete failed", error: error?.message || "Unknown error" });
  }
});

export default router;

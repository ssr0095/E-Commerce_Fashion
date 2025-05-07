import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Initialize R2 client
const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

/**
 * Uploads a file to R2 and returns its public URL
 * @param {Buffer} buffer - File buffer
 * @param {string} fileName - Unique filename
 * @param {string} mimetype - File MIME type
 * @returns {Promise<string>} Public URL
 */
export const uploadToR2 = async (buffer, fileName, mimetype) => {
  await s3Client.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: mimetype,
    })
  );

  // Public URL format: https://<bucket>.<account-id>.r2.dev/filename.jpg
  return `https://${process.env.R2_BUCKET_NAME}.${process.env.R2_ACCOUNT_ID}.r2.dev/${fileName}`;
};

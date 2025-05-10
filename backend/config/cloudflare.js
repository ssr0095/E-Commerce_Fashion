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
  const safeFileName = fileName.replace(/[^a-zA-Z0-9./-]/g, "_");
  await s3Client.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: safeFileName,
      Body: buffer,
      ContentType: mimetype,
      ACL: "public-read", // Explicitly set public access
    })
  );

  // Use custom domain instead of R2 public URL
  return `https://cdn.cousinsfashion.in/${fileName}`;
};

// https://cdn.cousinsfashion.in/payments/c40ab54a-aba7-438b-9847-95427c9dc65a-blob
// https://cdn.cousinsfashion.in/payments/c40ab54a_aba7_438b_9847_95427c9dc65a_blob

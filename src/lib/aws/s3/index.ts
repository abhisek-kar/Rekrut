import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { env } from "@/lib/env";

// Initialize S3 client
const s3Client = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

/**
 * Upload a file to S3
 * @param file File to upload
 * @param key S3 object key (path)
 * @returns URL of the uploaded file
 */
export async function uploadToS3(file: File | Buffer, key: string): Promise<string> {
  try {
    // Prepare the file content
    let buffer: Buffer;
    let contentType: string;

    if (file instanceof File) {
      // Convert File to Buffer
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
      contentType = file.type;
    } else {
      // Already a Buffer
      buffer = file;
      contentType = "application/octet-stream";
    }

    // Create params for S3 upload
    const params = {
      Bucket: env.AWS_S3_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    };

    // Upload to S3
    const command = new PutObjectCommand(params);
    await s3Client.send(command);

    // Return the URL of the uploaded file
    return `https://${env.AWS_S3_BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw error;
  }
}

/**
 * Delete a file from S3
 * @param key S3 object key (path)
 */
export async function deleteFromS3(key: string): Promise<void> {
  try {
    const params = {
      Bucket: env.AWS_S3_BUCKET_NAME,
      Key: key,
    };

    const command = new DeleteObjectCommand(params);
    await s3Client.send(command);
  } catch (error) {
    console.error("Error deleting from S3:", error);
    throw error;
  }
}

/**
 * Generate a unique S3 key for a file
 * @param directory Directory within the bucket
 * @param fileName Original file name
 * @returns Unique S3 key
 */
export function generateS3Key(directory: string, fileName: string): string {
  const timestamp = Date.now();
  const uniqueId = Math.random().toString(36).substring(2, 10);
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
  return `${directory}/${timestamp}-${uniqueId}-${sanitizedFileName}`;
}

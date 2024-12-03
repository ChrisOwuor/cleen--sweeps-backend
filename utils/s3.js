const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const dotenv = require("dotenv");
const crypto = require("crypto");
dotenv.config();

const uploadToS3 = async (file, bucket_name) => {
  try {
    const s3 = new S3Client({
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
    const newFileName = (bytes = 32) =>
      crypto.randomBytes(bytes).toString("hex");
    let key = newFileName();

    const command = new PutObjectCommand({
      Bucket: bucket_name,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    const s3Img = await s3.send(command);
    return { s3Img, key };
  } catch (error) {
    return error;
  }
};
module.exports = { uploadToS3 };

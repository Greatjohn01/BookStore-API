import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (fileBuffer, filename) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader
            .upload_stream(
                { folder: "", public_id: filename },
                (err, result) => {
                    if (err || !result?.secure_url) return reject(err);
                    resolve(result);
                }
            )
            .end(fileBuffer);
    });
};

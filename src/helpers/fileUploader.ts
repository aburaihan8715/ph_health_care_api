import multer from 'multer';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import { deleteImageFile } from './deleteImageFile';

// 01 MULTER
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), 'uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

// 02 CLOUDINARY
// Configuration
cloudinary.config({
  cloud_name: 'dhcfqmwzc',
  api_key: '453232834664749',
  api_secret: 'YAVyE5YC2VEpD2NWNpGTH6P-YPw',
});

const uploadToCloudinary = async (
  imagePath: string,
  imageName: string,
) => {
  try {
    const uploadResult = await cloudinary.uploader.upload(imagePath, {
      public_id: imageName,
    });
    await deleteImageFile(imagePath);

    return uploadResult;
  } catch (error) {
    await deleteImageFile(imagePath);
    console.log('Failed to upload image', error);
    throw new Error('Failed to upload image');
  }
};

export const fileUploader = {
  upload,
  uploadToCloudinary,
};

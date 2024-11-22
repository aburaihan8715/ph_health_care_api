import fs from 'fs';
import ApiError from '../app/errors/ApiError';

export const deleteImageFile = async (path: string) => {
  fs.unlink(path, (err) => {
    if (err) {
      console.error('Error deleting file:', err);
      throw new ApiError(400, 'Failed to delete image file');
    } else {
      console.log('Image file is deleted successfully!');
    }
  });
};

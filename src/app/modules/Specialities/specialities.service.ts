import { Specialities } from '@prisma/client';
import { fileUploader } from '../../../helpers/fileUploader';
import { IFile } from '../../interface/file.interface';
import prisma from '../../../shared/prisma';

// CREATE SPECIALITIES
const createSpecialitiesIntoDB = async (
  file: IFile | undefined,
  payload: Specialities,
): Promise<Specialities> => {
  if (file) {
    const imagePath = file.path;
    const imageName = file.originalname;

    const uploadToCloudinary = await fileUploader.uploadToCloudinary(
      imagePath,
      imageName,
    );
    payload.icon = uploadToCloudinary?.secure_url;
  }

  const result = await prisma.specialities.create({
    data: payload,
  });

  return result;
};

// GET ALL SPECIALITIES
const getAllSpecialitiesFromDB = async (): Promise<Specialities[]> => {
  return await prisma.specialities.findMany();
};

// DELETE SPECIALITIES
const deleteSpecialitiesFromDB = async (
  id: string,
): Promise<Specialities> => {
  const result = await prisma.specialities.delete({
    where: {
      id,
    },
  });
  return result;
};

export const SpecialitiesService = {
  createSpecialitiesIntoDB,
  getAllSpecialitiesFromDB,
  deleteSpecialitiesFromDB,
};

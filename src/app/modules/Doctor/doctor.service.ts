import { Doctor, Prisma, UserStatus } from '@prisma/client';
import { paginationHelper } from '../../../helpers/paginationHelper';
import prisma from '../../../shared/prisma';
import { IPagination } from '../../interface/pagination';
import { IDoctorQueryObj, IDoctorUpdate } from './doctor.interface';
import { doctorSearchableFields } from './doctor.constant';

// GET ALL DOCTORS
const getAllDoctorsFromDB = async (
  queryObj: IDoctorQueryObj,
  paginationObj: IPagination,
) => {
  const { searchTerm, specialities, ...filter } = queryObj;
  const conditions: Prisma.DoctorWhereInput[] = [];

  // manage search
  if (searchTerm) {
    conditions.push({
      OR: doctorSearchableFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      })),
    });
  }

  // manage specialities
  // doctor > doctorSpecialties > specialties -> title
  if (specialities && specialities.length > 0) {
    conditions.push({
      doctorSpecialities: {
        some: {
          specialities: {
            title: {
              contains: specialities,
              mode: 'insensitive',
            },
          },
        },
      },
    });
  }

  // manage filter
  if (Object.keys(filter).length > 0) {
    conditions.push({
      AND: Object.entries(filter).map(([key, value]) => ({
        [key]: { equals: value },
      })),
    });
  }

  // manage deleted
  conditions.push({
    isDeleted: false,
  });

  // manage pagination
  const { limit, page, skip } =
    paginationHelper.calculatePagination(paginationObj);

  const result = await prisma.doctor.findMany({
    where: { AND: conditions },
    skip,
    take: limit,
    orderBy:
      paginationObj.sortBy && paginationObj.sortOrder
        ? { [paginationObj.sortBy as string]: paginationObj.sortOrder }
        : { createdAt: 'desc' },
    include: {
      doctorSpecialities: {
        include: {
          specialities: true,
        },
      },
    },
  });

  // get document count
  const total = await prisma.doctor.count({
    where: { AND: conditions },
  });

  // finally return the result
  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

// GET SINGLE DOCTOR
const getSingleDoctorFromDB = async (
  id: string,
): Promise<Doctor | null> => {
  const result = await prisma.doctor.findUnique({
    where: { id, isDeleted: false },
    include: {
      doctorSpecialities: {
        include: {
          specialities: true,
        },
      },
    },
  });

  return result;
};

// UPDATE DOCTOR
const updateDoctorIntoDB = async (id: string, payload: IDoctorUpdate) => {
  const { specialities, ...doctorData } = payload;

  const doctorInfo = await prisma.doctor.findUniqueOrThrow({
    where: {
      id,
    },
  });

  // console.log({ doctorInfo });
  await prisma.$transaction(async (transactionClient) => {
    await transactionClient.doctor.update({
      where: {
        id,
      },
      data: doctorData,
    });

    if (specialities && specialities.length > 0) {
      // delete specialities
      const deleteSpecialitiesIds = specialities.filter(
        (speciality) => speciality.isDeleted,
      );

      // console.log({ deleteSpecialitiesIds });
      for (const speciality of deleteSpecialitiesIds) {
        await transactionClient.doctorSpecialities.deleteMany({
          where: {
            doctorId: doctorInfo.id,
            specialitiesId: speciality.specialitiesId,
          },
        });
      }

      // create specialities
      const createSpecialitiesIds = specialities.filter(
        (speciality) => !speciality.isDeleted,
      );

      // console.log({ createSpecialitiesIds });
      for (const speciality of createSpecialitiesIds) {
        await transactionClient.doctorSpecialities.create({
          data: {
            doctorId: doctorInfo.id,
            specialitiesId: speciality.specialitiesId,
          },
        });
      }
    }
  });

  const result = await prisma.doctor.findUnique({
    where: {
      id: doctorInfo.id,
    },
    include: {
      doctorSpecialities: {
        include: {
          specialities: true,
        },
      },
    },
  });
  return result;
};

// DELETE DOCTOR
const deleteDoctorFromDB = async (id: string): Promise<Doctor | null> => {
  await prisma.doctor.findUniqueOrThrow({
    where: { id },
  });

  const result = await prisma.$transaction(async (transactionClient) => {
    const deletedDoctor = await transactionClient.doctor.delete({
      where: { id },
    });

    await transactionClient.user.delete({
      where: { email: deletedDoctor.email },
    });

    return deletedDoctor;
  });

  return result;
};

// SOFT DELETE DOCTOR
const softDeleteDoctorFromDB = async (
  id: string,
): Promise<Doctor | null> => {
  await prisma.doctor.findUniqueOrThrow({
    where: { id, isDeleted: false },
  });

  const result = await prisma.$transaction(async (transactionClient) => {
    const deletedDoctor = await transactionClient.doctor.update({
      where: { id },
      data: { isDeleted: true },
    });

    await transactionClient.user.update({
      where: { email: deletedDoctor.email },
      data: { status: UserStatus.DELETED },
    });

    return deletedDoctor;
  });

  return result;
};

export const DoctorService = {
  getAllDoctorsFromDB,
  getSingleDoctorFromDB,
  updateDoctorIntoDB,
  deleteDoctorFromDB,
  softDeleteDoctorFromDB,
};

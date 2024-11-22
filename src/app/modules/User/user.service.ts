import {
  Admin,
  Doctor,
  Patient,
  Prisma,
  User,
  UserRole,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';
import prisma from '../../../shared/prisma';
import { IFile } from '../../interface/file';
import { fileUploader } from '../../../helpers/fileUploader';
import {
  IAdminPayload,
  IDoctorPayload,
  IPatientPayload,
  IUserFilter,
  IUserSearchTerm,
} from './user.interface';
import { paginationHelper } from '../../../helpers/paginationHelper';
import { userSearchAbleFields } from './user.constant';
import { IPagination } from '../../interface/pagination';
// import { TPaginationOptions } from '../../interface/pagination';

// CREATE ADMIN
const createAdminIntoDB = async (
  file: IFile | undefined,
  payload: IAdminPayload,
) => {
  if (file) {
    const imagePath = file.path;
    const imageName = file.originalname;

    const uploadToCloudinary = await fileUploader.uploadToCloudinary(
      imagePath,
      imageName,
    );
    payload.admin.profilePhoto = uploadToCloudinary?.secure_url;
  }

  const hashedPassword: string = await bcrypt.hash(payload.password, 10);
  const userData = {
    email: payload.admin.email,
    password: hashedPassword,
    role: UserRole.ADMIN,
  };

  const result = await prisma.$transaction(async (transactionClient) => {
    await transactionClient.user.create({
      data: userData as User,
    });

    const createdAdminData = await transactionClient.admin.create({
      data: payload.admin as Admin,
    });

    return createdAdminData;
  });

  return result;
};

// CREATE ADMIN
const createDoctorIntoDB = async (
  file: IFile | undefined,
  payload: IDoctorPayload,
) => {
  if (file) {
    const imagePath = file.path;
    const imageName = file.originalname;

    const uploadToCloudinary = await fileUploader.uploadToCloudinary(
      imagePath,
      imageName,
    );
    payload.doctor.profilePhoto = uploadToCloudinary?.secure_url;
  }

  const hashedPassword: string = await bcrypt.hash(payload.password, 10);
  const userData = {
    email: payload.doctor.email,
    password: hashedPassword,
    role: UserRole.DOCTOR,
  };

  const result = await prisma.$transaction(async (transactionClient) => {
    await transactionClient.user.create({
      data: userData as User,
    });

    const createdDoctorData = await transactionClient.doctor.create({
      data: payload.doctor as Doctor,
    });

    return createdDoctorData;
  });

  return result;
};

// CREATE PATIENT
const createPatientIntoDB = async (
  file: IFile | undefined,
  payload: IPatientPayload,
) => {
  if (file) {
    const imagePath = file.path;
    const imageName = file.originalname;

    const uploadToCloudinary = await fileUploader.uploadToCloudinary(
      imagePath,
      imageName,
    );
    payload.patient.profilePhoto = uploadToCloudinary?.secure_url;
  }

  const hashedPassword: string = await bcrypt.hash(payload.password, 10);
  const userData = {
    email: payload.patient.email,
    password: hashedPassword,
    role: UserRole.PATIENT,
  };

  const result = await prisma.$transaction(async (transactionClient) => {
    await transactionClient.user.create({
      data: userData as User,
    });

    const createdPatientData = await transactionClient.patient.create({
      data: payload.patient as Patient,
    });

    return createdPatientData;
  });

  return result;
};

// GET ALL USERS
// const getAllUsersFromDB = async (
//   queryFilters: Record<string, unknown>,
//   options: TPaginationOptions,
// ) => {
//   const { searchTerm, ...filterData } = queryFilters;
//   const { limit, page, skip } =
//     paginationHelper.calculatePagination(options);
//   const conditions: Prisma.UserWhereInput[] = [];

//   // 01 manage search
//   if (searchTerm) {
//     conditions.push({
//       OR: userSearchAbleFields.map((field) => ({
//         [field]: {
//           contains: searchTerm,
//           mode: 'insensitive',
//         },
//       })),
//     });
//   }

//   // 02 manage filter
//   if (Object.keys(filterData).length > 0) {
//     conditions.push({
//       AND: Object.keys(filterData).map((key) => ({
//         [key]: {
//           equals: (filterData as any)[key],
//         },
//       })),
//     });
//   }

//   // 04 get documents based on conditions
//   const result = await prisma.user.findMany({
//     where: { AND: conditions },
//     skip,
//     take: limit,
//     orderBy:
//       options.sortBy && options.sortOrder
//         ? { [options.sortBy as string]: options.sortOrder }
//         : { createdAt: 'desc' },
//     select: {
//       id: true,
//       email: true,
//       role: true,
//       needPasswordChange: true,
//       status: true,
//       createdAt: true,
//       updatedAt: true,
//       admin: true,
//       patient: true,
//       doctor: true,
//     },
//   });

//   // 05 get document count
//   const total = await prisma.user.count({
//     where: { AND: conditions },
//   });

//   // 06 finally return the result
//   return {
//     meta: {
//       page,
//       limit,
//       total,
//     },
//     data: result,
//   };
// };

const getAllUsersFromDB = async (
  searchTermObj: IUserSearchTerm,
  filterObj: IUserFilter,
  paginationObj: IPagination,
) => {
  const conditions: Prisma.UserWhereInput[] = [];

  // 01 manage search
  if (Object.keys(searchTermObj).length > 0) {
    conditions.push({
      OR: userSearchAbleFields.map((field) => ({
        [field]: {
          contains: searchTermObj.searchTerm,
          mode: 'insensitive',
        },
      })),
    });
  }

  // 02 manage filter

  // if (Object.keys(filterObj).length > 0) {
  //   conditions.push({
  //     AND: Object.keys(filterObj).map((key) => ({
  //       [key]: {
  //         equals: filterObj[key],
  //       },
  //     })),
  //   });
  // }

  if (Object.keys(filterObj).length > 0) {
    conditions.push({
      AND: Object.entries(filterObj).map(([key, value]) => ({
        [key]: { equals: value },
      })),
    });
  }

  // 03 manage pagination
  const { limit, page, skip } =
    paginationHelper.calculatePagination(paginationObj);

  const result = await prisma.user.findMany({
    where: { AND: conditions },
    skip,
    take: limit,
    orderBy:
      paginationObj.sortBy && paginationObj.sortOrder
        ? { [paginationObj.sortBy as string]: paginationObj.sortOrder }
        : { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      role: true,
      needPasswordChange: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      admin: true,
      patient: true,
      doctor: true,
    },
  });

  // 04 get document count
  const total = await prisma.user.count({
    where: { AND: conditions },
  });

  // 05 finally return the result
  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

// CHANGE PROFILE STATUS
const changeProfileStatusIntoDB = async (id: string, status: UserRole) => {
  await prisma.user.findUniqueOrThrow({
    where: { id },
  });

  const updateUserStatus = await prisma.user.update({
    where: { id },
    data: status,
  });

  return updateUserStatus;
};

export const UserService = {
  createAdminIntoDB,
  createDoctorIntoDB,
  createPatientIntoDB,
  getAllUsersFromDB,
  changeProfileStatusIntoDB,
};

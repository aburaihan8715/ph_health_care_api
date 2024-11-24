import {
  Admin,
  Doctor,
  Patient,
  Prisma,
  User,
  UserRole,
  UserStatus,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';
import prisma from '../../../shared/prisma';
import { IFile } from '../../interface/file';
import { fileUploader } from '../../../helpers/fileUploader';
import {
  IAdminPayload,
  IDoctorPayload,
  IPatientPayload,
  IUserQueryObj,
} from './user.interface';
import { paginationHelper } from '../../../helpers/paginationHelper';
import { userSearchAbleFields } from './user.constant';
import { IPagination } from '../../interface/pagination';

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
const getAllUsersFromDB = async (
  queryObj: IUserQueryObj,
  paginationObj: IPagination,
) => {
  const { searchTerm, ...filter } = queryObj;
  const conditions: Prisma.UserWhereInput[] = [];

  // manage search
  if (searchTerm) {
    conditions.push({
      OR: userSearchAbleFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      })),
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

  // manage delete

  // manage pagination
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

  // get document count
  const total = await prisma.user.count({
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

// CHANGE PROFILE STATUS
const changeProfileStatusIntoDB = async (id: string, status: UserRole) => {
  await prisma.user.findUniqueOrThrow({
    where: { id },
  });

  // const { password, ...others } = await prisma.user.update({
  //   where: { id },
  //   data: status,
  // });

  const updatedProfile = await prisma.user.update({
    where: { id },
    data: status,
  });

  return updatedProfile;
};

// GET MY PROFILE
const getMyProfileFromDB = async (email: string) => {
  const userInfo = await prisma.user.findUniqueOrThrow({
    where: {
      email: email,
      status: UserStatus.ACTIVE,
    },
    select: {
      id: true,
      email: true,
      needPasswordChange: true,
      role: true,
      status: true,
    },
  });

  let profileInfo;

  if (userInfo.role === UserRole.SUPER_ADMIN) {
    profileInfo = await prisma.admin.findUnique({
      where: {
        email: userInfo.email,
      },
    });
  } else if (userInfo.role === UserRole.ADMIN) {
    profileInfo = await prisma.admin.findUnique({
      where: {
        email: userInfo.email,
      },
    });
  } else if (userInfo.role === UserRole.DOCTOR) {
    profileInfo = await prisma.doctor.findUnique({
      where: {
        email: userInfo.email,
      },
    });
  } else if (userInfo.role === UserRole.PATIENT) {
    profileInfo = await prisma.patient.findUnique({
      where: {
        email: userInfo.email,
      },
    });
  }

  return { ...userInfo, ...profileInfo };
};

// UPDATE MY PROFILE
const updateMyProfileIntoDB = async (
  email: string,
  file: IFile,
  payload: Record<string, unknown>,
) => {
  const userInfo = await prisma.user.findUniqueOrThrow({
    where: {
      email: email,
      status: UserStatus.ACTIVE,
    },
  });

  if (file) {
    const imagePath = file.path;
    const imageName = file.originalname;

    const uploadToCloudinary = await fileUploader.uploadToCloudinary(
      imagePath,
      imageName,
    );
    payload.profilePhoto = uploadToCloudinary?.secure_url;
  }

  let profileInfo;

  if (userInfo.role === UserRole.SUPER_ADMIN) {
    profileInfo = await prisma.admin.update({
      where: {
        email: userInfo.email,
      },
      data: payload,
    });
  } else if (userInfo.role === UserRole.ADMIN) {
    profileInfo = await prisma.admin.update({
      where: {
        email: userInfo.email,
      },
      data: payload,
    });
  } else if (userInfo.role === UserRole.DOCTOR) {
    profileInfo = await prisma.doctor.update({
      where: {
        email: userInfo.email,
      },
      data: payload,
    });
  } else if (userInfo.role === UserRole.PATIENT) {
    profileInfo = await prisma.patient.update({
      where: {
        email: userInfo.email,
      },
      data: payload,
    });
  }

  return { ...profileInfo };
};

export const UserService = {
  createAdminIntoDB,
  createDoctorIntoDB,
  createPatientIntoDB,
  getAllUsersFromDB,
  changeProfileStatusIntoDB,
  getMyProfileFromDB,
  updateMyProfileIntoDB,
};

import { Admin, Prisma, UserStatus } from '@prisma/client';
import { paginationHelper } from '../../../helpers/paginationHelper';
import prisma from '../../../shared/prisma';
import { IPaginationOptions } from '../../interface/pagination.interface';
import { IAdminFilterOptions } from './admin.interface';
import { ADMIN_SEARCHABLE_FIELDS } from './admin.constant';

// GET ALL ADMINS
const getAllAdminsFromDB = async (
  filterOptions: IAdminFilterOptions,
  paginationOptions: IPaginationOptions,
) => {
  const { searchTerm, ...filter } = filterOptions;
  const { limit, page, skip } =
    paginationHelper.calculatePagination(paginationOptions);

  const conditions: Prisma.AdminWhereInput[] = [];

  // manage search
  if (searchTerm) {
    conditions.push({
      OR: ADMIN_SEARCHABLE_FIELDS.map((field) => ({
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
  conditions.push({
    isDeleted: false,
  });

  // manage pagination
  const whereConditions: Prisma.AdminWhereInput =
    conditions.length > 0 ? { AND: conditions } : {};

  const result = await prisma.admin.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      paginationOptions.sortBy && paginationOptions.sortOrder
        ? {
            [paginationOptions.sortBy as string]:
              paginationOptions.sortOrder,
          }
        : { createdAt: 'desc' },
  });

  // get document count
  const total = await prisma.admin.count({
    where: whereConditions,
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

// GET SINGLE ADMIN
const getSingleAdminFromDB = async (id: string): Promise<Admin | null> => {
  const result = await prisma.admin.findUnique({
    where: { id, isDeleted: false },
  });

  return result;
};

// UPDATE ADMIN
const updateAdminIntoDB = async (
  id: string,
  data: Partial<Admin>,
): Promise<Admin> => {
  await prisma.admin.findUniqueOrThrow({
    where: { id, isDeleted: false },
  });

  const result = await prisma.admin.update({
    where: { id },
    data,
  });

  return result;
};

// DELETE ADMIN
const deleteAdminFromDB = async (id: string): Promise<Admin | null> => {
  await prisma.admin.findUniqueOrThrow({
    where: { id },
  });

  const result = await prisma.$transaction(async (transactionClient) => {
    const deletedAdmin = await transactionClient.admin.delete({
      where: { id },
    });

    await transactionClient.user.delete({
      where: { email: deletedAdmin.email },
    });

    return deletedAdmin;
  });

  return result;
};

// SOFT DELETE ADMIN
const softDeleteFromDB = async (id: string): Promise<Admin | null> => {
  await prisma.admin.findUniqueOrThrow({
    where: { id, isDeleted: false },
  });

  const result = await prisma.$transaction(async (transactionClient) => {
    const deletedAdmin = await transactionClient.admin.update({
      where: { id },
      data: { isDeleted: true },
    });

    await transactionClient.user.update({
      where: { email: deletedAdmin.email },
      data: { status: UserStatus.DELETED },
    });

    return deletedAdmin;
  });

  return result;
};

export const AdminService = {
  getAllAdminsFromDB,
  getSingleAdminFromDB,
  updateAdminIntoDB,
  deleteAdminFromDB,
  softDeleteFromDB,
};

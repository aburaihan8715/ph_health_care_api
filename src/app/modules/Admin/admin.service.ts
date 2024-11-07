import { Admin, Prisma, UserStatus } from '@prisma/client';
import { adminSearchAbleFields } from './admin.constant';
import { TAdminFilterRequest } from './admin.interface';
import { TPaginationOptions } from '../../interface/pagination';
import { paginationHelper } from '../../../helpers/paginationHelper';
import prisma from '../../../shared/prisma';

// GET ALL ADMINS
const getAllAdminsFromDB = async (
  queryFilters: TAdminFilterRequest,
  options: TPaginationOptions
) => {
  const { searchTerm, ...filterData } = queryFilters;
  const { limit, page, skip } =
    paginationHelper.calculatePagination(options);
  const andConditions: Prisma.AdminWhereInput[] = [];
  //   console.log(filterData);

  // 01 manage search
  if (searchTerm) {
    andConditions.push({
      OR: adminSearchAbleFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      })),
    });
  }

  // 02 manage filter
  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }

  // 03 skip the deleted documents
  andConditions.push({ isDeleted: false });

  // 04 get documents based on conditions
  const whereConditions = { AND: andConditions };
  const result = await prisma.admin.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy as string]: options.sortOrder }
        : { createdAt: 'desc' },
  });

  // 05 get document count
  const total = await prisma.admin.count({
    where: whereConditions,
  });

  // 06 finally return the result
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
  data: Partial<Admin>
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

/*
import { Admin, Prisma, UserStatus } from "@prisma/client";
import { adminSearchAbleFields } from "./admin.constant";
import { paginationHelper } from "../../../helpars/paginationHelper";
import prisma from "../../../shared/prisma";
import { IAdminFilterRequest } from "./admin.interface";
import { IPaginationOptions } from "../../interfaces/pagination";

const getAllFromDB = async (params: IAdminFilterRequest, options: IPaginationOptions) => {
    const { page, limit, skip } = paginationHelper.calculatePagination(options);
    const { searchTerm, ...filterData } = params;

    const andCondions: Prisma.AdminWhereInput[] = [];

    //console.log(filterData);
    if (params.searchTerm) {
        andCondions.push({
            OR: adminSearchAbleFields.map(field => ({
                [field]: {
                    contains: params.searchTerm,
                    mode: 'insensitive'
                }
            }))
        })
    };

    if (Object.keys(filterData).length > 0) {
        andCondions.push({
            AND: Object.keys(filterData).map(key => ({
                [key]: {
                    equals: (filterData as any)[key]
                }
            }))
        })
    };

    andCondions.push({
        isDeleted: false
    })

    //console.dir(andCondions, { depth: 'inifinity' })
    const whereConditons: Prisma.AdminWhereInput = { AND: andCondions }

    const result = await prisma.admin.findMany({
        where: whereConditons,
        skip,
        take: limit,
        orderBy: options.sortBy && options.sortOrder ? {
            [options.sortBy]: options.sortOrder
        } : {
            createdAt: 'desc'
        }
    });

    const total = await prisma.admin.count({
        where: whereConditons
    });

    return {
        meta: {
            page,
            limit,
            total
        },
        data: result
    };
};

const getByIdFromDB = async (id: string): Promise<Admin | null> => {
    const result = await prisma.admin.findUnique({
        where: {
            id,
            isDeleted: false
        }
    })

    return result;
};

const updateIntoDB = async (id: string, data: Partial<Admin>): Promise<Admin> => {
    await prisma.admin.findUniqueOrThrow({
        where: {
            id,
            isDeleted: false
        }
    });

    const result = await prisma.admin.update({
        where: {
            id
        },
        data
    });

    return result;
};

const deleteFromDB = async (id: string): Promise<Admin | null> => {

    await prisma.admin.findUniqueOrThrow({
        where: {
            id
        }
    });

    const result = await prisma.$transaction(async (transactionClient) => {
        const adminDeletedData = await transactionClient.admin.delete({
            where: {
                id
            }
        });

        await transactionClient.user.delete({
            where: {
                email: adminDeletedData.email
            }
        });

        return adminDeletedData;
    });

    return result;
}


const softDeleteFromDB = async (id: string): Promise<Admin | null> => {
    await prisma.admin.findUniqueOrThrow({
        where: {
            id,
            isDeleted: false
        }
    });

    const result = await prisma.$transaction(async (transactionClient) => {
        const adminDeletedData = await transactionClient.admin.update({
            where: {
                id
            },
            data: {
                isDeleted: true
            }
        });

        await transactionClient.user.update({
            where: {
                email: adminDeletedData.email
            },
            data: {
                status: UserStatus.DELETED
            }
        });

        return adminDeletedData;
    });

    return result;
}


export const AdminService = {
    getAllFromDB,
    getByIdFromDB,
    updateIntoDB,
    deleteFromDB,
    softDeleteFromDB
}
    */

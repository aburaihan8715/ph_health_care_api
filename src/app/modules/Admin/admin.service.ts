import { Admin, Prisma, UserStatus } from '@prisma/client';
// import { paginationHelper } from '../../../helpers/paginationHelper';
import prisma from '../../../shared/prisma';
// import { IPaginationOptions } from '../../interface/pagination.interface';
// import { IAdminFilterOptions } from './admin.interface';
import { ADMIN_SEARCHABLE_FIELDS } from './admin.constant';
import pick from '../../../shared/pick';

// GET ALL ADMINS
// const getAllAdminsFromDB = async (
//   filterOptions: IAdminFilterOptions,
//   paginationOptions: IPaginationOptions,
// ) => {
//   const { searchTerm, ...filter } = filterOptions;
//   const { limit, page, skip } =
//     paginationHelper.calculatePagination(paginationOptions);

//   const andConditions: Prisma.AdminWhereInput[] = [];

//   // manage search
//   if (searchTerm) {
//     andConditions.push({
//       OR: ADMIN_SEARCHABLE_FIELDS.map((field) => ({
//         [field]: {
//           contains: searchTerm,
//           mode: 'insensitive',
//         },
//       })),
//     });
//   }

//   // manage filter
//   if (Object.keys(filter).length > 0) {
//     andConditions.push({
//       AND: Object.entries(filter).map(([key, value]) => ({
//         [key]: { equals: value },
//       })),
//     });
//   }

//   // manage delete
//   andConditions.push({
//     isDeleted: false,
//   });

//   // manage pagination
//   const whereInputs: Prisma.AdminWhereInput =
//     andConditions.length > 0 ? { AND: andConditions } : {};

//   const result = await prisma.admin.findMany({
//     where: whereInputs,
//     skip,
//     take: limit,
//     orderBy:
//       paginationOptions.sortBy && paginationOptions.sortOrder
//         ? {
//             [paginationOptions.sortBy as string]:
//               paginationOptions.sortOrder,
//           }
//         : { createdAt: 'desc' },
//   });

//   // get document count
//   const total = await prisma.admin.count({
//     where: whereInputs,
//   });

//   // finally return the result
//   return {
//     meta: {
//       page,
//       limit,
//       total,
//     },
//     data: result,
//   };
// };

const getAllAdminsFromDB = async (queryObj: Record<string, unknown>) => {
  const searchObj = pick(queryObj, ['searchTerm']);
  const filterObj = pick(queryObj, ['name', 'email', 'contactNumber']);
  const paginationObj = pick(queryObj, ['page', 'limit']);
  const sortedObj = pick(queryObj, ['sortBy', 'sortOrder']);
  const selectFieldsObj = pick(queryObj, ['select']);
  const excludeDeletedFields = true;

  let whereInputs = {};
  const whereInputConditions: Prisma.AdminWhereInput[] = [];
  // manage search
  if (searchObj.searchTerm) {
    whereInputConditions.push({
      OR: ADMIN_SEARCHABLE_FIELDS.map((field) => ({
        [field]: {
          contains: searchObj.searchTerm,
          mode: 'insensitive',
        },
      })),
    });
    whereInputs = { AND: whereInputConditions };
  }

  // manage filter
  if (Object.keys(filterObj).length > 0) {
    whereInputConditions.push({
      AND: Object.entries(filterObj).map(([key, value]) => ({
        [key]: { equals: value },
      })),
    });
    whereInputs = { AND: whereInputConditions };
  }

  // manage isDeleted field
  if (excludeDeletedFields) {
    whereInputConditions.push({
      isDeleted: false,
    });
    whereInputs = { AND: whereInputConditions };
  }

  // manage sorting
  let orderByInputs: Prisma.AdminOrderByWithRelationInput[] = [
    { createdAt: 'desc' },
  ];
  const orderByConditions: Prisma.AdminOrderByWithRelationInput[] = [];

  if (sortedObj.sortBy && sortedObj.sortOrder) {
    const sortBy =
      (sortedObj.sortBy as string)
        .split(',')
        .map((field) => field.trim()) || [];
    const sortOrder =
      (sortedObj.sortOrder as string)
        .split(',')
        .map((order) => order.trim().toLowerCase()) || [];

    for (let i = 0; i < sortBy.length; i++) {
      const field = sortBy[i];
      const order =
        sortOrder[i] === 'asc' || sortOrder[i] === 'desc'
          ? sortOrder[i]
          : 'asc';

      orderByConditions.push({
        [field]: order,
      } as Prisma.AdminOrderByWithRelationInput);
    }
    orderByInputs = orderByConditions;
  }

  // manage select fields
  let selectInputs = undefined;
  if (selectFieldsObj.select) {
    const selectedFields =
      (selectFieldsObj.select as string)
        ?.split(',')
        .map((field) => field.trim()) || [];

    selectInputs = Object.fromEntries(
      selectedFields.map((field) => [field, true]),
    );
  }

  // manage pagination
  const page: number = Number(paginationObj.page) || 1;
  const limit: number = Number(paginationObj.limit) || 10;
  const skip: number = (Number(page) - 1) * limit;
  const total = await prisma.admin.count({
    where: whereInputs,
  });

  const result = await prisma.admin.findMany({
    where: whereInputs,
    skip,
    take: limit,
    orderBy: orderByInputs,
    select: selectInputs,
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
  payload: Partial<Admin>,
): Promise<Admin> => {
  await prisma.admin.findUniqueOrThrow({
    where: { id, isDeleted: false },
  });

  const result = await prisma.admin.update({
    where: { id },
    data: { ...payload },
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

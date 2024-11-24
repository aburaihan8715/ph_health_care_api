import { RequestHandler } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { AdminService } from './admin.service';
import httpStatus from 'http-status';
import pick from '../../../shared/pick';

// GET ALL ADMINS
const getAllAdmins: RequestHandler = catchAsync(async (req, res) => {
  const query = req.query;
  const queryObj = pick(query, [
    'name',
    'email',
    'contactNumber',
    'searchTerm',
  ]);
  const paginationObj = pick(query, [
    'limit',
    'page',
    'sortBy',
    'sortOrder',
  ]);

  const result = await AdminService.getAllAdminsFromDB(
    queryObj,
    paginationObj,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Admins fetched successfully!',
    meta: result.meta,
    data: result.data,
  });
});

// GET SINGLE ADMIN
const getSingleAdmin: RequestHandler = catchAsync(async (req, res) => {
  const { id } = req.params;

  const result = await AdminService.getSingleAdminFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Admin data fetched by id!',
    data: result,
  });
});

// UPDATE ADMIN
const updateAdmin: RequestHandler = catchAsync(async (req, res) => {
  const { id } = req.params;

  const result = await AdminService.updateAdminIntoDB(id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Admin data updated!',
    data: result,
  });
});

// DELETE ADMIN
const deleteAdmin: RequestHandler = catchAsync(async (req, res) => {
  const { id } = req.params;

  const result = await AdminService.deleteAdminFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Admin data deleted!',
    data: result,
  });
});

// SOFT DELETE ADMIN
const softDeleteAdmin: RequestHandler = catchAsync(async (req, res) => {
  const { id } = req.params;

  const result = await AdminService.softDeleteFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Admin data deleted!',
    data: result,
  });
});

export const AdminController = {
  getAllAdmins,
  getSingleAdmin,
  updateAdmin,
  deleteAdmin,
  softDeleteAdmin,
};

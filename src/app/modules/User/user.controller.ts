import { RequestHandler } from 'express';
import { UserService } from './user.service';
import catchAsync from '../../../shared/catchAsync';
import httpStatus from 'http-status';
import sendResponse from '../../../shared/sendResponse';
import pick from '../../../shared/pick';
// import { userFilterableFields } from './user.constant';

// CREATE ADMIN
const createAdmin: RequestHandler = catchAsync(async (req, res) => {
  const result = await UserService.createAdminIntoDB(req.file, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Admin Created successfully!',
    data: result,
  });
});

// CREATE DOCTOR
const createDoctor: RequestHandler = catchAsync(async (req, res) => {
  const result = await UserService.createDoctorIntoDB(req.file, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Doctor Created successfully!',
    data: result,
  });
});

// CREATE PATIENT
const createPatient: RequestHandler = catchAsync(async (req, res) => {
  const result = await UserService.createPatientIntoDB(req.file, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Patient Created successfully!',
    data: result,
  });
});

// GET ALL USERS

// const getAllUsers: RequestHandler = catchAsync(async (req, res) => {
//   const query = req.query;
//   const filters = pick(query, userFilterableFields);
//   const options = pick(query, ['limit', 'page', 'sortBy', 'sortOrder']);

//   const result = await UserService.getAllUsersFromDB(filters, options);

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: 'Users fetched successfully!',
//     meta: result.meta,
//     data: result.data,
//   });
// });

const getAllUsers: RequestHandler = catchAsync(async (req, res) => {
  const query = req.query;
  const searchTermObj = pick(query, ['searchTerm']);
  const filterObj = pick(query, ['email', 'role', 'status']);
  const paginationObj = pick(query, [
    'limit',
    'page',
    'sortBy',
    'sortOrder',
  ]);

  const result = await UserService.getAllUsersFromDB(
    searchTermObj,
    filterObj,
    paginationObj,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Users fetched successfully!',
    meta: result.meta,
    data: result.data,
  });
});

// CHANGE PROFILE STATUS
const changeProfileStatus: RequestHandler = catchAsync(
  async (req, res) => {
    const { id } = req.params;
    const result = await UserService.changeProfileStatusIntoDB(
      id,
      req.body,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Users profile status changed!',
      data: result,
    });
  },
);

export const UserController = {
  createAdmin,
  createDoctor,
  createPatient,
  getAllUsers,
  changeProfileStatus,
};

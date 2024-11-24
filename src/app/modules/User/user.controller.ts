import { Request, RequestHandler, Response } from 'express';
import { UserService } from './user.service';
import catchAsync from '../../../shared/catchAsync';
import httpStatus from 'http-status';
import sendResponse from '../../../shared/sendResponse';
import pick from '../../../shared/pick';
import { IAuthUser } from '../../interface/common';
import { IFile } from '../../interface/file';

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
const getAllUsers: RequestHandler = catchAsync(async (req, res) => {
  const query = req.query;
  const queryObj = pick(query, ['email', 'role', 'status', 'searchTerm']);
  const paginationObj = pick(query, [
    'limit',
    'page',
    'sortBy',
    'sortOrder',
  ]);

  const result = await UserService.getAllUsersFromDB(
    queryObj,
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

// GET MY PROFILE
const getMyProfile = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const email = req.user?.email as string;
    const result = await UserService.getMyProfileFromDB(email);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'My profile data fetched!',
      data: result,
    });
  },
);

// UPDATE MY PROFILE
const updateMyProfile = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const email = req.user?.email as string;

    const result = await UserService.updateMyProfileIntoDB(
      email,
      req.file as IFile,
      req.body,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'My profile updated!',
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
  getMyProfile,
  updateMyProfile,
};

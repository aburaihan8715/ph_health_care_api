import { RequestHandler } from 'express';
import { UserService } from './user.service';
import catchAsync from '../../../shared/catchAsync';
import httpStatus from 'http-status';
import sendResponse from '../../../shared/sendResponse';

const createAdmin: RequestHandler = catchAsync(async (req, res) => {
  const result = await UserService.createAdmin(req);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Admin Created successfully!',
    data: result,
  });
});

export const UserController = {
  createAdmin,
};

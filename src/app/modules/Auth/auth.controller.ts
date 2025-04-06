/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, RequestHandler, Response } from 'express';

import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import { AuthService } from './auth.service';
import sendResponse from '../../../shared/sendResponse';
import config from '../../../config';

// LOGIN USER
const loginUser: RequestHandler = catchAsync(async (req, res) => {
  const result = await AuthService.loginUser(req.body);

  const { accessToken, refreshToken, needPasswordChange } = result;

  res.cookie('refreshToken', refreshToken, {
    secure: config.NODE_ENV === 'production',
    httpOnly: true,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Logged in successfully!',
    data: {
      accessToken,
      needPasswordChange,
    },
  });
});

// REFRESH TOKEN
const refreshToken: RequestHandler = catchAsync(async (req, res) => {
  const { refreshToken } = req.cookies;

  const { accessToken, needPasswordChange } =
    await AuthService.refreshToken(refreshToken);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Access token generated successfully!',
    data: {
      accessToken,
      needPasswordChange,
    },
  });
});

// CHANGE PASSWORD
const changePassword = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const user = req.user;

    const result = await AuthService.changePassword(user, req.body);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Password Changed successfully',
      data: result,
    });
  },
);

// FORGET PASSWORD
const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  await AuthService.forgotPassword(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Check your email!',
    data: null,
  });
});

// RESET PASSWORD
const resetPassword = catchAsync(async (req: Request, res: Response) => {
  let token = '';
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  await AuthService.resetPassword(token, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Password Reset!',
    data: null,
  });
});

export const AuthController = {
  loginUser,
  refreshToken,
  changePassword,
  forgotPassword,
  resetPassword,
};

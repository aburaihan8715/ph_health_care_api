/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import bcrypt from 'bcrypt';

import { UserStatus } from '@prisma/client';
import prisma from '../../../shared/prisma';
import { ILogin } from './auth.constant';
import { jwtHelpers } from '../../../helpers/jwtHelpers';
import { Secret } from 'jsonwebtoken';
import config from '../../../config';
import emailSender from './emailSender';
import ApiError from '../../errors/ApiError';

// LOGIN
const loginUser = async (payload: ILogin) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email,
      status: UserStatus.ACTIVE,
    },
  });

  const isCorrectPassword: boolean = await bcrypt.compare(
    payload.password,
    userData.password,
  );

  if (!isCorrectPassword) {
    throw new Error('Password incorrect!');
  }
  const accessToken = jwtHelpers.generateToken(
    {
      email: userData.email,
      role: userData.role,
    },
    config.JWT.jwt_access_secret as Secret,
    config.JWT.jwt_access_expires_in as string,
  );

  const refreshToken = jwtHelpers.generateToken(
    {
      email: userData.email,
      role: userData.role,
    },
    config.JWT.jwt_refresh_secret as Secret,
    config.JWT.jwt_refresh_expires_in as string,
  );

  return {
    accessToken,
    refreshToken,
    needPasswordChange: userData.needPasswordChange,
  };
};

// REFRESH TOKEN
const refreshToken = async (token: string) => {
  let decodedData;
  try {
    decodedData = jwtHelpers.verifyToken(
      token,
      config.JWT.jwt_refresh_secret as Secret,
    );
  } catch (err) {
    throw new Error('You are not authorized!');
  }

  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: decodedData.email,
      status: UserStatus.ACTIVE,
    },
  });

  const accessToken = jwtHelpers.generateToken(
    {
      email: userData.email,
      role: userData.role,
    },
    config.JWT.jwt_access_secret as Secret,
    config.JWT.jwt_access_expires_in as string,
  );

  return {
    accessToken,
    needPasswordChange: userData.needPasswordChange,
  };
};

// CHANGE PASSWORD
const changePassword = async (user: any, payload: any) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: user.email,
      status: UserStatus.ACTIVE,
    },
  });

  const isCorrectPassword: boolean = await bcrypt.compare(
    payload.oldPassword,
    userData.password,
  );

  if (!isCorrectPassword) {
    throw new Error('Password incorrect!');
  }

  const hashedPassword: string = await bcrypt.hash(
    payload.newPassword,
    10,
  );

  await prisma.user.update({
    where: {
      email: userData.email,
    },
    data: {
      password: hashedPassword,
      needPasswordChange: false,
    },
  });

  return {
    message: 'Password changed successfully!',
  };
};

// FORGET PASSWORD
const forgotPassword = async (payload: { email: string }) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email,
      status: UserStatus.ACTIVE,
    },
  });

  const resetPassToken = jwtHelpers.generateToken(
    { email: userData.email, role: userData.role },
    config.JWT.jwt_password_reset_secret as Secret,
    config.JWT.jwt_password_reset_expires_in as string,
  );

  //console.log(resetPassToken)

  const passwordResetUILink = `${config.reset_pass_ui_link}?userId=${userData.id}&token=${resetPassToken}`;

  const html = `
      <div>
          <p>Dear User,</p>
          <p>Your password reset link 
              <a href=${passwordResetUILink}>
                  <button>
                      Reset Password
                  </button>
              </a>
          </p>
      </div>
      `;

  await emailSender(userData.email, html);
  //console.log(resetPassLink)
};

// RESET PASSWORD
const resetPassword = async (
  token: string,
  payload: { id: string; password: string },
) => {
  await prisma.user.findUniqueOrThrow({
    where: {
      id: payload.id,
      status: UserStatus.ACTIVE,
    },
  });

  const isValidToken = jwtHelpers.verifyToken(
    token,
    config.JWT.jwt_password_reset_secret as Secret,
  );

  if (!isValidToken) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden!');
  }

  // hash password
  const password = await bcrypt.hash(payload.password, 10);

  // update into database
  await prisma.user.update({
    where: {
      id: payload.id,
    },
    data: {
      password,
    },
  });
};

export const AuthService = {
  loginUser,
  refreshToken,
  changePassword,
  forgotPassword,
  resetPassword,
};

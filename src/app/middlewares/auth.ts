/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express';

import config from '../../config';
import { Secret } from 'jsonwebtoken';

import httpStatus from 'http-status';
import ApiError from '../errors/ApiError';
import { jwtHelpers } from '../../helpers/jwtHelpers';

const auth = (...roles: string[]) => {
  return async (
    req: Request & { user?: any },
    res: Response,
    next: NextFunction,
  ) => {
    try {
      let token = '';
      if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
      ) {
        token = req.headers.authorization.split(' ')[1];
      }

      if (!token) {
        throw new ApiError(
          httpStatus.UNAUTHORIZED,
          'You are not logged in! Please log in to get access',
        );
      }

      const verifiedUser = jwtHelpers.verifyToken(
        token,
        config.JWT_ACCESS_SECRET as Secret,
      );

      if (roles.length && !roles.includes(verifiedUser.role)) {
        throw new ApiError(
          httpStatus.FORBIDDEN,
          'You have no permission to access this route!',
        );
      }
      req.user = verifiedUser;
      next();
    } catch (err) {
      next(err);
    }
  };
};

export default auth;

/* eslint-disable @typescript-eslint/no-unused-vars */
import { RequestHandler } from 'express';
import httpStatus from 'http-status';

const notFoundRouteHandler: RequestHandler = (req, res, next) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: 'API NOT FOUND!',
    error: {
      path: req.originalUrl,
      message: 'Your requested path is not found!',
    },
  });
};

export default notFoundRouteHandler;

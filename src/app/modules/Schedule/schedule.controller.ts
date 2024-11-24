import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { ScheduleService } from './schedule.service';
import httpStatus from 'http-status';
import { IAuthUser } from '../../interface/common';
import pick from '../../../shared/pick';

const createSchedule = catchAsync(async (req, res) => {
  const result = await ScheduleService.createScheduleIntoDB(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Schedule created successfully!',
    data: result,
  });
});

const getAllSchedules = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const query = req.query;
    const email = req.user?.email;
    const queryObj = pick(query, ['startDate', 'endDate']);
    const paginationObj = pick(query, [
      'limit',
      'page',
      'sortBy',
      'sortOrder',
    ]);

    const result = await ScheduleService.getAllSchedulesFromDB(
      queryObj,
      paginationObj,
      email,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Schedule fetched successfully!',
      data: result,
    });
  },
);

const getSingleSchedule = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await ScheduleService.getSingleScheduleFromDB();
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Schedule retrieval successfully',
      data: result,
    });
  },
);

const deleteSchedule = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ScheduleService.deleteScheduleFromDB();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Schedule deleted successfully',
    data: result,
  });
});

export const ScheduleController = {
  createSchedule,
  getAllSchedules,
  getSingleSchedule,
  deleteSchedule,
};

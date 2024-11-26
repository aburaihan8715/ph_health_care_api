import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { ScheduleService } from './schedule.service';
import httpStatus from 'http-status';
import { IAuthUser } from '../../interface/auth.interface';
import pick from '../../../shared/pick';

const createSchedule = catchAsync(async (req, res) => {
  const result = await ScheduleService.createScheduleIntoDB(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Schedules created successfully!',
    data: result,
  });
});

const getAllSchedules = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const query = req.query;
    const email = req.user?.email as string;
    const filterOptions = pick(query, ['startDate', 'endDate']);
    const paginationOptions = pick(query, [
      'limit',
      'page',
      'sortBy',
      'sortOrder',
    ]);

    const result = await ScheduleService.getAllSchedulesFromDB(
      filterOptions,
      paginationOptions,
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
    const result = await ScheduleService.getSingleScheduleFromDB(id);
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
  const result = await ScheduleService.deleteScheduleFromDB(id);
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

import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { DoctorScheduleService } from './doctorSchedule.service';
import { IAuthUser } from '../../interface/auth.interface';
import pick from '../../../shared/pick';
import httpStatus from 'http-status';

const createDoctorSchedule = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const user = req.user;
    const result = await DoctorScheduleService.createDoctorScheduleIntoDB(
      user as IAuthUser,
      req.body,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Doctor Schedule created successfully!',
      data: result,
    });
  },
);

const getAllDoctorsSchedules = catchAsync(async (req, res) => {
  const filterOptions = pick(req.query, [
    'searchTerm',
    'isBooked',
    'doctorId',
  ]);

  const paginationOptions = pick(req.query, [
    'limit',
    'page',
    'sortBy',
    'sortOrder',
  ]);

  const result = await DoctorScheduleService.getAllDoctorsSchedulesFromDB(
    filterOptions,
    paginationOptions,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Doctor Schedule retrieval successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getMySchedules = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const filterOptions = pick(req.query, [
      'startDate',
      'endDate',
      'isBooked',
    ]);
    const paginationOptions = pick(req.query, [
      'limit',
      'page',
      'sortBy',
      'sortOrder',
    ]);

    const result = await DoctorScheduleService.getMySchedulesFromDB(
      filterOptions,
      paginationOptions,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'My Schedule fetched successfully!',
      data: result,
    });
  },
);

const deleteDoctorSchedule = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const user = req.user;
    const { id } = req.params;
    const result = await DoctorScheduleService.deleteDoctorScheduleFromDB(
      user as IAuthUser,
      id,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'My Schedule deleted successfully!',
      data: result,
    });
  },
);

export const DoctorScheduleController = {
  createDoctorSchedule,
  getAllDoctorsSchedules,
  getMySchedules,
  deleteDoctorSchedule,
};

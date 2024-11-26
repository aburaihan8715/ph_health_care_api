/* eslint-disable @typescript-eslint/no-explicit-any */
import { Prisma } from '@prisma/client';
import { paginationHelper } from '../../../helpers/paginationHelper';
import prisma from '../../../shared/prisma';
import { IAuthUser } from '../../interface/auth.interface';
import { IPaginationOptions } from '../../interface/pagination.interface';
import ApiError from '../../errors/ApiError';
import { IDoctorScheduleFilterOptions } from './doctorSchedule.interface';

const createDoctorScheduleIntoDB = async (
  user: IAuthUser,
  payload: {
    scheduleIds: string[];
  },
) => {
  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });

  const doctorScheduleData = payload.scheduleIds.map((scheduleId) => ({
    doctorId: doctorData.id,
    scheduleId,
  }));

  const result = await prisma.doctorSchedules.createMany({
    data: doctorScheduleData,
  });

  return result;
};

const getAllDoctorsSchedulesFromDB = async (
  filterOptions: IDoctorScheduleFilterOptions,
  paginationOptions: IPaginationOptions,
) => {
  const { limit, page, skip } =
    paginationHelper.calculatePagination(paginationOptions);
  const { searchTerm, ...filter } = filterOptions;
  const conditions = [];

  if (searchTerm) {
    conditions.push({
      doctor: {
        name: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      },
    });
  }

  if (Object.keys(filter).length > 0) {
    if (
      typeof filter.isBooked === 'string' &&
      filter.isBooked === 'true'
    ) {
      filter.isBooked = true;
    } else if (
      typeof filter.isBooked === 'string' &&
      filter.isBooked === 'false'
    ) {
      filter.isBooked = false;
    }
    conditions.push({
      AND: Object.entries(filter).map(([key, value]) => ({
        [key]: { equals: value },
      })),
    });
  }

  const whereConditions: any =
    conditions.length > 0 ? { AND: conditions } : {};
  const result = await prisma.doctorSchedules.findMany({
    include: {
      doctor: true,
      schedule: true,
    },
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      paginationOptions.sortBy && paginationOptions.sortOrder
        ? { [paginationOptions.sortBy]: paginationOptions.sortOrder }
        : {},
  });
  const total = await prisma.doctorSchedules.count({
    where: whereConditions,
  });

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: result,
  };
};

const getMySchedulesFromDB = async (
  filterOptions: any,
  paginationOptions: IPaginationOptions,
) => {
  const { limit, page, skip } =
    paginationHelper.calculatePagination(paginationOptions);
  const { startDate, endDate, ...filter } = filterOptions;

  const conditions = [];

  if (startDate && endDate) {
    conditions.push({
      AND: [
        {
          schedule: {
            startDateAndTime: {
              gte: startDate,
            },
          },
        },
        {
          schedule: {
            endDateAndTime: {
              lte: endDate,
            },
          },
        },
      ],
    });
  }

  if (Object.keys(filter).length > 0) {
    if (
      typeof filter.isBooked === 'string' &&
      filter.isBooked === 'true'
    ) {
      filter.isBooked = true;
    } else if (
      typeof filter.isBooked === 'string' &&
      filter.isBooked === 'false'
    ) {
      filter.isBooked = false;
    }

    conditions.push({
      AND: Object.entries(filter).map(([key, value]) => ({
        [key]: { equals: value },
      })),
    });
  }

  const whereConditions: Prisma.DoctorSchedulesWhereInput =
    conditions.length > 0 ? { AND: conditions } : {};

  const result = await prisma.doctorSchedules.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      paginationOptions.sortBy && paginationOptions.sortOrder
        ? { [paginationOptions.sortBy]: paginationOptions.sortOrder }
        : {},
  });
  const total = await prisma.doctorSchedules.count({
    where: whereConditions,
  });

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: result,
  };
};

const deleteDoctorScheduleFromDB = async (
  user: IAuthUser,
  scheduleId: string,
) => {
  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
      email: user?.email,
    },
  });

  const isBookedSchedule = await prisma.doctorSchedules.findFirst({
    where: {
      doctorId: doctorData.id,
      scheduleId: scheduleId,
      isBooked: true,
    },
  });

  if (isBookedSchedule) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'You can not delete the schedule because of the schedule is already booked!',
    );
  }

  const result = await prisma.doctorSchedules.delete({
    where: {
      doctorId_scheduleId: {
        doctorId: doctorData.id,
        scheduleId: scheduleId,
      },
    },
  });
  return result;
};

export const DoctorScheduleService = {
  createDoctorScheduleIntoDB,
  getAllDoctorsSchedulesFromDB,
  getMySchedulesFromDB,
  deleteDoctorScheduleFromDB,
};

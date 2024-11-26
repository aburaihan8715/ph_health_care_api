import { addHours, addMinutes, format } from 'date-fns';
import prisma from '../../../shared/prisma';
import { Prisma, Schedule } from '@prisma/client';
import { ISchedule, IScheduleFilterOptions } from './schedule.interface';
import { paginationHelper } from '../../../helpers/paginationHelper';
import { IPaginationOptions } from '../../interface/pagination.interface';

const createScheduleIntoDB = async (
  payload: ISchedule,
): Promise<Schedule[]> => {
  const { startDate, endDate, startTime, endTime } = payload;

  const intervalTime = 30;

  const schedules = [];

  const convertedStartDate = new Date(startDate); // start date
  const convertedEndDate = new Date(endDate); // end date

  while (convertedStartDate <= convertedEndDate) {
    // 09:30  ---> ['09', '30']
    const startDateTotalWithTime = new Date(
      addMinutes(
        addHours(
          `${format(convertedStartDate, 'yyyy-MM-dd')}`,
          Number(startTime.split(':')[0]),
        ),
        Number(startTime.split(':')[1]),
      ),
    );

    const endDateTotalWithTime = new Date(
      addMinutes(
        addHours(
          `${format(convertedStartDate, 'yyyy-MM-dd')}`,
          Number(endTime.split(':')[0]),
        ),
        Number(endTime.split(':')[1]),
      ),
    );

    while (startDateTotalWithTime < endDateTotalWithTime) {
      const scheduleData = {
        startDateAndTime: startDateTotalWithTime,
        endDateAndTime: addMinutes(startDateTotalWithTime, intervalTime),
      };

      const existingSchedule = await prisma.schedule.findFirst({
        where: {
          startDateAndTime: scheduleData.startDateAndTime,
          endDateAndTime: scheduleData.endDateAndTime,
        },
      });

      if (!existingSchedule) {
        const result = await prisma.schedule.create({
          data: scheduleData,
        });
        schedules.push(result);
      }

      startDateTotalWithTime.setMinutes(
        startDateTotalWithTime.getMinutes() + intervalTime,
      );
    }

    convertedStartDate.setDate(convertedStartDate.getDate() + 1);
  }

  return schedules;
};

const getAllSchedulesFromDB = async (
  filterOptions: IScheduleFilterOptions,
  paginationOptions: IPaginationOptions,
  email: string,
) => {
  const { startDate, endDate, ...filter } = filterOptions;
  const { limit, page, skip } =
    paginationHelper.calculatePagination(paginationOptions);

  const conditions: Prisma.ScheduleWhereInput[] = [];

  if (startDate && endDate) {
    conditions.push({
      AND: [
        {
          startDateAndTime: {
            gte: startDate,
          },
        },
        {
          endDateAndTime: {
            lte: endDate,
          },
        },
      ],
    });
  }

  // manage filter
  if (Object.keys(filter).length > 0) {
    conditions.push({
      AND: Object.entries(filter).map(([key, value]) => ({
        [key]: { equals: value },
      })),
    });
  }

  // manage doctor schedules
  const doctorSchedules = await prisma.doctorSchedules.findMany({
    where: {
      doctor: { email },
    },
  });

  // manage pagination
  const doctorScheduleIds = doctorSchedules.map(
    (schedule) => schedule.scheduleId,
  );

  const whereConditions: Prisma.ScheduleWhereInput =
    conditions.length > 0 ? { AND: conditions } : {};

  const result = await prisma.schedule.findMany({
    where: {
      ...whereConditions,
      id: {
        notIn: doctorScheduleIds,
      },
    },
    skip,
    take: limit,
    orderBy:
      paginationOptions.sortBy && paginationOptions.sortOrder
        ? { [paginationOptions.sortBy]: paginationOptions.sortOrder }
        : {
            createdAt: 'desc',
          },
  });

  const total = await prisma.schedule.count({
    where: {
      ...whereConditions,
      id: {
        notIn: doctorScheduleIds,
      },
    },
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

const getSingleScheduleFromDB = async (
  id: string,
): Promise<Schedule | null> => {
  const result = await prisma.schedule.findUnique({
    where: {
      id,
    },
  });
  return result;
};

const deleteScheduleFromDB = async (id: string): Promise<Schedule> => {
  const result = await prisma.schedule.delete({
    where: {
      id,
    },
  });
  return result;
};

export const ScheduleService = {
  createScheduleIntoDB,
  getAllSchedulesFromDB,
  getSingleScheduleFromDB,
  deleteScheduleFromDB,
};

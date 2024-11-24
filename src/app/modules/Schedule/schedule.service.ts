const createScheduleIntoDB = async (payload) => {
  const { startDate, endDate, startTime, endTime } = payload;
};

const getAllSchedulesFromDB = async (queryObj, paginationObj, email) => {};
const getSingleScheduleFromDB = async () => {};
const deleteScheduleFromDB = async () => {};

export const ScheduleService = {
  createScheduleIntoDB,
  getAllSchedulesFromDB,
  getSingleScheduleFromDB,
  deleteScheduleFromDB,
};

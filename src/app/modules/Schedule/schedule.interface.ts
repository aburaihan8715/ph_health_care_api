export interface ISchedule {
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
}

export interface IScheduleFilterOptions {
  startDate?: string | undefined;
  endDate?: string | undefined;
}

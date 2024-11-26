import express from 'express';
import { DoctorScheduleController } from './doctorSchedule.controller';
import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';
import validateRequest from '../../middlewares/validateRequest';
import { DoctorScheduleValidation } from './doctorSchedule.validation';

const router = express.Router();

router.get(
  '/',
  auth(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.DOCTOR,
    UserRole.PATIENT,
  ),
  DoctorScheduleController.getAllDoctorsSchedules,
);

router.get(
  '/my-schedules',
  auth(UserRole.DOCTOR),
  DoctorScheduleController.getMySchedules,
);

router.post(
  '/',
  auth(UserRole.DOCTOR),
  validateRequest(
    DoctorScheduleValidation.createDoctorScheduleValidationSchema,
  ),
  DoctorScheduleController.createDoctorSchedule,
);

router.delete(
  '/:id',
  auth(UserRole.DOCTOR),
  DoctorScheduleController.deleteDoctorSchedule,
);

export const DoctorScheduleRoutes = router;

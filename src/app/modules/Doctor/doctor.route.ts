import express from 'express';
import { DoctorController } from './doctor.controller';
import validateRequest from '../../middlewares/validateRequest';
import { DoctorValidation } from './doctor.validation';
import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';

const router = express.Router();

router.get(
  '/',
  auth(UserRole.SUPER_ADMIN, UserRole.DOCTOR),
  DoctorController.getAllDoctors,
);

router.get(
  '/:id',
  auth(UserRole.SUPER_ADMIN, UserRole.DOCTOR),
  DoctorController.getSingleDoctor,
);

router.patch(
  '/:id',
  auth(UserRole.SUPER_ADMIN, UserRole.DOCTOR),
  validateRequest(DoctorValidation.doctorUpdateValidationSchema),
  DoctorController.updateDoctor,
);

router.delete(
  '/:id',
  auth(UserRole.SUPER_ADMIN, UserRole.DOCTOR),
  DoctorController.deleteDoctor,
);

router.delete(
  '/soft/:id',
  auth(UserRole.SUPER_ADMIN, UserRole.DOCTOR),
  DoctorController.softDeleteDoctor,
);

export const DoctorRoutes = router;

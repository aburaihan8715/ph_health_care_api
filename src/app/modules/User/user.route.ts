import express from 'express';
import { UserController } from './user.controller';
import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';
import { fileUploader } from '../../../helpers/fileUploader';
import parseBodyString from '../../middlewares/parseBodyString';
import validateRequest from '../../middlewares/validateRequest';
import { UserValidation } from './user.validation';

const router = express.Router();

// CREATE ADMIN
router.post(
  '/create-admin',
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  fileUploader.upload.single('file'),
  parseBodyString(),
  validateRequest(UserValidation.createAdminValidationSchema),
  UserController.createAdmin,
);

// CREATE DOCTOR
router.post(
  '/create-doctor',
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  fileUploader.upload.single('file'),
  parseBodyString(),
  validateRequest(UserValidation.createDoctorValidationSchema),
  UserController.createDoctor,
);

// CREATE PATIENT
router.post(
  '/create-patient',
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  fileUploader.upload.single('file'),
  parseBodyString(),
  validateRequest(UserValidation.createPatientValidationSchema),
  UserController.createPatient,
);

// GET ALL USERS
router.get(
  '/',
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  UserController.getAllUsers,
);

// CHANGE PROFILE STATUS
router.patch(
  '/:id/change-status',
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateRequest(UserValidation.changeUserStatusValidationSchema),
  UserController.changeProfileStatus,
);

export const UserRoutes = router;

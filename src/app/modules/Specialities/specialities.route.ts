import express from 'express';
import { fileUploader } from '../../../helpers/fileUploader';
import parseBodyString from '../../middlewares/parseBodyString';
import { SpecialitiesController } from './specialities.controller';
import validateRequest from '../../middlewares/validateRequest';
import { SpecialitiesValidation } from './specialities.validation';
import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';

const router = express.Router();

// CREATE SPECIAlities
router.post(
  '/',
  fileUploader.upload.single('file'),
  parseBodyString(),
  validateRequest(
    SpecialitiesValidation.createSpecialitiesValidationSchema,
  ),
  SpecialitiesController.createSpecialities,
);

// GET ALL SPECIALITIES
router.get('/', SpecialitiesController.getAllSpecialities);

// DELETE SPECIALITIES
router.delete(
  '/:id',
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  SpecialitiesController.deleteSpecialities,
);

export const SpecialitiesRoutes = router;

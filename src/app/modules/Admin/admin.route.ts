import express from 'express';
import { AdminController } from './admin.controller';
import validateRequest from '../../middlewares/validateRequest';
import { AdminValidation } from './admin.validations';

const router = express.Router();

router.get('/', AdminController.getAllAdmins);
router.get('/:id', AdminController.getSingleAdmin);
router.patch(
  '/:id',
  validateRequest(AdminValidation.updateSchema),
  AdminController.updateAdmin,
);
router.delete('/:id', AdminController.deleteAdmin);
router.delete('/soft/:id', AdminController.softDeleteAdmin);

export const AdminRoutes = router;

/*
import express, { NextFunction, Request, Response } from 'express';
import { AdminController } from './admin.controller';
import validateRequest from '../../middlewares/validateRequest';
import { adminValidationSchemas } from './admin.validations';
import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';

const router = express.Router();

router.get(
    '/',
    auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
    AdminController.getAllFromDB
);

router.get(
    '/:id',
    auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
    AdminController.getByIdFromDB
);

router.patch(
    '/:id',
    auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
    validateRequest(adminValidationSchemas.update),
    AdminController.updateIntoDB
);

router.delete(
    '/:id',
    auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
    AdminController.deleteFromDB
);

router.delete(
    '/soft/:id',
    auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
    AdminController.softDeleteFromDB
);

export const AdminRoutes = router;
*/

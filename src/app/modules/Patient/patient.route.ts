import express from 'express';
import { PatientController } from './patient.controller';

const router = express.Router();

router.get('/', PatientController.getAllPatients);

router.get('/:id', PatientController.getSinglePatient);

router.patch('/:id', PatientController.updatePatient);

router.delete('/:id', PatientController.deletePatient);

router.delete('/soft/:id', PatientController.softDeletePatient);

export const PatientRoutes = router;

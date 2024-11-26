import { RequestHandler } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import httpStatus from 'http-status';
import pick from '../../../shared/pick';
import { PatientService } from './patient.service';

// GET ALL PATIENTS
const getAllPatients: RequestHandler = catchAsync(async (req, res) => {
  const query = req.query;
  const filterOptions = pick(query, ['searchTerm', 'email', 'contactNo']);
  const paginationOptions = pick(query, [
    'limit',
    'page',
    'sortBy',
    'sortOrder',
  ]);

  const result = await PatientService.getAllPatientsFromDB(
    filterOptions,
    paginationOptions,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Patients fetched successfully!',
    meta: result.meta,
    data: result.data,
  });
});

// GET SINGLE PATIENT
const getSinglePatient: RequestHandler = catchAsync(async (req, res) => {
  const { id } = req.params;

  const result = await PatientService.getSinglePatientFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Patient data fetched by id!',
    data: result,
  });
});

// UPDATE PATIENT
const updatePatient: RequestHandler = catchAsync(async (req, res) => {
  const { id } = req.params;

  const result = await PatientService.updatePatientIntoDB(id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Patient data updated!',
    data: result,
  });
});

// DELETE PATIENT
const deletePatient: RequestHandler = catchAsync(async (req, res) => {
  const { id } = req.params;

  const result = await PatientService.deletePatientFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Patient data deleted!',
    data: result,
  });
});

// SOFT DELETE PATIENT
const softDeletePatient: RequestHandler = catchAsync(async (req, res) => {
  const { id } = req.params;

  const result = await PatientService.softDeletePatientFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Patient data deleted!',
    data: result,
  });
});

export const PatientController = {
  getAllPatients,
  getSinglePatient,
  updatePatient,
  deletePatient,
  softDeletePatient,
};

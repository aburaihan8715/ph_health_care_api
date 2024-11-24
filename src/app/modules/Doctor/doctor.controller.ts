import { RequestHandler } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import httpStatus from 'http-status';
import pick from '../../../shared/pick';
import { DoctorService } from './doctor.service';

// GET ALL DOCTORS
const getAllDoctors: RequestHandler = catchAsync(async (req, res) => {
  const query = req.query;
  const queryObj = pick(query, [
    'email',
    'contactNumber',
    'gender',
    'appointmentFee',
    'specialities',
    'searchTerm',
  ]);
  const paginationObj = pick(query, [
    'limit',
    'page',
    'sortBy',
    'sortOrder',
  ]);

  const result = await DoctorService.getAllDoctorsFromDB(
    queryObj,
    paginationObj,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Doctors fetched successfully!',
    meta: result.meta,
    data: result.data,
  });
});
// GET SINGLE DOCTOR
const getSingleDoctor: RequestHandler = catchAsync(async (req, res) => {
  const { id } = req.params;

  const result = await DoctorService.getSingleDoctorFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Doctor data fetched by id!',
    data: result,
  });
});

// UPDATE DOCTOR
const updateDoctor: RequestHandler = catchAsync(async (req, res) => {
  const { id } = req.params;

  const result = await DoctorService.updateDoctorIntoDB(id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Doctor data updated!',
    data: result,
  });
});

// DELETE DOCTOR
const deleteDoctor: RequestHandler = catchAsync(async (req, res) => {
  const { id } = req.params;

  const result = await DoctorService.deleteDoctorFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Doctor data deleted!',
    data: result,
  });
});

// SOFT DELETE DOCTOR
const softDeleteDoctor: RequestHandler = catchAsync(async (req, res) => {
  const { id } = req.params;

  const result = await DoctorService.softDeleteDoctorFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Doctor data deleted!',
    data: result,
  });
});

export const DoctorController = {
  getAllDoctors,
  getSingleDoctor,
  updateDoctor,
  deleteDoctor,
  softDeleteDoctor,
};

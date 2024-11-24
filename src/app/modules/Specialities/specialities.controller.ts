import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { SpecialitiesService } from './specialities.service';
import httpStatus from 'http-status';

// CREATE SPECIALITIES
const createSpecialities = catchAsync(async (req, res) => {
  const result = await SpecialitiesService.createSpecialitiesIntoDB(
    req.file,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Specialities created successfully!',
    data: result,
  });
});

// GET ALL SPECIALITIES
const getAllSpecialities = catchAsync(async (req, res) => {
  const result = await SpecialitiesService.getAllSpecialitiesFromDB();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Specialities data fetched successfully',
    data: result,
  });
});

// DELETE SPECIAlities
const deleteSpecialities = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await SpecialitiesService.deleteSpecialitiesFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Speciality deleted successfully',
    data: result,
  });
});

export const SpecialitiesController = {
  createSpecialities,
  getAllSpecialities,
  deleteSpecialities,
};

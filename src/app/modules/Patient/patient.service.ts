import { Patient, Prisma, UserStatus } from '@prisma/client';
import { paginationHelper } from '../../../helpers/paginationHelper';
import prisma from '../../../shared/prisma';
import {
  IPatientFilterOptions,
  IPatientUpdate,
} from './patient.interface';
import { IPaginationOptions } from '../../interface/pagination.interface';
import { PATIENT_SEARCHABLE_FIELDS } from './patient.constant';

// GET ALL PATIENTS
const getAllPatientsFromDB = async (
  filterOptions: IPatientFilterOptions,
  paginationOptions: IPaginationOptions,
) => {
  const { searchTerm, ...filter } = filterOptions;
  const { limit, page, skip } =
    paginationHelper.calculatePagination(paginationOptions);
  const conditions: Prisma.PatientWhereInput[] = [];

  // manage search
  if (searchTerm) {
    conditions.push({
      OR: PATIENT_SEARCHABLE_FIELDS.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      })),
    });
  }

  // manage filter
  if (Object.keys(filter).length > 0) {
    conditions.push({
      AND: Object.entries(filter).map(([key, value]) => ({
        [key]: { equals: value },
      })),
    });
  }

  // manage deleted
  conditions.push({
    isDeleted: false,
  });

  // manage pagination
  const whereConditions: Prisma.PatientWhereInput =
    conditions.length > 0 ? { AND: conditions } : {};

  const result = await prisma.patient.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      paginationOptions.sortBy && paginationOptions.sortOrder
        ? {
            [paginationOptions.sortBy as string]:
              paginationOptions.sortOrder,
          }
        : { createdAt: 'desc' },
    include: {
      medicalReport: true,
      patientHealthData: true,
    },
  });

  // get document count
  const total = await prisma.patient.count({
    where: whereConditions,
  });

  // finally return the result
  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

// GET SINGLE PATIENT
const getSinglePatientFromDB = async (
  id: string,
): Promise<Patient | null> => {
  const result = await prisma.patient.findUnique({
    where: { id, isDeleted: false },
    include: {
      medicalReport: true,
      patientHealthData: true,
    },
  });

  return result;
};

// UPDATE PATIENT
const updatePatientIntoDB = async (
  id: string,
  payload: IPatientUpdate,
) => {
  const { patientHealthData, medicalReport, ...patientData } = payload;

  const patientInfo = await prisma.patient.findUniqueOrThrow({
    where: {
      id,
      isDeleted: false,
    },
  });

  await prisma.$transaction(async (transactionClient) => {
    //update patient data
    await transactionClient.patient.update({
      where: {
        id,
      },
      data: patientData,
      include: {
        patientHealthData: true,
        medicalReport: true,
      },
    });

    // create or update patient health data
    if (patientHealthData) {
      await transactionClient.patientHealthData.upsert({
        where: {
          patientId: patientInfo.id,
        },
        update: patientHealthData,
        create: { ...patientHealthData, patientId: patientInfo.id },
      });
    }

    if (medicalReport) {
      await transactionClient.medicalReport.create({
        data: { ...medicalReport, patientId: patientInfo.id },
      });
    }
  });

  const responseData = await prisma.patient.findUnique({
    where: {
      id: patientInfo.id,
    },
    include: {
      patientHealthData: true,
      medicalReport: true,
    },
  });
  return responseData;
};

// DELETE PATIENT
const deletePatientFromDB = async (
  id: string,
): Promise<Patient | null> => {
  const result = await prisma.$transaction(async (transactionClient) => {
    await transactionClient.medicalReport.deleteMany({
      where: {
        patientId: id,
      },
    });

    // delete patient health data
    await transactionClient.patientHealthData.delete({
      where: {
        patientId: id,
      },
    });

    const deletedPatient = await transactionClient.patient.delete({
      where: {
        id,
      },
    });

    await transactionClient.user.delete({
      where: {
        email: deletedPatient.email,
      },
    });

    return deletedPatient;
  });

  return result;
};

// SOFT DELETE PATIENT
const softDeletePatientFromDB = async (
  id: string,
): Promise<Patient | null> => {
  return await prisma.$transaction(async (transactionClient) => {
    const deletedPatient = await transactionClient.patient.update({
      where: { id },
      data: {
        isDeleted: true,
      },
    });

    await transactionClient.user.update({
      where: {
        email: deletedPatient.email,
      },
      data: {
        status: UserStatus.DELETED,
      },
    });

    return deletedPatient;
  });
};

export const PatientService = {
  getAllPatientsFromDB,
  getSinglePatientFromDB,
  updatePatientIntoDB,
  deletePatientFromDB,
  softDeletePatientFromDB,
};

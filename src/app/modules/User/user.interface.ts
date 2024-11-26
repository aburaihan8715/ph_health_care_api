import { Admin, Doctor, Patient } from '@prisma/client';

export interface IAdminPayload {
  password: string;
  admin: Partial<Admin>;
}

export interface IDoctorPayload {
  password: string;
  doctor: Partial<Doctor>;
}

export interface IPatientPayload {
  password: string;
  patient: Partial<Patient>;
}

export interface IUserFilterOptions {
  email?: string;
  role?: string;
  status?: string;
  searchTerm?: string;
}

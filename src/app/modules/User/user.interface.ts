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

export interface IUserSearchTerm {
  searchTerm?: string;
}
export interface IUserFilter {
  email?: string;
  role?: string;
  status?: string;
}

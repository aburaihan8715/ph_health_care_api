export interface IDoctorQueryObj {
  searchTerm?: string;
  email?: string;
  contactNo?: string;
  gender?: string;
  specialities?: string;
}

export interface IDoctorUpdate {
  name: string;
  profilePhoto: string;
  contactNumber: string;
  address: string;
  registrationNumber: string;
  experience: number;
  gender: 'MALE' | 'FEMALE';
  appointmentFee: number;
  qualification: string;
  currentWorkingPlace: string;
  designation: string;
  specialities: ISpecialities[];
}

export interface ISpecialities {
  specialitiesId: string;
  isDeleted?: null;
}
